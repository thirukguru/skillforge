import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as os from 'os';
import { scanAllTools } from './services/fileScanner';
import {
  readSkillFile,
  writeSkillFile,
  deleteSkillFile,
  createSkillFile,
  copySkillToTool
} from './services/fileSystem';
import {
  startWatching,
  stopWatching
} from './services/fileWatcher';
import {
  getSettings,
  saveSettings
} from './services/settingsStore';

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Window state persistence could be added here
  // if (settings.windowBounds) {
  //   mainWindow.setBounds(settings.windowBounds);
  // }

  if (isDev) {
    // Load Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIpcHandlers() {
  // File Scanning
  ipcMain.handle('scan-directory', async (_event, homeDir: string) => {
    return await scanAllTools(homeDir);
  });

  // File Operations
  ipcMain.handle('read-file', async (_event, filePath: string) => {
    return await readSkillFile(filePath);
  });

  ipcMain.handle('write-file', async (_event, filePath: string, content: string) => {
    await writeSkillFile(filePath, content);
  });

  ipcMain.handle('delete-file', async (_event, filePath: string) => {
    await deleteSkillFile(filePath);
  });

  ipcMain.handle('create-skill-file', async (_event, toolId: string, name: string, type: 'skill' | 'agent' | 'rule') => {
    return await createSkillFile(toolId, name, type);
  });

  ipcMain.handle('copy-skill-to-tool', async (_event, sourcePath: string, targetToolId: string, type: 'skill' | 'agent' | 'rule') => {
    return await copySkillToTool(sourcePath, targetToolId, type);
  });

  // File Watching
  ipcMain.on('start-watching', (event, dirs: string[]) => {
    startWatching(dirs, (changeEvent) => {
      event.sender.send('file-changed', changeEvent);
    });
  });

  ipcMain.on('stop-watching', () => {
    stopWatching();
  });

  // Settings
  ipcMain.handle('get-settings', async () => {
    return getSettings();
  });

  ipcMain.handle('save-settings', async (_event, settings: any) => {
    saveSettings(settings);
  });

  // Dialogs
  ipcMain.handle('open-directory-dialog', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // Platform Info
  ipcMain.handle('get-platform', () => process.platform);
  ipcMain.handle('get-home-dir', () => os.homedir());
}

app.whenReady().then(async () => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Auto-scan home directory on app ready for macOS
  if (process.platform === 'darwin') {
    const settings = getSettings();
    if (settings.autoScan) {
      // Trigger a scan in the background or notify renderer
      // since renderer drives the scan via 'scan-directory'
    }
  }
});

app.on('window-all-closed', () => {
  stopWatching();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
