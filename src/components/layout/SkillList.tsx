import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import SkillCard from '../skills/SkillCard';
import { CreateMenu } from './CreateMenu';
import { useAppStore } from '../../stores/appStore';
import { TOOL_SOURCES } from '../../lib/toolSources';

export default function SkillList() {
  const { 
    filterMode, 
    collections, 
    selectedSkill, 
    selectSkill,
    getFilteredSkills,
    searchQuery,
    setSearchQuery
  } = useAppStore();

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getFilterName = () => {
    if (filterMode === 'all-skills') return 'All Skills';
    if (filterMode === 'all-agents') return 'All Agents';
    if (filterMode === 'all-rules') return 'All Rules';
    if (filterMode === 'favorites') return 'Favorites';
    if (filterMode.startsWith('collection:')) {
      const colId = filterMode.split(':')[1];
      const col = collections.find(c => c.id === colId);
      return col ? col.name : 'Collection';
    }
    const tool = TOOL_SOURCES.find(t => t.id === filterMode);
    if (tool) return tool.name;
    return 'Skills';
  };

  const displayedSkills = getFilteredSkills();

  return (
    <div className="w-72 h-full bg-[var(--bg-tertiary)] border-r border-[var(--border-1)] flex flex-col">
      <div className="p-4 border-b border-[var(--border-1)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {getFilterName()}
          </h2>
          <CreateMenu />
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills... (⌘K)"
            className="w-full bg-[var(--surface-1)] border border-[var(--border-2)] rounded-md py-1.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500/50 focus:bg-[var(--surface-2)] transition-colors"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {displayedSkills.length > 0 ? (
          <div className="py-2">
            {displayedSkills.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                isSelected={selectedSkill?.id === skill.id}
                onClick={() => selectSkill(skill)}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center mt-10">
            <p className="text-sm text-[var(--text-tertiary)]">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
