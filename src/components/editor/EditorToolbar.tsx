import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useEditorStore } from '../../stores/editorStore';
import { useAppStore } from '../../stores/appStore';
import { Pencil, Eye, Star, Save, Trash2, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TOOL_SOURCES } from '../../lib/toolSources';

export function EditorToolbar() {
  const { selectedSkill, toggleFavorite, isFavorite } = useAppStore();
  const { mode, setMode, isDirty, markSaved, currentContent } = useEditorStore();

  if (!selectedSkill) return null;

  const isFav = isFavorite(selectedSkill.id);
  const targetTools = TOOL_SOURCES.filter(t => t.id !== selectedSkill.toolSource);

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

  const handleSave = async () => {
    if (!isDirty) return;
    if (window.electronAPI && window.electronAPI.writeFile) {
      await window.electronAPI.writeFile(selectedSkill.filePath, currentContent);
      markSaved();
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      if (window.electronAPI && window.electronAPI.deleteFile) {
        await window.electronAPI.deleteFile(selectedSkill.filePath);
      }
      // Assuming re-scan will pick up deletion
      useAppStore.getState().scanForSkills();
      useAppStore.getState().selectSkill(null);
    }
  };

  const handleFavorite = () => {
    toggleFavorite(selectedSkill.id);
  };

  return (
    <div className="h-12 flex items-center justify-between px-4 bg-[#1a1b1e] border-b border-white/5 shrink-0">
      <div className="flex flex-col max-w-[40%]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate text-white">{selectedSkill.name}</span>
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
        </div>
        <span className="text-[10px] text-gray-500 truncate" title={selectedSkill.filePath}>
          {selectedSkill.filePath}
        </span>
      </div>

      <div className="flex items-center gap-1 bg-black/20 p-1 rounded-md border border-white/5">
        <button
          onClick={() => setMode('edit')}
          className={cn(
            "p-1.5 rounded text-gray-400 hover:text-white transition-colors",
            mode === 'edit' && "bg-white/10 text-white"
          )}
          title="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => setMode('preview')}
          className={cn(
            "p-1.5 rounded text-gray-400 hover:text-white transition-colors",
            mode === 'preview' && "bg-white/10 text-white"
          )}
          title="Preview"
        >
          <Eye size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleFavorite}
          className={cn(
            "p-1.5 rounded transition-colors",
            isFav ? "text-yellow-400 hover:text-yellow-300" : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
          title="Toggle Favorite"
        >
          <Star size={16} className={cn(isFav && "fill-current")} />
        </button>
        
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={cn(
            "p-1.5 rounded transition-colors",
            isDirty 
              ? "text-emerald-400 hover:bg-emerald-400/10" 
              : "text-gray-600 cursor-not-allowed"
          )}
          title="Save (Ctrl+S)"
        >
          <Save size={16} />
        </button>

        {targetTools.length > 0 && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors outline-none"
                title="Copy to another tool"
              >
                <Copy size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-50 min-w-[180px] bg-[#1e1f23] border border-white/10 rounded-lg p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
              >
                <DropdownMenu.Label className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-gray-500">
                  Copy {selectedSkill.type} to
                </DropdownMenu.Label>
                {targetTools.map((tool) => (
                  <DropdownMenu.Item
                    key={tool.id}
                    onSelect={() => handleCopyTo(tool.id)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-200 rounded outline-none cursor-pointer data-[highlighted]:bg-white/10"
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

        <div className="w-px h-4 bg-white/10 mx-1"></div>
        
        <button
          onClick={handleDelete}
          className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
