import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';

export function MarkdownEditor() {
  const { currentContent, setContent } = useEditorStore();
  const { settings } = useSettingsStore();

  const fontSize = settings?.fontSize || 14;
  const fontFamily = settings?.editorFont || "'JetBrains Mono', monospace";
  const isLight = settings?.theme === 'light';

  // Match CodeMirror's typography to the app's editor-font settings. Font size
  // goes on the root (cascades) and family on scroller/content/gutters; both use
  // !important so they win over the one-dark base theme.
  const fontTheme = useMemo(
    () =>
      EditorView.theme({
        '&': { height: '100%', backgroundColor: 'transparent', fontSize: `${fontSize}px !important` },
        '.cm-scroller': { fontFamily: `${fontFamily} !important`, overflow: 'auto' },
        '.cm-content': { fontFamily: `${fontFamily} !important`, padding: '16px 0' },
        '.cm-gutters': { fontFamily: `${fontFamily} !important`, backgroundColor: 'transparent', border: 'none' },
        '&.cm-focused': { outline: 'none' },
      }),
    [fontFamily, fontSize]
  );

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
      fontTheme,
    ],
    [fontTheme]
  );

  return (
    <div className="flex-1 w-full h-full overflow-hidden bg-[var(--bg-primary)]">
      <CodeMirror
        value={currentContent}
        onChange={setContent}
        extensions={extensions}
        theme={isLight ? 'light' : oneDark}
        height="100%"
        style={{ height: '100%' }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: !isLight,
          autocompletion: false,
        }}
      />
    </div>
  );
}
