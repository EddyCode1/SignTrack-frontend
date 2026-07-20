import useLiveRegionStore from '../stores/useLiveRegionStore'

/**
 * Canal de accesibilidad paralelo a react-hot-toast: los toasts son visuales,
 * esta región la leen los lectores de pantalla y dispara el flash visual
 * para usuarios que no están mirando el toast en ese momento.
 */
const LiveRegion = () => {
  const { message, flash } = useLiveRegionStore()

  return (
    <>
      <div aria-live="assertive" role="alert" className="sr-only">
        {message}
      </div>
      {flash && <div className="app-flash" aria-hidden="true" />}
    </>
  )
}

export default LiveRegion
