import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { TOOL_SOURCES } from '../../lib/toolSources';

const TYPE_LABEL: Record<string, string> = { skill: 'Skill', agent: 'Agent', rule: 'Rule' };

export function NewSkillDialog() {
  const { createDialog, setCreateDialog, scanForSkills } = useAppStore();
  const [name, setName] = useState('');
  const [source, setSource] = useState(TOOL_SOURCES[0]?.id || 'claude-code');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This dialog only handles skill/agent/rule creation.
  if (createDialog !== 'skill' && createDialog !== 'agent' && createDialog !== 'rule') return null;
  const type = createDialog;
  const label = TYPE_LABEL[type];

  const close = () => setCreateDialog(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      if (window.electronAPI?.createSkillFile) {
        const filePath = await window.electronAPI.createSkillFile(source, name.trim(), type);
        await scanForSkills();
        // Select the freshly created file so it opens in the editor.
        const created = useAppStore.getState().skills.find(s => s.filePath === filePath);
        if (created) useAppStore.getState().selectSkill(created);
      }
      close();
    } catch (error) {
      console.error('Failed to create:', error);
      alert(`Failed to create ${label.toLowerCase()}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={close}
      />
      <div className="relative w-full max-w-md bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-2)] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5 text-center">New {label}</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-[var(--text-secondary)] flex-shrink-0">{label} name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              autoFocus
              className="flex-1 bg-[var(--surface-1)] border border-emerald-500/50 rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="w-20 text-sm text-[var(--text-secondary)] flex-shrink-0">Tool</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="flex-1 bg-[var(--surface-1)] border border-[var(--border-2)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50"
            >
              {TOOL_SOURCES.map((src) => (
                <option key={src.id} value={src.id}>{src.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-7 flex justify-between gap-3">
          <button
            onClick={close}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isSubmitting}
            className="px-5 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
