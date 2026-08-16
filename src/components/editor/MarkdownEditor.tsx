import React from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';

export function MarkdownEditor() {
  const { currentContent, setContent } = useEditorStore();
  const { settings } = useSettingsStore();

  return (
    <div className="flex-1 w-full h-full">
      <Editor
        language="markdown"
        theme={settings?.theme === 'light' ? 'vs-light' : 'vs-dark'}
        value={currentContent}
        onChange={(value) => setContent(value || '')}
        options={{
          wordWrap: 'on',
          minimap: { enabled: false },
          fontSize: settings?.fontSize || 14,
          fontFamily: settings?.editorFont || 'JetBrains Mono',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 }
        }}
      />
    </div>
  );
}
