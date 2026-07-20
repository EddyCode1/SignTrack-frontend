import { create } from 'zustand'

let flashTimeoutId = null

const useLiveRegionStore = create((set) => ({
  message: '',
  flash: false,

  announce: (message, { flash = false } = {}) => {
    set({ message: '' })
    // Fuerza el re-render aunque el mensaje sea idéntico al anterior, así el lector de pantalla lo vuelve a anunciar.
    setTimeout(() => set({ message }), 30)

    if (flash) {
      clearTimeout(flashTimeoutId)
      set({ flash: true })
      flashTimeoutId = setTimeout(() => set({ flash: false }), 900)
    }
  },
}))

export default useLiveRegionStore
