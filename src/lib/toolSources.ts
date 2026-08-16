export interface ToolSource {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const TOOL_SOURCES_MAP: Record<string, ToolSource> = {
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    icon: 'Terminal',
    color: '#8B5CF6',
    description: 'Anthropic Claude Code CLI'
  },
  'cursor': {
    id: 'cursor',
    name: 'Cursor',
    icon: 'MousePointer2',
    color: '#3B82F6',
    description: 'Cursor AI IDE'
  },
  'codex': {
    id: 'codex',
    name: 'Codex',
    icon: 'Code',
    color: '#10B981',
    description: 'OpenAI Codex'
  },
  'windsurf': {
    id: 'windsurf',
    name: 'Windsurf',
    icon: 'Waves',
    color: '#14B8A6',
    description: 'Windsurf AI Editor'
  },
  'amp': {
    id: 'amp',
    name: 'Amp',
    icon: 'Zap',
    color: '#F43F5E',
    description: 'Amp'
  },
  'global-agents': {
    id: 'global-agents',
    name: 'Global Agents',
    icon: 'Globe',
    color: '#6366F1',
    description: 'Global Agents'
  },
  'antigravity': {
    id: 'antigravity',
    name: 'Antigravity',
    icon: 'Rocket',
    color: '#F59E0B',
    description: 'Antigravity IDE'
  },
  'opencode': {
    id: 'opencode',
    name: 'OpenCode',
    icon: 'FileCode',
    color: '#06B6D4',
    description: 'OpenCode Platform'
  },
  'claude-desktop': {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    icon: 'Monitor',
    color: '#A855F7',
    description: 'Claude Desktop App'
  }
};

// Array version for iteration
export const TOOL_SOURCES: ToolSource[] = Object.values(TOOL_SOURCES_MAP);

export function getToolSource(id: string): ToolSource | undefined {
  return TOOL_SOURCES_MAP[id];
}

export function getToolColor(id: string): string {
  return TOOL_SOURCES_MAP[id]?.color || '#9CA3AF';
}

export function getToolName(id: string): string {
  return TOOL_SOURCES_MAP[id]?.name || id;
}
