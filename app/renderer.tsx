import React from 'react'
import ReactDOM from 'react-dom/client'
import appIcon from '@/resources/build/icon.png'
import { HashRouter } from 'react-router-dom'
import { WindowContextProvider, menuItems } from '@/app/components/window'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './app'

// Suppress CSP warning for @react-pdf/renderer in development
// @react-pdf/renderer requires 'unsafe-eval' for WebAssembly compilation
// This is safe in Electron desktop apps (code runs locally, not from untrusted sources)
// Note: This warning only appears in dev mode and won't show in packaged apps
if (import.meta.env.DEV) {
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || ''
    // Filter out the CSP warning for @react-pdf/renderer
    if (message.includes('Insecure Content-Security-Policy') && 
        (message.includes('unsafe-eval') || message.includes('Content Security'))) {
      return // Suppress this specific warning
    }
    originalWarn.apply(console, args)
  }
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WindowContextProvider titlebar={{ title: 'Electron React App', icon: appIcon, menuItems }}>
         <HashRouter>
          <App />
         </HashRouter>

      </WindowContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
