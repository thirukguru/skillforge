import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { getToolWriteSubDir, type SkillType } from './fileScanner';

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
  type: SkillType
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

export async function createSkillFile(toolId: string, name: string, type: SkillType): Promise<string> {
  // Resolve the destination from the same table the scanner uses, so the new
  // file lands where it will be re-discovered (also handles rule directories).
  const subDir = getToolWriteSubDir(toolId, type) ?? '.agents/skills';
  const targetDir = path.join(os.homedir(), subDir);
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();

  // Cursor skills and rules use the .mdc format; everything else is .md.
  const ext = (toolId === 'cursor' && (type === 'skill' || type === 'rule')) ? '.mdc' : '.md';
  const filePath = path.join(targetDir, `${safeName}${ext}`);

  // Rules carry different frontmatter (globs / alwaysApply) than skills/agents.
  const frontmatter = type === 'rule'
    ? `---\ndescription: A new rule\nglobs:\nalwaysApply: false\n---`
    : `---\nname: ${name}\ndescription: A new ${type} for ${toolId}\n---`;
  const content = `${frontmatter}\n\n# ${name}\n\nWrite your instructions here.\n`;

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
