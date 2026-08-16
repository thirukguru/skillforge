import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import SkillCard from '../skills/SkillCard';
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
    <div className="w-72 h-full bg-[#1e1f23] border-r border-white/5 flex flex-col">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white/90 mb-3">
          {getFilterName()}
        </h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills... (⌘K)"
            className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-colors"
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
            <p className="text-sm text-white/40">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
