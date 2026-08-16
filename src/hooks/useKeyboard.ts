import { useEffect } from 'react';

interface UseKeyboardOptions {
  onSave?: () => void;
  onSearch?: () => void;
  onNew?: () => void;
  onEscape?: () => void;
}

export function useKeyboard(opts: UseKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 's' && opts.onSave) {
        e.preventDefault();
        opts.onSave();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'k' && opts.onSearch) {
        e.preventDefault();
        opts.onSearch();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'n' && opts.onNew) {
        e.preventDefault();
        opts.onNew();
      } else if (e.key === 'Escape' && opts.onEscape) {
        e.preventDefault();
        opts.onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opts]);
}
