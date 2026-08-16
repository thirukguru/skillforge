import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { TOOL_SOURCES } from '../../lib/toolSources';

export function NewSkillDialog() {
  const { setShowNewSkillDialog, scanForSkills } = useAppStore();
  const [name, setName] = useState('');
  const [source, setSource] = useState(TOOL_SOURCES[0]?.id || 'user');
  const [type, setType] = useState<'skill' | 'agent'>('skill');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (window.electronAPI && window.electronAPI.createSkillFile) {
        await window.electronAPI.createSkillFile(source, name, type);
      }
      if (scanForSkills) {
        await scanForSkills();
      }
      if (setShowNewSkillDialog) {
        setShowNewSkillDialog(false);
      }
    } catch (error) {
      console.error('Failed to create skill:', error);
      alert('Failed to create skill. See console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setShowNewSkillDialog && setShowNewSkillDialog(false)}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-[#1e1f23] rounded-xl p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-semibold text-white mb-6">Create New Skill</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Analysis"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  checked={type === 'skill'}
                  onChange={() => setType('skill')}
                  className="text-emerald-500 bg-black/20 border-white/10 focus:ring-emerald-500/50"
                />
                Skill
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  checked={type === 'agent'}
                  onChange={() => setType('agent')}
                  className="text-emerald-500 bg-black/20 border-white/10 focus:ring-emerald-500/50"
                />
                Agent
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Source Directory
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            >
              {TOOL_SOURCES.map((src) => (
                <option key={src.id} value={src.id}>{src.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => setShowNewSkillDialog && setShowNewSkillDialog(false)}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
