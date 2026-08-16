import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (import.meta.env.DEV) {
  // Dev-only: expose stores for debugging/manual testing in the browser.
  import('./stores/appStore').then((m) => ((window as any).appStore = m.useAppStore));
  import('./stores/editorStore').then((m) => ((window as any).editorStore = m.useEditorStore));
  import('./stores/settingsStore').then((m) => ((window as any).settingsStore = m.useSettingsStore));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
