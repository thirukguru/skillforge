import React from 'react';
import { Star } from 'lucide-react';
import { ScannedSkill } from '../../types/electron';
import { cn } from '../../lib/utils';
import { getToolColor } from '../../lib/toolSources';
import { useAppStore } from '../../stores/appStore';

interface SkillCardProps {
  skill: ScannedSkill;
  isSelected: boolean;
  onClick: () => void;
}

export default function SkillCard({ skill, isSelected, onClick }: SkillCardProps) {
  const toolColor = getToolColor(skill.toolSource);
  const isFavorite = useAppStore(state => state.isFavorite(skill.id));

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative px-4 py-3 cursor-pointer transition-all border-l-2",
        isSelected
          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500"
          : "border-transparent hover:bg-[var(--surface-1)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: toolColor }}
            />
            <h3 className={cn(
              "text-sm font-medium truncate",
              isSelected ? "text-emerald-100" : "text-[var(--text-primary)]"
            )}>
              {skill.name}
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] truncate mt-1">
            {skill.description || 'No description provided.'}
          </p>
        </div>

        {isFavorite && (
          <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0 mt-1" />
        )}
      </div>
    </div>
  );
}
