import React, { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useEditorStore } from '../../stores/editorStore';
import { EditorToolbar } from '../editor/EditorToolbar';
import { MarkdownEditor } from '../editor/MarkdownEditor';
import { MarkdownPreview } from '../editor/MarkdownPreview';
import SettingsPage from '../settings/SettingsPage';

export function DetailPanel() {
  const { showSettings, selectedSkill } = useAppStore();
  const { mode, loadContent, currentContent } = useEditorStore();

  useEffect(() => {
    if (selectedSkill) {
      loadContent(selectedSkill.rawContent || '');
    }
  }, [selectedSkill?.id, loadContent]);

  if (showSettings) {
    return (
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
        <SettingsPage />
      </div>
    );
  }

  if (!selectedSkill) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-1)] flex items-center justify-center mx-auto mb-4 border border-[var(--border-1)] shadow-inner">
            <span className="text-2xl">🪄</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No Skill Selected</h3>
          <p className="text-gray-400 text-sm">Select a skill from the list to view or edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] animate-in fade-in duration-300">
      <EditorToolbar />
      <div className="flex-1 overflow-hidden flex">
        {mode === 'edit' ? (
          <MarkdownEditor />
        ) : (
          <MarkdownPreview content={currentContent} />
        )}
      </div>
    </div>
  );
}
