import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { LangProvider } from './hooks/useLang'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LangProvider>
  </React.StrictMode>
)
