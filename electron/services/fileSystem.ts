import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { getToolWriteSubDir } from './fileScanner';

export async function readSkillFile(filePath: string): Promise<string> {
  return await fs.promises.readFile(filePath, 'utf8');
}

export async function writeSkillFile(filePath: string, content: string): Promise<void> {
  const tempPath = `${filePath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(tempPath, content, 'utf8');
    await fs.promises.rename(tempPath, filePath);
  } catch (error) {
    try {
      await fs.promises.unlink(tempPath);
    } catch (e) {
      // Ignore cleanup error
    }
    throw error;
  }
}

export async function deleteSkillFile(filePath: string): Promise<void> {
  await fs.promises.unlink(filePath);
}

/**
 * Return a path that does not yet exist, appending "-copy", "-copy2", ... to the
 * base name until a free slot is found.
 */
async function uniquePath(desired: string): Promise<string> {
  const dir = path.dirname(desired);
  const ext = path.extname(desired);
  const base = path.basename(desired, ext);
  let candidate = desired;
  let n = 1;
  for (;;) {
    try {
      await fs.promises.access(candidate);
    } catch {
      return candidate;
    }
    candidate = path.join(dir, `${base}-copy${n > 1 ? n : ''}${ext}`);
    n++;
  }
}

/**
 * Copy an existing skill/agent file into another tool's directory. The original
 * is left untouched; the copy keeps the same file name (deduped if it collides).
 * Returns the path of the newly created copy.
 */
export async function copySkillToTool(
  sourcePath: string,
  targetToolId: string,
  type: 'skill' | 'agent'
): Promise<string> {
  const subDir = getToolWriteSubDir(targetToolId, type);
  if (!subDir) {
    throw new Error(`No writable directory known for tool: ${targetToolId}`);
  }
  const content = await fs.promises.readFile(sourcePath, 'utf8');
  const targetDir = path.join(os.homedir(), subDir);
  const targetPath = await uniquePath(path.join(targetDir, path.basename(sourcePath)));
  await writeSkillFile(targetPath, content);
  return targetPath;
}

export async function createSkillFile(toolId: string, name: string, type: 'skill' | 'agent'): Promise<string> {
  // Determine appropriate directory based on toolId and type
  const homeDir = os.homedir();
  let subDir = '';
  
  // This could be imported from a shared config with fileScanner, 
  // but keeping it simple for now as an example mapping
  if (toolId === 'claude-code') subDir = type === 'skill' ? '.claude/skills' : '.claude/agents';
  else if (toolId === 'cursor') subDir = type === 'skill' ? '.cursor/skills' : '.cursor/agents';
  else if (toolId === 'codex') subDir = type === 'skill' ? '.codex/skills' : '.codex/agents';
  else if (toolId === 'windsurf') subDir = '.codeium/windsurf/memories'; // fallback
  else subDir = '.agents/skills'; // global fallback

  const targetDir = path.join(homeDir, subDir);
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  
  // Extension logic: use .mdc for cursor if preferred, else .md
  const ext = (toolId === 'cursor' && type === 'skill') ? '.mdc' : '.md';
  const filePath = path.join(targetDir, `${safeName}${ext}`);

  const content = `---
name: ${name}
description: A new ${type} for ${toolId}
---

# ${name}

Write your instructions here.
`;

  // Make sure we don't overwrite if it already exists
  try {
    await fs.promises.access(filePath);
    throw new Error(`File already exists: ${filePath}`);
  } catch (e: any) {
    if (e.code !== 'ENOENT') throw e;
  }

  await writeSkillFile(filePath, content);
  return filePath;
}
