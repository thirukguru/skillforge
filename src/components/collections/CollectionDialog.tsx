import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { COLLECTION_ICONS, COLLECTION_ICON_NAMES } from '../../lib/collectionIcons';
import type { Collection } from '../../types/electron';
import { cn } from '../../lib/utils';

interface CollectionDialogProps {
  /** When provided, the dialog edits (renames) this collection instead of creating one. */
  collection?: Collection;
  onClose: () => void;
}

export function CollectionDialog({ collection, onClose }: CollectionDialogProps) {
  const { addCollection, renameCollection } = useAppStore();
  const isEdit = !!collection;
  const [name, setName] = useState(collection?.name ?? '');
  const [icon, setIcon] = useState(collection?.icon ?? 'Folder');

  const submit = () => {
    if (!name.trim()) return;
    if (isEdit) {
      renameCollection(collection!.id, name.trim(), icon);
    } else {
      addCollection(name.trim(), icon);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-[var(--bg-tertiary)] rounded-xl p-5 border border-[var(--border-2)] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          {isEdit ? 'Rename Collection' : 'New Collection'}
        </h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Collection name"
          autoFocus
          className="w-full bg-[var(--surface-1)] border border-emerald-500/50 rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 mb-4"
        />

        <div className="grid grid-cols-6 gap-2 mb-5">
          {COLLECTION_ICON_NAMES.map((iconName) => {
            const Icon = COLLECTION_ICONS[iconName];
            const active = icon === iconName;
            return (
              <button
                key={iconName}
                onClick={() => setIcon(iconName)}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-lg border transition-colors',
                  active
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                    : 'bg-[var(--surface-1)] border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                )}
                title={iconName}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="px-5 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
