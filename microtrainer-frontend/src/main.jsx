import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { DisplayModeProvider } from './context/DisplayModeContext.jsx'
import { initDisplayModeFromStorage } from './utils/displayModeStorage.js'

initDisplayModeFromStorage()

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const app = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
) : (
  <App />
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DisplayModeProvider>
      {app}
    </DisplayModeProvider>
  </StrictMode>,
)
