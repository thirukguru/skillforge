import { contextBridge, ipcRenderer } from 'electron';

// Expose these APIs via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // File scanning
  scanDirectory: (homeDir: string) => ipcRenderer.invoke('scan-directory', homeDir),
  
  // File operations
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
  createSkillFile: (toolId: string, name: string, type: 'skill' | 'agent' | 'rule') =>
    ipcRenderer.invoke('create-skill-file', toolId, name, type),
  copySkillToTool: (sourcePath: string, targetToolId: string, type: 'skill' | 'agent' | 'rule') =>
    ipcRenderer.invoke('copy-skill-to-tool', sourcePath, targetToolId, type),
  
  // File watching
  startWatching: (dirs: string[]) => ipcRenderer.send('start-watching', dirs),
  stopWatching: () => ipcRenderer.send('stop-watching'),
  onFileChanged: (callback: (event: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('file-changed', subscription);
    return () => {
      ipcRenderer.removeListener('file-changed', subscription);
    };
  },
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  
  // Dialogs
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  
  // Platform
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getHomeDir: () => ipcRenderer.invoke('get-home-dir')
});
