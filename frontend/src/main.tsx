import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './i18n'
import './index.css'
import api from './services/api'

// Bootstrap the Django CSRF cookie so session-based POST requests (login,
// register, checkout, contact, newsletter) pass CSRF validation.
api.get('/csrf/').catch(() => {})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
