import Store from 'electron-store';
import * as os from 'os';

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

const defaultSettings: AppSettings = {
  homeDirectory: os.homedir(),
  autoScan: process.platform === 'darwin',
  theme: 'dark',
  fontSize: 14,
  editorFont: 'JetBrains Mono',
  collections: [],
  favorites: []
};

const store = new Store<AppSettings>({
  defaults: defaultSettings
});

export function getSettings(): AppSettings {
  return store.store;
}

export function saveSettings(settings: Partial<AppSettings>): void {
  for (const [key, value] of Object.entries(settings)) {
    if (value !== undefined) {
      store.set(key as keyof AppSettings, value as never);
    }
  }
}
