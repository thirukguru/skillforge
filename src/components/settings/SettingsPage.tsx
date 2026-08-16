import React from 'react';
import { RefreshCw, Monitor, Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAppStore } from '../../stores/appStore';
import { TOOL_SOURCES, getToolColor } from '../../lib/toolSources';
import { cn } from '../../lib/utils';

const MOD = navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl';
const SHORTCUTS: { label: string; keys: string }[] = [
  { label: 'Search skills', keys: `${MOD} K` },
  { label: 'Edit mode', keys: `${MOD} E` },
  { label: 'Preview mode', keys: `${MOD} P` },
  { label: 'Save', keys: `${MOD} S` },
  { label: 'Open Settings', keys: `${MOD} ,` },
  { label: 'Delete skill (confirms)', keys: `${MOD} ⌫` },
  { label: 'Close Settings', keys: 'Esc' },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();
  const { skills, scanForSkills } = useAppStore();

  const handleBrowse = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openDirectoryDialog();
      if (result) {
        updateSettings({ homeDirectory: result });
      }
    }
  };

  const getToolStats = (toolSource: string) => {
    const toolSkills = skills.filter(s => s.toolSource === toolSource);
    return {
      count: toolSkills.length,
      agents: toolSkills.filter(s => s.type === 'agent').length
    };
  };

  return (
    <div className="flex-1 h-full bg-[var(--bg-secondary)] overflow-y-auto p-8 text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your SkillForge configuration and preferences.</p>
        </div>

        {/* Scan Directory */}
        <section className="bg-[var(--bg-tertiary)] border border-[var(--border-1)] rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Scan Directory</h2>
          
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Home Directory</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={settings?.homeDirectory || ''}
                    readOnly
                    className="flex-1 bg-[var(--surface-1)] border border-[var(--border-2)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="Select a directory to scan for skills..."
                  />
                  <button 
                    onClick={handleBrowse}
                    className="px-4 py-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-md text-sm font-medium transition-colors"
                  >
                    Browse
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={settings?.autoScan || false}
                  onChange={(e) => updateSettings({ autoScan: e.target.checked })}
                  className="rounded border-[var(--border-2)] bg-[var(--surface-1)] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                />
                <span className="text-sm text-[var(--text-primary)]">Auto-scan on startup</span>
              </label>

              <button 
                onClick={() => scanForSkills()}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Rescan Now
              </button>
            </div>
          </div>
        </section>

        {/* Detected Tools */}
        <section className="bg-[var(--bg-tertiary)] border border-[var(--border-1)] rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Detected Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOL_SOURCES.map(tool => {
              const stats = getToolStats(tool.id);
              const hasSkills = stats.count > 0;
              
              return (
                <div key={tool.id} className="bg-[var(--surface-1)] border border-[var(--border-1)] rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getToolColor(tool.id) }}
                      />
                      <span className="font-medium text-sm">{tool.name}</span>
                    </div>
                    {hasSkills ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                        ✓
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-tertiary)] text-xs font-bold">
                        ✕
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {stats.count} skills ({stats.agents} agents)
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-[var(--bg-tertiary)] border border-[var(--border-1)] rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Appearance</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Theme</label>
              <div className="flex items-center gap-1 bg-[var(--surface-1)] p-1 rounded-lg w-fit border border-[var(--border-1)]">
                {(['dark', 'light', 'system'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => updateSettings({ theme: t })}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm capitalize transition-colors",
                      settings?.theme === t 
                        ? "bg-[var(--surface-2)] text-[var(--text-primary)] shadow-sm" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {t === 'dark' && <Moon className="w-4 h-4" />}
                    {t === 'light' && <Sun className="w-4 h-4" />}
                    {t === 'system' && <Monitor className="w-4 h-4" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor font size / family are temporarily hidden — revisit later. */}
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="bg-[var(--bg-tertiary)] border border-[var(--border-1)] rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {SHORTCUTS.map(({ label, keys }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--border-1)]">
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                <kbd className="text-xs font-mono bg-[var(--surface-1)] border border-[var(--border-2)] rounded px-2 py-1 text-[var(--text-primary)]">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="bg-[var(--bg-tertiary)] border border-[var(--border-1)] rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Monitor className="w-6 h-6 text-[var(--text-primary)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">SkillForge</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Version 1.0.0</p>
          <div className="text-xs text-[var(--text-tertiary)] space-y-1">
            <p>MIT License</p>
            <p>Built with React, Electron & Tailwind CSS</p>
          </div>
        </section>
      </div>
    </div>
  );
}
