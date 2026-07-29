import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

const rootEl = document.getElementById('root')

if (!rootEl) {
  document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif">Missing #root element.</p>'
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </HashRouter>
      </ErrorBoundary>
    </React.StrictMode>
  )
}
