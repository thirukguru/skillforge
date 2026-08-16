import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as os from 'os';

export type SkillType = 'skill' | 'agent' | 'rule';

export interface ScannedSkill {
  id: string;
  name: string;
  description: string;
  content: string;
  rawContent: string;
  filePath: string;
  realPath: string;
  toolSource: string;
  type: SkillType;
  tags: string[];
  fileSize: number;
  lastModified: number;
  // Rule-specific frontmatter (Cursor .mdc), when present.
  globs?: string[];
  alwaysApply?: boolean;
}

interface ToolConfig {
  id: string;
  name: string;
  paths: { subDir: string; type: SkillType }[];
  platformFilter?: string[];
}

const TOOLS: ToolConfig[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    paths: [
      { subDir: '.claude/skills', type: 'skill' },
      { subDir: '.claude/agents', type: 'agent' }
    ]
  },
  {
    id: 'cursor',
    name: 'Cursor',
    paths: [
      { subDir: '.cursor/skills', type: 'skill' },
      { subDir: '.cursor/rules', type: 'rule' },
      { subDir: '.cursor/agents', type: 'agent' }
    ]
  },
  {
    id: 'codex',
    name: 'Codex',
    paths: [
      { subDir: '.codex/skills', type: 'skill' },
      { subDir: '.codex/agents', type: 'agent' }
    ]
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    paths: [
      { subDir: '.codeium/windsurf/memories', type: 'skill' },
      { subDir: '.windsurf/rules', type: 'rule' }
    ]
  },
  {
    id: 'amp',
    name: 'Amp',
    paths: [
      { subDir: '.config/amp/skills', type: 'skill' }
    ]
  },
  {
    id: 'global-agents',
    name: 'Global Agents',
    paths: [
      { subDir: '.agents/skills', type: 'skill' }
    ]
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    paths: [
      { subDir: '.gemini', type: 'agent' }
    ]
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    paths: [
      { subDir: '.opencode', type: 'skill' }
    ]
  },
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    platformFilter: ['darwin'],
    paths: [
      { subDir: 'Library/Application Support/Claude', type: 'agent' }
    ]
  }
];

/**
 * Resolve the directory (relative to home) that a skill/agent of the given type
 * should be written to for a tool. Derived from the same TOOLS table used for
 * scanning, so copies land where the scanner will find them. Prefers the first
 * path matching the type, then falls back to the tool's first path.
 */
export function getToolWriteSubDir(toolId: string, type: SkillType): string | null {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool || tool.paths.length === 0) return null;
  const match = tool.paths.find(p => p.type === type) ?? tool.paths[0];
  return match.subDir;
}

function generateId(realPath: string): string {
  return Buffer.from(realPath).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
}

async function scanDirectory(dir: string, toolId: string, type: SkillType, scannedMap: Map<string, ScannedSkill>) {
  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await scanDirectory(fullPath, toolId, type, scannedMap);
      } else if (file.isFile() && (fullPath.endsWith('.md') || fullPath.endsWith('.mdc'))) {
        try {
          const realPath = await fs.promises.realpath(fullPath);
          if (scannedMap.has(realPath)) {
            continue; // Deduplicate symlinks
          }

          const stats = await fs.promises.stat(realPath);
          const rawContent = await fs.promises.readFile(realPath, 'utf8');
          
          let name = file.name.replace(/\.(md|mdc)$/, '');
          let description = '';
          let tags: string[] = [];
          let content = rawContent;
          let globs: string[] | undefined;
          let alwaysApply: boolean | undefined;

          // Simple Frontmatter parser for markdown (.md) and cursor (.mdc)
          const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
          const match = rawContent.match(frontmatterRegex);
          if (match) {
            try {
              const fm = yaml.load(match[1]) as any;
              if (fm) {
                if (fm.name) name = fm.name;
                if (fm.description) description = fm.description;
                if (fm.tags) tags = Array.isArray(fm.tags) ? fm.tags : [fm.tags];
                // Rule-specific (Cursor .mdc) frontmatter.
                if (fm.globs !== undefined && fm.globs !== null && fm.globs !== '') {
                  globs = Array.isArray(fm.globs)
                    ? fm.globs.map(String)
                    : String(fm.globs).split(',').map((g: string) => g.trim()).filter(Boolean);
                }
                if (typeof fm.alwaysApply === 'boolean') alwaysApply = fm.alwaysApply;
              }
            } catch (e) {
              // Failed to parse YAML, keep defaults
            }
            content = rawContent.slice(match[0].length).trim();
          }

          scannedMap.set(realPath, {
            id: generateId(realPath),
            name,
            description,
            content,
            rawContent,
            filePath: fullPath,
            realPath,
            toolSource: toolId,
            type,
            tags,
            fileSize: stats.size,
            lastModified: stats.mtimeMs,
            globs,
            alwaysApply
          });
        } catch (err) {
          console.error(`Error processing file ${fullPath}:`, err);
        }
      }
    }
  } catch (err) {
    // Directory might not exist, ignore
  }
}

export async function scanAllTools(homeDir: string): Promise<ScannedSkill[]> {
  const scannedMap = new Map<string, ScannedSkill>();
  const currentPlatform = process.platform;

  for (const tool of TOOLS) {
    if (tool.platformFilter && !tool.platformFilter.includes(currentPlatform)) {
      continue;
    }

    for (const config of tool.paths) {
      const targetDir = path.join(homeDir, config.subDir);
      await scanDirectory(targetDir, tool.id, config.type, scannedMap);
    }
  }

  return Array.from(scannedMap.values());
}
