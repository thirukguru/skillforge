import { useAppStore } from '../../stores/appStore';
import { useEditorStore } from '../../stores/editorStore';
import { countWords, estimateTokens, formatCount } from '../../lib/textStats';

export default function StatusBar() {
  const { skills, isScanning, selectedSkill } = useAppStore();
  const currentContent = useEditorStore((s) => s.currentContent);

  const skillsCount = skills.filter(s => s.type === 'skill').length;
  const agentsCount = skills.filter(s => s.type === 'agent').length;
  const toolDirs = [...new Set(skills.map(s => s.toolSource))].length;

  // Count against the live editor content when a skill is open, falling back
  // to its raw file content before the editor has loaded.
  const activeContent = selectedSkill ? (currentContent || selectedSkill.rawContent) : '';
  const words = countWords(activeContent);
  const tokens = estimateTokens(activeContent);

  return (
    <div className="h-7 w-full bg-[#16171b] border-t border-white/5 flex items-center justify-between px-4 text-xs text-white/40 select-none flex-shrink-0">
      <div className="flex items-center gap-4">
        <span>Watching {toolDirs} tool{toolDirs !== 1 ? 's' : ''}</span>
        <span className="text-white/10">·</span>
        <span>{skillsCount} skills</span>
        <span className="text-white/10">·</span>
        <span>{agentsCount} agents</span>
      </div>

      <div className="flex items-center gap-4">
        {selectedSkill && (
          <>
            <span title="Word count">{formatCount(words)} word{words !== 1 ? 's' : ''}</span>
            <span className="text-white/10">·</span>
            <span title="Estimated token count (~4 chars/token)">~{formatCount(tokens)} tokens</span>
            <span className="text-white/10">·</span>
          </>
        )}
        {isScanning ? (
          <span className="text-emerald-400 animate-pulse">Scanning...</span>
        ) : (
          <span>Ready</span>
        )}
      </div>
    </div>
  );
}
