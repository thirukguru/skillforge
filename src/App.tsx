import React, { useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import SkillList from './components/layout/SkillList';
import { DetailPanel } from './components/layout/DetailPanel';
import StatusBar from './components/layout/StatusBar';
import { NewSkillDialog } from './components/skills/NewSkillDialog';
import { CollectionDialog } from './components/collections/CollectionDialog';
import { RegistryDialog } from './components/registry/RegistryDialog';
import { useAppStore } from './stores/appStore';
import { useEditorStore } from './stores/editorStore';
import { useSettingsStore } from './stores/settingsStore';
import { useTheme } from './hooks/useTheme';
import { saveCurrentSkill, deleteSelectedSkill } from './lib/skillActions';
import { Loader2 } from 'lucide-react';

function App() {
  const {
    scanForSkills,
    isScanning,
    createDialog,
    editCollection,
    setCreateDialog,
    setEditCollection,
    hydrateFromSettings
  } = useAppStore();

  const { loadSettings } = useSettingsStore();
  const { setMode } = useEditorStore();

  // Applies the .light / .dark class on <html> from the persisted theme setting.
  useTheme();

  useEffect(() => {
    // 1. Load settings, restore favorites/collections, then conditionally scan
    loadSettings().then((settings) => {
      hydrateFromSettings(settings);
      if (settings?.autoScan !== false) {
        scanForSkills();
      }
    });

    // File watching if available
    if (window.electronAPI?.onFileChanged) {
      window.electronAPI.onFileChanged(() => {
        scanForSkills();
      });
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Escape closes the settings view
      if (e.key === 'Escape') {
        if (useAppStore.getState().showSettings) {
          e.preventDefault();
          useAppStore.getState().setShowSettings(false);
        }
        return;
      }

      if (!mod) return;
      const key = e.key.toLowerCase();
      const { selectedSkill, setShowSettings } = useAppStore.getState();

      switch (key) {
        case 's': // Save
          e.preventDefault();
          saveCurrentSkill();
          break;
        case 'e': // Edit mode
          if (selectedSkill) {
            e.preventDefault();
            setShowSettings(false);
            setMode('edit');
          }
          break;
        case 'p': // Preview mode
          if (selectedSkill) {
            e.preventDefault();
            setShowSettings(false);
            setMode('preview');
          }
          break;
        case ',': // Open settings (macOS convention)
          e.preventDefault();
          setShowSettings(true);
          break;
        case 'backspace': // Delete selected skill (always confirms)
          if (selectedSkill) {
            e.preventDefault();
            deleteSelectedSkill();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadSettings, scanForSkills, setMode, hydrateFromSettings]);

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--bg-primary)] overflow-hidden text-[var(--text-primary)] font-sans">
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <SkillList />
        <DetailPanel />

        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[2px] flex items-center justify-center animate-fade-in">
            <div className="glass-card px-6 py-4 flex items-center gap-3 shadow-xl">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <span className="text-sm font-medium text-[var(--text-primary)]">Scanning directories...</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Dialogs (driven by the top-bar + menu) */}
      {(createDialog === 'skill' || createDialog === 'agent' || createDialog === 'rule') && <NewSkillDialog />}
      {createDialog === 'collection' && <CollectionDialog onClose={() => setCreateDialog(null)} />}
      {createDialog === 'registry' && <RegistryDialog />}
      {editCollection && (
        <CollectionDialog collection={editCollection} onClose={() => setEditCollection(null)} />
      )}
    </div>
  );
}

export default App;
