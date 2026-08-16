import { create } from 'zustand';
import type { ScannedSkill, Collection, AppSettings } from '../types/electron';

type FilterMode = 'all-skills' | 'all-agents' | 'favorites' | string;

interface AppState {
  // Data
  skills: ScannedSkill[];
  selectedSkill: ScannedSkill | null;
  favorites: Set<string>;
  collections: Collection[];

  // Filters
  filterMode: FilterMode;
  searchQuery: string;

  // UI State
  isScanning: boolean;
  showSettings: boolean;
  showNewSkillDialog: boolean;

  // Actions
  setSkills: (skills: ScannedSkill[]) => void;
  selectSkill: (skill: ScannedSkill | null) => void;
  setFilterMode: (mode: FilterMode) => void;
  setSearchQuery: (query: string) => void;
  setIsScanning: (scanning: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowNewSkillDialog: (show: boolean) => void;
  toggleFavorite: (skillId: string) => void;
  isFavorite: (skillId: string) => boolean;
  addCollection: (name: string) => void;
  removeCollection: (id: string) => void;
  addSkillToCollection: (collectionId: string, skillId: string) => void;
  removeSkillFromCollection: (collectionId: string, skillId: string) => void;
  getFilteredSkills: () => ScannedSkill[];

  // Persistence
  hydrateFromSettings: (settings: AppSettings) => void;

  // Electron integration
  scanForSkills: () => Promise<void>;
}

// Persist favorites + collections back to electron-store. Kept as a bare
// helper (not an action) so every mutating action can fire-and-forget after
// updating state.
function persistUserData(favorites: Set<string>, collections: Collection[]): void {
  window.electronAPI?.saveSettings?.({
    favorites: [...favorites],
    collections,
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  skills: [],
  selectedSkill: null,
  favorites: new Set(),
  collections: [],
  filterMode: 'all-skills',
  searchQuery: '',
  isScanning: false,
  showSettings: false,
  showNewSkillDialog: false,

  setSkills: (skills) => set({ skills }),
  selectSkill: (selectedSkill) => set({ selectedSkill }),
  setFilterMode: (filterMode) => set({ filterMode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsScanning: (isScanning) => set({ isScanning }),
  setShowSettings: (showSettings) => set({ showSettings }),
  setShowNewSkillDialog: (showNewSkillDialog) => set({ showNewSkillDialog }),

  toggleFavorite: (skillId) => set((state) => {
    const newFavorites = new Set(state.favorites);
    if (newFavorites.has(skillId)) {
      newFavorites.delete(skillId);
    } else {
      newFavorites.add(skillId);
    }
    persistUserData(newFavorites, state.collections);
    return { favorites: newFavorites };
  }),

  isFavorite: (skillId) => {
    return get().favorites.has(skillId);
  },

  addCollection: (name) => set((state) => {
    const collections = [...state.collections, {
      id: crypto.randomUUID(),
      name,
      skillIds: []
    }];
    persistUserData(state.favorites, collections);
    return { collections };
  }),

  removeCollection: (id) => set((state) => {
    const collections = state.collections.filter(c => c.id !== id);
    persistUserData(state.favorites, collections);
    return { collections };
  }),

  addSkillToCollection: (collectionId, skillId) => set((state) => {
    const collections = state.collections.map(c =>
      c.id === collectionId
        ? { ...c, skillIds: [...new Set([...c.skillIds, skillId])] }
        : c
    );
    persistUserData(state.favorites, collections);
    return { collections };
  }),

  removeSkillFromCollection: (collectionId, skillId) => set((state) => {
    const collections = state.collections.map(c =>
      c.id === collectionId
        ? { ...c, skillIds: c.skillIds.filter(s => s !== skillId) }
        : c
    );
    persistUserData(state.favorites, collections);
    return { collections };
  }),

  hydrateFromSettings: (settings) => set({
    favorites: new Set(settings.favorites ?? []),
    collections: settings.collections ?? [],
  }),

  getFilteredSkills: () => {
    const state = get();
    const { skills, filterMode, searchQuery, favorites, collections } = state;

    let filtered = skills;

    // Apply filter mode
    if (filterMode === 'all-skills') {
      filtered = filtered.filter(s => s.type === 'skill');
    } else if (filterMode === 'all-agents') {
      filtered = filtered.filter(s => s.type === 'agent');
    } else if (filterMode === 'favorites') {
      filtered = filtered.filter(s => favorites.has(s.id));
    } else if (filterMode.startsWith('collection:')) {
      const collectionId = filterMode.replace('collection:', '');
      const collection = collections.find(c => c.id === collectionId);
      if (collection) {
        filtered = filtered.filter(s => collection.skillIds.includes(s.id));
      } else {
        filtered = [];
      }
    } else {
      // Tool ID filter
      filtered = filtered.filter(s => s.toolSource === filterMode);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(lowerQuery) ||
        (s.description && s.description.toLowerCase().includes(lowerQuery)) ||
        (s.content && s.content.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  },

  scanForSkills: async () => {
    if (!window.electronAPI) return;
    set({ isScanning: true });
    try {
      const homeDir = await window.electronAPI.getHomeDir();
      const skills = await window.electronAPI.scanDirectory(homeDir);
      set({ skills, isScanning: false });

      // Start file watching on discovered directories
      const dirs = [...new Set(skills.map(s => {
        const parts = s.filePath.split('/');
        parts.pop(); // remove filename
        return parts.join('/');
      }))];
      if (dirs.length > 0) {
        window.electronAPI.startWatching(dirs);
      }
    } catch (error) {
      console.error('Scan failed:', error);
      set({ isScanning: false });
    }
  }
}));
