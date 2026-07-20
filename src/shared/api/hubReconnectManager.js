/**
 * Maneja la reconexión de una conexión SignalR más allá de lo que cubre
 * withAutomaticReconnect(): cuando esa política agota sus reintentos (0/2/10/30s)
 * y se rinde (onclose), reintentamos nosotros con backoff creciente (tope 30s)
 * en vez de quedarnos sin nada intentando reconectar.
 *
 * getConnection debe ser la función que crea/recupera la conexión compartida
 * (p. ej. getCallsHubConnection) — al llamarla con la conexión en estado
 * Disconnected, la reinicia.
 */
export const createHubReconnectManager = (getConnection) => {
  let manualReconnectTimer = null
  const reconnectHandlers = new Set()
  const closedHandlers = new Set()

  // true = se perdió la conexión (reconectando automático); false = se recuperó.
  const onReconnecting = (handler) => {
    reconnectHandlers.add(handler)
    return () => reconnectHandlers.delete(handler)
  }

  // true = se agotaron los reintentos automáticos y la conexión sigue caída;
  // false = el retry manual la recuperó. A diferencia de onReconnecting, este
  // evento sí puede volver a `false` más tarde — quien lo escuche debe resetear
  // su estado de "conexión perdida" cuando reciba false, no solo reaccionar a true.
  const onClosed = (handler) => {
    closedHandlers.add(handler)
    return () => closedHandlers.delete(handler)
  }

  const scheduleManualReconnect = (attempt = 1) => {
    clearTimeout(manualReconnectTimer)
    const delay = Math.min(5000 * attempt, 30000)
    manualReconnectTimer = setTimeout(async () => {
      try {
        await getConnection()
        reconnectHandlers.forEach((h) => h(false))
        closedHandlers.forEach((h) => h(false))
      } catch {
        scheduleManualReconnect(attempt + 1)
      }
    }, delay)
  }

  const wire = (connection) => {
    connection.onreconnecting(() => {
      reconnectHandlers.forEach((h) => h(true))
    })
    connection.onreconnected(() => {
      reconnectHandlers.forEach((h) => h(false))
    })
    connection.onclose(() => {
      closedHandlers.forEach((h) => h(true))
      scheduleManualReconnect()
    })
  }

  return { onReconnecting, onClosed, wire }
}
