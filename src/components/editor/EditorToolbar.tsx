import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useEditorStore } from '../../stores/editorStore';
import { useAppStore } from '../../stores/appStore';
import { Pencil, Eye, Star, Save, Trash2, Copy, FolderPlus, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TOOL_SOURCES } from '../../lib/toolSources';
import { saveCurrentSkill, deleteSelectedSkill } from '../../lib/skillActions';

const MOD = navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl+';

export function EditorToolbar() {
  const {
    selectedSkill, toggleFavorite, isFavorite,
    collections, addCollection, addSkillToCollection, removeSkillFromCollection,
  } = useAppStore();
  const { mode, setMode, isDirty } = useEditorStore();

  if (!selectedSkill) return null;

  const isFav = isFavorite(selectedSkill.id);
  const targetTools = TOOL_SOURCES.filter(t => t.id !== selectedSkill.toolSource);

  const toggleCollection = (collectionId: string, isMember: boolean) => {
    if (isMember) {
      removeSkillFromCollection(collectionId, selectedSkill.id);
    } else {
      addSkillToCollection(collectionId, selectedSkill.id);
    }
  };

  const handleNewCollectionForSkill = () => {
    const name = window.prompt('New collection name:');
    if (!name || !name.trim()) return;
    addCollection(name.trim());
    // The newly added collection is the last one in the array.
    const list = useAppStore.getState().collections;
    const created = list[list.length - 1];
    if (created) addSkillToCollection(created.id, selectedSkill.id);
  };

  const handleCopyTo = async (targetToolId: string) => {
    if (!window.electronAPI?.copySkillToTool) return;
    try {
      await window.electronAPI.copySkillToTool(
        selectedSkill.filePath,
        targetToolId,
        selectedSkill.type
      );
      await useAppStore.getState().scanForSkills();
    } catch (error) {
      console.error('Failed to copy skill:', error);
      alert(`Failed to copy skill: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleFavorite = () => {
    toggleFavorite(selectedSkill.id);
  };

  return (
    <div className="h-12 flex items-center justify-between px-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-1)] shrink-0">
      <div className="flex flex-col max-w-[40%]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate text-[var(--text-primary)]">{selectedSkill.name}</span>
          {selectedSkill.type === 'skill' && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Skill
            </span>
          )}
          {selectedSkill.type === 'agent' && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Agent
            </span>
          )}
          {selectedSkill.type === 'rule' && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Rule
            </span>
          )}
          {selectedSkill.alwaysApply && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="This rule is always applied">
              always
            </span>
          )}
          {selectedSkill.globs && selectedSkill.globs.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-gray-300 font-mono truncate max-w-[200px]"
              title={`Applies to: ${selectedSkill.globs.join(', ')}`}
            >
              {selectedSkill.globs.join(', ')}
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-500 truncate" title={selectedSkill.filePath}>
          {selectedSkill.filePath}
        </span>
      </div>

      <div className="flex items-center gap-1 bg-black/20 p-1 rounded-md border border-[var(--border-1)]">
        <button
          onClick={() => setMode('edit')}
          className={cn(
            "p-1.5 rounded text-gray-400 hover:text-[var(--text-primary)] transition-colors",
            mode === 'edit' && "bg-[var(--surface-2)] text-[var(--text-primary)]"
          )}
          title={`Edit (${MOD}E)`}
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => setMode('preview')}
          className={cn(
            "p-1.5 rounded text-gray-400 hover:text-[var(--text-primary)] transition-colors",
            mode === 'preview' && "bg-[var(--surface-2)] text-[var(--text-primary)]"
          )}
          title={`Preview (${MOD}P)`}
        >
          <Eye size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleFavorite}
          className={cn(
            "p-1.5 rounded transition-colors",
            isFav ? "text-yellow-400 hover:text-yellow-300" : "text-gray-400 hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
          )}
          title="Toggle Favorite"
        >
          <Star size={16} className={cn(isFav && "fill-current")} />
        </button>
        
        <button
          onClick={saveCurrentSkill}
          disabled={!isDirty}
          className={cn(
            "p-1.5 rounded transition-colors",
            isDirty
              ? "text-emerald-400 hover:bg-emerald-400/10"
              : "text-gray-600 cursor-not-allowed"
          )}
          title={`Save (${MOD}S)`}
        >
          <Save size={16} />
        </button>

        {targetTools.length > 0 && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="p-1.5 rounded text-gray-400 hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-colors outline-none"
                title="Copy to another tool"
              >
                <Copy size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-50 min-w-[180px] bg-[var(--bg-tertiary)] border border-[var(--border-2)] rounded-lg p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
              >
                <DropdownMenu.Label className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-gray-500">
                  Copy {selectedSkill.type} to
                </DropdownMenu.Label>
                {targetTools.map((tool) => (
                  <DropdownMenu.Item
                    key={tool.id}
                    onSelect={() => handleCopyTo(tool.id)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-200 rounded outline-none cursor-pointer data-[highlighted]:bg-[var(--surface-2)]"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tool.color }}
                    />
                    {tool.name}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-1.5 rounded text-gray-400 hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-colors outline-none"
              title="Add to collection"
            >
              <FolderPlus size={16} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-[200px] bg-[var(--bg-tertiary)] border border-[var(--border-2)] rounded-lg p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              <DropdownMenu.Label className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-gray-500">
                Collections
              </DropdownMenu.Label>
              {collections.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-gray-500">No collections yet</div>
              )}
              {collections.map((c) => {
                const isMember = c.skillIds.includes(selectedSkill.id);
                return (
                  <DropdownMenu.Item
                    key={c.id}
                    onSelect={(e) => { e.preventDefault(); toggleCollection(c.id, isMember); }}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm text-gray-200 rounded outline-none cursor-pointer data-[highlighted]:bg-[var(--surface-2)]"
                  >
                    <span className="truncate">{c.name}</span>
                    {isMember && <Check size={14} className="text-emerald-400 flex-shrink-0" />}
                  </DropdownMenu.Item>
                );
              })}
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-2)]" />
              <DropdownMenu.Item
                onSelect={(e) => { e.preventDefault(); handleNewCollectionForSkill(); }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-emerald-400 rounded outline-none cursor-pointer data-[highlighted]:bg-[var(--surface-2)]"
              >
                <FolderPlus size={14} /> New collection…
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="w-px h-4 bg-[var(--surface-2)] mx-1"></div>

        <button
          onClick={deleteSelectedSkill}
          className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          title={`Delete (${MOD}⌫)`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
