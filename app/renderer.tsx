import React from 'react'
import ReactDOM from 'react-dom/client'
import appIcon from '@/resources/build/icon.png'
import { HashRouter } from 'react-router-dom'
import { WindowContextProvider, menuItems } from '@/app/components/window'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './app'

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
