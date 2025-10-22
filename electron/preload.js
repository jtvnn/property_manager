const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Navigation
  onNavigate: (callback) => ipcRenderer.on('navigate-to', callback),
  
  // File operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // Platform info
  platform: process.platform
})

// Remove the callback when the window is closed
window.addEventListener('DOMContentLoaded', () => {
  console.log('Property Manager Desktop - Preload script loaded')
})