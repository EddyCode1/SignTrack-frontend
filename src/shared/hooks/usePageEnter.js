import { useEffect, useState } from 'react'

/** Activa animación de entrada al montar la página */
export const usePageEnter = (delayMs = 0) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setTimeout(() => setVisible(true), delayMs)
    })
    return () => cancelAnimationFrame(id)
  }, [delayMs])

  return visible
}

export default usePageEnter
