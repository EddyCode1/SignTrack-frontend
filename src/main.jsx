import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import useAuthStore from './shared/stores/useAuthStore'
import { seedDevAuthIfNeeded } from './shared/config/devAuth'
import '@livekit/components-styles'
import './styles/index.css'

seedDevAuthIfNeeded(useAuthStore.getState().login)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
