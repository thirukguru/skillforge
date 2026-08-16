import React, { useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import SkillList from './components/layout/SkillList';
import { DetailPanel } from './components/layout/DetailPanel';
import StatusBar from './components/layout/StatusBar';
import { NewSkillDialog } from './components/skills/NewSkillDialog';
import { useAppStore } from './stores/appStore';
import { useEditorStore } from './stores/editorStore';
import { useSettingsStore } from './stores/settingsStore';
import { Loader2 } from 'lucide-react';

function App() {
  const {
    scanForSkills,
    isScanning,
    showNewSkillDialog,
    hydrateFromSettings
  } = useAppStore();

  const { loadSettings } = useSettingsStore();
  const { setMode } = useEditorStore();

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
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const editorState = useEditorStore.getState();
        const appState = useAppStore.getState();
        if (editorState.isDirty && appState.selectedSkill) {
          if (window.electronAPI && window.electronAPI.writeFile) {
            window.electronAPI.writeFile(appState.selectedSkill.filePath, editorState.currentContent)
              .then(() => editorState.markSaved());
          }
        }
      }
      
      // Cmd/Ctrl + E to toggle edit/preview mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        const currentMode = useEditorStore.getState().mode;
        setMode(currentMode === 'edit' ? 'preview' : 'edit');
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
              <span className="text-sm font-medium text-white">Scanning directories...</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Dialogs */}
      {showNewSkillDialog && <NewSkillDialog />}
    </div>
  );
}

export default App;
