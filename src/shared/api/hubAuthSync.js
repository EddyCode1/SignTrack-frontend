import useAuthStore from '../stores/useAuthStore'
import { stopCallsHubConnection } from './callsHubService'
import { disconnectChatHub } from './chatHubService'

// Las conexiones de SignalR (calls/chat) son compartidas (singleton) para toda la
// pestaña. Si el usuario cambia de cuenta (logout + login como otra persona) sin
// recargar la página, la conexión sigue autenticada con el token viejo y el
// backend rechaza acciones como invitar a una llamada ("No perteneces a esta
// reunión"). Aquí forzamos a cerrar ambas conexiones cada vez que cambia el token,
// para que la próxima acción abra una conexión nueva con el token actual.
let previousToken = useAuthStore.getState().token

useAuthStore.subscribe((state) => {
  if (state.token === previousToken) return
  previousToken = state.token
  stopCallsHubConnection().catch(() => {})
  disconnectChatHub().catch(() => {})
})
