import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nexus', {
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  getVersion: () => ipcRenderer.invoke('app:version'),
  importMedia: () => ipcRenderer.invoke('media:import')
});