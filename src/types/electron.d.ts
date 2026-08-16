// src/types/electron.d.ts

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
}

export type SkillType = 'skill' | 'agent' | 'rule';

export interface ScannedSkill {
  id: string;
  name: string;
  description: string;
  content: string;
  rawContent: string;
  filePath: string;
  realPath: string;
  toolSource: string;
  type: SkillType;
  tags: string[];
  fileSize: number;
  lastModified: number;
  globs?: string[];
  alwaysApply?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  skillIds: string[];
  icon?: string;
}

export interface AppSettings {
  homeDirectory: string;
  autoScan: boolean;
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  editorFont: string;
  collections: Collection[];
  favorites: string[];
  windowBounds?: { x: number; y: number; width: number; height: number };
}

export interface ElectronAPI {
  // File scanning
  scanDirectory: (homeDir: string) => Promise<ScannedSkill[]>;
  
  // File operations
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  createSkillFile: (toolId: string, name: string, type: SkillType) => Promise<string>;
  copySkillToTool: (sourcePath: string, targetToolId: string, type: SkillType) => Promise<string>;
  
  // File watching
  startWatching: (dirs: string[]) => void;
  stopWatching: () => void;
  onFileChanged: (callback: (event: FileChangeEvent) => void) => () => void;
  
  // Settings
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // Dialogs
  openDirectoryDialog: () => Promise<string | null>;
  
  // Platform
  getPlatform: () => Promise<string>;
  getHomeDir: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
