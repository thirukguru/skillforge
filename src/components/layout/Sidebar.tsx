import React from 'react';
import { BookOpen, Bot, Star, Folder, Settings, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TOOL_SOURCES, getToolColor } from '../../lib/toolSources';
import { useAppStore } from '../../stores/appStore';

export default function Sidebar() {
  const { 
    filterMode, 
    setFilterMode, 
    skills,
    favorites,
    collections,
    setShowSettings,
    addCollection
  } = useAppStore();

  const allSkillsCount = skills.length;
  const allAgentsCount = skills.filter(s => s.type === 'agent').length;
  const favoritesCount = Array.from(favorites).length;

  const getToolCount = (toolSource: string) => skills.filter(s => s.toolSource === toolSource).length;

  const handleNewCollection = () => {
    const name = window.prompt('Enter collection name:');
    if (name && name.trim()) {
      addCollection(name.trim());
    }
  };

  return (
    <div className="w-56 h-full bg-[#1a1b1e] border-r border-white/5 flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        {/* Library Section */}
        <div className="mb-6 px-3">
          <h2 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">
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
          <h2 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">
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
          <h2 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">
            Collections
          </h2>
          <div className="space-y-0.5">
            {collections?.map(collection => (
              <NavItem 
                key={collection.id}
                icon={<Folder className="w-4 h-4" />} 
                label={collection.name} 
                count={collection.skillIds?.length || 0}
                isActive={filterMode === `collection:${collection.id}`}
                onClick={() => { setFilterMode(`collection:${collection.id}` as any); setShowSettings(false); }}
              />
            ))}
            <button 
              onClick={handleNewCollection}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-colors mt-1"
            >
              <Plus className="w-4 h-4" />
              <span>New Collection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/5 mt-auto">
        <button 
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center gap-2 px-2 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-colors"
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
          ? "bg-white/10 text-white font-medium" 
          : "text-white/60 hover:bg-white/5 hover:text-white"
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
          isActive ? "bg-white/10 text-white/90" : "bg-white/5 text-white/40"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
