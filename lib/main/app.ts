import { BrowserWindow, shell, app, screen } from 'electron'
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
      sandbox: false
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

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
