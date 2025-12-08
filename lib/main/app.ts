import { BrowserWindow, shell, app, net } from 'electron'
import { join } from 'path'
import appIcon from '@/resources/build/icon.png?asset'
import { registerResourcesProtocol } from './protocols'
import { registerWindowHandlers } from '@/lib/conveyor/handlers/window-handler'
import { registerAppHandlers } from '@/lib/conveyor/handlers/app-handler'

export function createAppWindow(): void {
  registerResourcesProtocol()

  // Optional: use the primary display work area size for a full-size window
  // const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const mainWindow = new BrowserWindow({
    // width, height, // uncomment if you want true full-screen work area
    width: 1440,
    height: 1024,
    useContentSize: true,           // <- size refers to web page, not including frame
    show: false,
    backgroundColor: '#1c1c1c',
    icon: appIcon,
    frame: false,
    titleBarStyle: 'hiddenInset',
    title: 'Electron React App',
    maximizable: false,
    resizable: false,
    fullscreen: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      // Suppress CSP warning for @react-pdf/renderer (requires unsafe-eval for WebAssembly)
      // This is safe in Electron desktop apps as code runs locally, not from untrusted sources
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Lock zoom so CSS pixels map 1:1 (prevents surprise scrollbars on high-DPI)
  mainWindow.webContents.setZoomFactor(1.0)
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1)
  mainWindow.webContents.setZoomLevel(0)

  // Optional: nuke scrollbars globally as a safety net
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      html, body, #root, #app {
        margin: 0; padding: 0;
        width: 100vw; height: 100vh;
        overflow: auto;           /* allow scrolling when content exceeds viewport */
      }
      * { box-sizing: border-box; }
      body { overscroll-behavior: none; }
    `)
  })

  registerWindowHandlers(mainWindow)
  registerAppHandlers(app)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Handle failed page loads - fallback to built files if dev server fails
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -106 || errorCode === -105) { // ERR_CONNECTION_REFUSED or ERR_NAME_NOT_RESOLVED
      console.error(`Failed to load ${validatedURL}: ${errorDescription}`)
      if (!app.isPackaged && validatedURL.includes('localhost')) {
        console.log('Falling back to built files...')
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
      }
    }
  })

  // Load the renderer - with retry logic for dev server
  const loadRenderer = async () => {
    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
      const url = process.env['ELECTRON_RENDERER_URL']
      // Check if dev server is ready before loading using Electron's net module
      const checkServerReady = (): Promise<boolean> => {
        return new Promise((resolve) => {
          try {
            const urlObj = new URL(url)
            const request = net.request({
              method: 'HEAD',
              url: `${urlObj.protocol}//${urlObj.host}`
            })
            
            request.on('response', () => {
              resolve(true)
            })
            
            request.on('error', () => {
              resolve(false)
            })
            
            request.end()
            
            // Timeout after 1 second
            setTimeout(() => resolve(false), 1000)
          } catch {
            resolve(false)
          }
        })
      }
      
      // Retry checking server readiness
      const maxRetries = 10
      const retryDelay = 500 // 500ms
      
      for (let i = 0; i < maxRetries; i++) {
        const isReady = await checkServerReady()
        if (isReady) {
          mainWindow.loadURL(url)
          return
        }
        
        if (i < maxRetries - 1) {
          console.log(`Waiting for dev server at ${url}... (${i + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
      
      // If server never became ready, try loading anyway (might work)
      console.warn('Dev server check timed out, attempting to load anyway...')
      mainWindow.loadURL(url)
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }
  
  loadRenderer()
}
