import React from 'react';
import { getToolColor, getToolSource } from '../../lib/toolSources';
import { cn } from '../../lib/utils';

interface ToolBadgeProps {
  toolId: string;
  size?: 'sm' | 'md';
  showName?: boolean;
}

export default function ToolBadge({ toolId, size = 'sm', showName = false }: ToolBadgeProps) {
  const color = getToolColor(toolId);
  const source = getToolSource(toolId);
  
  return (
    <div className="flex items-center gap-2 group relative" title={source?.name || toolId}>
      <div 
        className={cn(
          "rounded-full flex-shrink-0",
          size === 'sm' ? "w-1 h-1" : "w-1.5 h-1.5"
        )}
        style={{ backgroundColor: color }}
      />
      {showName && (
        <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
          {source?.name || toolId}
        </span>
      )}
    </div>
  );
}
