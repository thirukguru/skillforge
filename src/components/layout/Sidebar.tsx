import React from 'react';
import { BookOpen, Bot, Star, Settings, Plus, Scroll, MoreHorizontal } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';
import { TOOL_SOURCES, getToolColor } from '../../lib/toolSources';
import { useAppStore } from '../../stores/appStore';
import { CollectionIcon } from '../../lib/collectionIcons';
import type { Collection } from '../../types/electron';

export default function Sidebar() {
  const {
    filterMode,
    setFilterMode,
    skills,
    favorites,
    collections,
    setShowSettings,
    setCreateDialog,
    setEditCollection,
    removeCollection,
  } = useAppStore();

  const allSkillsCount = skills.filter(s => s.type === 'skill').length;
  const allAgentsCount = skills.filter(s => s.type === 'agent').length;
  const allRulesCount = skills.filter(s => s.type === 'rule').length;
  const favoritesCount = Array.from(favorites).length;

  const getToolCount = (toolSource: string) => skills.filter(s => s.toolSource === toolSource).length;

  const handleDeleteCollection = (c: Collection) => {
    if (window.confirm(`Delete collection "${c.name}"? The skills themselves are not deleted.`)) {
      removeCollection(c.id);
    }
  };

  return (
    <div className="w-56 h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-1)] flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        {/* Library Section */}
        <div className="mb-6 px-3">
          <h2 className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-2">
            Library
          </h2>
          <div className="space-y-0.5">
            <NavItem 
              icon={<BookOpen className="w-4 h-4" />} 
              label="All Skills" 
              count={allSkillsCount}
              isActive={filterMode === 'all-skills'}
              onClick={() => { setFilterMode('all-skills'); setShowSettings(false); }}
            />
            <NavItem
              icon={<Bot className="w-4 h-4" />}
              label="All Agents"
              count={allAgentsCount}
              isActive={filterMode === 'all-agents'}
              onClick={() => { setFilterMode('all-agents'); setShowSettings(false); }}
            />
            <NavItem
              icon={<Scroll className="w-4 h-4" />}
              label="All Rules"
              count={allRulesCount}
              isActive={filterMode === 'all-rules'}
              onClick={() => { setFilterMode('all-rules'); setShowSettings(false); }}
            />
            <NavItem
              icon={<Star className="w-4 h-4" />}
              label="Favorites" 
              count={favoritesCount}
              isActive={filterMode === 'favorites'}
              onClick={() => { setFilterMode('favorites'); setShowSettings(false); }}
            />
          </div>
        </div>

        {/* Tools Section */}
        <div className="mb-6 px-3">
          <h2 className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-2">
            Tools
          </h2>
          <div className="space-y-0.5">
            {TOOL_SOURCES.map(tool => (
              <NavItem 
                key={tool.id}
                icon={
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getToolColor(tool.id) }}
                  />
                }
                label={tool.name} 
                count={getToolCount(tool.id)}
                isActive={filterMode === tool.id}
                onClick={() => { setFilterMode(tool.id as any); setShowSettings(false); }}
              />
            ))}
          </div>
        </div>

        {/* Collections Section */}
        <div className="mb-6 px-3">
          <h2 className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-2">
            Collections
          </h2>
          <div className="space-y-0.5">
            {collections?.map(collection => {
              const isActive = filterMode === `collection:${collection.id}`;
              return (
                <div
                  key={collection.id}
                  className={cn(
                    'group/col w-full flex items-center px-2 py-1.5 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-[var(--surface-2)] text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <button
                    onClick={() => { setFilterMode(`collection:${collection.id}` as any); setShowSettings(false); }}
                    className="flex items-center gap-2 truncate flex-1 min-w-0 text-left"
                  >
                    <span className={cn('flex-shrink-0', isActive && 'text-emerald-400')}>
                      <CollectionIcon name={collection.icon} size={16} />
                    </span>
                    <span className="truncate">{collection.name}</span>
                  </button>

                  {/* Count (hidden on hover) + ⋯ menu (shown on hover) */}
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 group-hover/col:hidden',
                    isActive ? 'bg-[var(--surface-2)] text-[var(--text-primary)]' : 'bg-[var(--surface-1)] text-[var(--text-tertiary)]'
                  )}>
                    {collection.skillIds?.length || 0}
                  </span>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        title="Collection options"
                        className="hidden group-hover/col:flex items-center justify-center w-5 h-5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] outline-none flex-shrink-0"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        sideOffset={4}
                        className="z-50 min-w-[140px] bg-[var(--bg-tertiary)] border border-[var(--border-2)] rounded-lg p-1 shadow-2xl"
                      >
                        <DropdownMenu.Item
                          onSelect={() => setEditCollection(collection)}
                          className="px-2 py-1.5 text-sm text-[var(--text-primary)] rounded outline-none cursor-pointer data-[highlighted]:bg-[var(--surface-2)]"
                        >
                          Rename
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-2)]" />
                        <DropdownMenu.Item
                          onSelect={() => handleDeleteCollection(collection)}
                          className="px-2 py-1.5 text-sm text-red-400 rounded outline-none cursor-pointer data-[highlighted]:bg-red-500/10"
                        >
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              );
            })}
            <button
              onClick={() => setCreateDialog('collection')}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] rounded-md transition-colors mt-1"
            >
              <Plus className="w-4 h-4" />
              <span>New Collection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[var(--border-1)] mt-auto">
        <button
          onClick={() => setShowSettings(true)}
          title={`Settings (${navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl+'},)`}
          className="w-full flex items-center gap-2 px-2 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] rounded-md transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, count, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
        isActive 
          ? "bg-[var(--surface-2)] text-[var(--text-primary)] font-medium" 
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
      )}
    >
      <div className="flex items-center gap-2 truncate">
        <div className={cn("flex-shrink-0", isActive ? "text-emerald-400" : "")}>
          {icon}
        </div>
        <span className="truncate">{label}</span>
      </div>
      {typeof count !== 'undefined' && (
        <span className={cn(
          "text-xs px-1.5 py-0.5 rounded-full flex-shrink-0",
          isActive ? "bg-[var(--surface-2)] text-[var(--text-primary)]" : "bg-[var(--surface-1)] text-[var(--text-tertiary)]"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
