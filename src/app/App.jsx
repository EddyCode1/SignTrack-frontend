import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import router from './router/routes'

/**
 * Componente principal de la aplicación
 */
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        reverseOrder={false}
          toastOptions={{
          duration: 3000,
          style: {
            background: '#242424',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#5b5fc7', secondary: '#fff' } },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </>
  )
}

export default App
