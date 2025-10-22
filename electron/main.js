const { app, BrowserWindow, Menu, shell, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')

// Keep a global reference of the window object
let mainWindow
let nextJsProcess

const isDev = process.env.NODE_ENV === 'development'
const port = process.env.PORT || 3000

function createWindow() {
  console.log('=== CREATING WINDOW ===')
  
  // Create the browser window
  console.log('Creating BrowserWindow instance...')
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: true // Always show the window immediately in production for debugging
  })

  console.log('BrowserWindow created successfully')

  // Set application name
  mainWindow.setTitle('Property Manager')
  console.log('Window title set')

  if (isDev) {
    console.log('Development mode: loading from localhost')
    // In development, load from localhost
    mainWindow.loadURL(`http://localhost:${port}`)
    mainWindow.webContents.openDevTools()
  } else {
    console.log('Production mode: loading from localhost after server start')
    // In production, the server should already be started by the main app
    // Show window immediately and then load content
    setTimeout(() => {
      console.log(`Loading URL: http://localhost:${port}`)
      mainWindow.loadURL(`http://localhost:${port}`).catch((error) => {
        console.error('Failed to load URL:', error)
        // Fallback: load a static error page
        console.log('Loading fallback page...')
        mainWindow.loadFile(path.join(__dirname, '..', 'public', 'fallback.html')).catch((fallbackError) => {
          console.error('Failed to load fallback page:', fallbackError)
          // As last resort, load a simple HTML string
          mainWindow.loadURL('data:text/html,<h1>Property Manager</h1><p>Server startup failed. Check console for details.</p>')
        })
      })
    }, 3000)
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready-to-show event fired')
    mainWindow.show()
    console.log('Window shown')
    
    // Always open dev tools to debug issues
    mainWindow.webContents.openDevTools()
    console.log('DevTools opened for debugging')
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    console.log('Window closed event fired')
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('External link clicked:', url)
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Add web contents event listeners for debugging
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Web contents started loading')
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Web contents finished loading')
  })

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Web contents failed to load:', errorCode, errorDescription, validatedURL)
  })

  mainWindow.webContents.on('crashed', () => {
    console.error('Web contents crashed')
  })

  mainWindow.webContents.on('unresponsive', () => {
    console.error('Web contents became unresponsive')
  })

  mainWindow.webContents.on('responsive', () => {
    console.log('Web contents became responsive again')
  })

  createMenu()
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Property',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/properties')
          }
        },
        {
          label: 'New Tenant',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/tenants')
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Export Property Data',
              defaultPath: 'property-data-backup.zip',
              filters: [
                { name: 'ZIP Files', extensions: ['zip'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            })
            
            if (!result.canceled) {
              // TODO: Implement data export
              console.log('Export to:', result.filePath)
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/dashboard')
          }
        },
        {
          label: 'Properties',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/properties')
          }
        },
        {
          label: 'Tenants',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/tenants')
          }
        },
        {
          label: 'Maintenance',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/maintenance')
          }
        },
        {
          label: 'Payments',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/payments')
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Property Manager',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Property Manager',
              message: 'Property Manager Desktop',
              detail: 'A comprehensive property management solution.\n\nVersion: 1.0.0\nBuilt with Electron and Next.js'
            })
          }
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Keyboard Shortcuts',
              message: 'Keyboard Shortcuts',
              detail: `
Navigation:
• Ctrl/Cmd + D: Dashboard
• Ctrl/Cmd + P: Properties
• Ctrl/Cmd + Shift + T: Tenants
• Ctrl/Cmd + M: Maintenance
• Ctrl/Cmd + Shift + P: Payments

Actions:
• Ctrl/Cmd + N: New Property
• Ctrl/Cmd + T: New Tenant

General:
• F5: Reload
• F11: Toggle Fullscreen
• Ctrl/Cmd + Q: Quit
              `.trim()
            })
          }
        }
      ]
    }
  ]

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })

    // Window menu
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ]
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function startNextJsServer() {
  return new Promise((resolve) => {
    if (isDev) {
      console.log('Development mode: skipping server start')
      setTimeout(resolve, 1000)
      return
    }

    console.log('=== STARTING NEXT.JS SERVER ===')
    console.log('Production mode: starting Next.js standalone server')
    console.log('__dirname:', __dirname)
    console.log('app.isPackaged:', app.isPackaged)
    console.log('process.resourcesPath:', process.resourcesPath)
    
    // In a packaged app, the standalone server is in the asar archive
    let serverPath
    let workingDir
    
    if (app.isPackaged) {
      // In packaged app, files are in the asar archive
      serverPath = path.join(process.resourcesPath, 'app.asar', '.next', 'standalone', 'server.js')
      workingDir = path.join(process.resourcesPath, 'app.asar', '.next', 'standalone')
    } else {
      // In development, use relative paths
      serverPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js')
      workingDir = path.join(__dirname, '..', '.next', 'standalone')
    }
    
    console.log('Server path:', serverPath)
    console.log('Working directory:', workingDir)
    console.log('Server exists:', fs.existsSync(serverPath))
    
    if (!fs.existsSync(serverPath)) {
      console.error('Standalone server not found at:', serverPath)
      
      // Try alternative paths
      const alternatePaths = [
        path.join(__dirname, '..', '.next', 'standalone', 'server.js'),
        path.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js'),
        path.join(process.resourcesPath, '.next', 'standalone', 'server.js'),
      ]
      
      console.log('Trying alternative paths:')
      for (const altPath of alternatePaths) {
        console.log(`  ${altPath}: ${fs.existsSync(altPath) ? 'EXISTS' : 'NOT FOUND'}`)
        if (fs.existsSync(altPath)) {
          serverPath = altPath
          workingDir = path.dirname(altPath)
          console.log('Using alternative path:', serverPath)
          break
        }
      }
      
      if (!fs.existsSync(serverPath)) {
        console.log('Available files in app directory:')
        try {
          const appDir = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..')
          console.log('App directory:', appDir)
          const appFiles = fs.readdirSync(appDir)
          console.log('App files:', appFiles)
          
          if (appFiles.includes('.next')) {
            const nextFiles = fs.readdirSync(path.join(appDir, '.next'))
            console.log('.next files:', nextFiles)
          }
        } catch (e) {
          console.error('Could not read app directory:', e.message)
        }
        // Don't reject, just resolve and let the app continue
        resolve()
        return
      }
    }

    // Use the Node.js executable that comes with Electron
    const nodePath = process.execPath
    
    console.log('Node path:', nodePath)
    console.log('Working directory:', workingDir)
    
    try {
      nextJsProcess = spawn(nodePath, [serverPath], {
        cwd: workingDir,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: port.toString(),
          HOSTNAME: 'localhost'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      })

      console.log('Spawn process created, PID:', nextJsProcess.pid)

      nextJsProcess.stdout.on('data', (data) => {
        console.log(`Next.js stdout: ${data.toString()}`)
      })

      nextJsProcess.stderr.on('data', (data) => {
        console.error(`Next.js stderr: ${data.toString()}`)
      })

      nextJsProcess.on('close', (code) => {
        console.log(`Next.js server process exited with code ${code}`)
      })

      nextJsProcess.on('error', (error) => {
        console.error(`Failed to start Next.js server: ${error.message}`)
        console.error('Error details:', error)
        resolve() // Don't reject, just continue
      })

      // Give the server some time to start, then resolve
      console.log('Waiting for server to start...')
      setTimeout(() => {
        console.log('Server startup timeout reached, continuing with app')
        resolve()
      }, 5000)

    } catch (error) {
      console.error('Exception while starting server:', error)
      resolve() // Don't reject, just continue
    }
  })
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  console.log('=== ELECTRON APP STARTING ===')
  console.log('Platform:', process.platform)
  console.log('Node version:', process.version)
  console.log('Electron version:', process.versions.electron)
  console.log('Current directory:', process.cwd())
  console.log('__dirname:', __dirname)
  console.log('isDev:', isDev)
  console.log('PORT:', port)
  
  try {
    // Start Next.js server first
    console.log('About to start Next.js server...')
    await startNextJsServer()
    console.log('Next.js server startup completed')
    
    // Then create the window
    console.log('Creating Electron window...')
    createWindow()
    console.log('Window creation completed')
  } catch (error) {
    console.error('Error starting application:', error)
    console.error('Error stack:', error.stack)
    createWindow() // Create window anyway
  }

  app.on('activate', () => {
    console.log('App activate event fired')
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log('No windows exist, creating new window')
      createWindow()
    }
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Clean up Next.js process when app is quitting
app.on('before-quit', () => {
  if (nextJsProcess) {
    nextJsProcess.kill()
  }
})

app.on('will-quit', () => {
  if (nextJsProcess) {
    nextJsProcess.kill()
  }
})

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
    shell.openExternal(navigationUrl)
  })
})