import { create } from 'zustand';
import type { AppSettings } from '../types/electron';

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;

  loadSettings: () => Promise<AppSettings>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  homeDirectory: '',
  autoScan: true,
  theme: 'dark',
  fontSize: 14,
  editorFont: 'JetBrains Mono, monospace',
  collections: [],
  favorites: [],
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoaded: false,

  loadSettings: async () => {
    try {
      if (window.electronAPI?.getSettings) {
        const loadedSettings = await window.electronAPI.getSettings();
        const merged = { ...defaultSettings, ...loadedSettings };
        set({ settings: merged, isLoaded: true });
        return merged;
      } else {
        set({ isLoaded: true });
        return defaultSettings;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoaded: true });
      return defaultSettings;
    }
  },

  updateSettings: async (partial) => {
    const newSettings = { ...get().settings, ...partial };
    set({ settings: newSettings });

    try {
      if (window.electronAPI?.saveSettings) {
        // Persist only the changed keys. `favorites` and `collections` are
        // owned by appStore, so writing the full object here would clobber
        // them with this store's empty copies.
        await window.electronAPI.saveSettings(partial);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
}));
