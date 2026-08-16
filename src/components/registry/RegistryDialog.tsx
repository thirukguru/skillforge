import React from 'react';
import { Globe } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

// Placeholder for the upcoming plugin/skill registry browser.
export function RegistryDialog() {
  const setCreateDialog = useAppStore((s) => s.setCreateDialog);
  const close = () => setCreateDialog(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={close} />
      <div className="relative w-full max-w-md bg-[var(--bg-tertiary)] rounded-xl p-8 border border-[var(--border-2)] shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <Globe className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Browse Registry</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Discover and install skills, agents, and plugins from GitHub. This is coming soon —
          the registry browser is on the roadmap.
        </p>
        <button
          onClick={close}
          className="px-5 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
