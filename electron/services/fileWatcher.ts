import * as chokidar from 'chokidar';

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
}

let watcher: chokidar.FSWatcher | null = null;
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 300;
const pendingEvents: Map<string, FileChangeEvent> = new Map();

export function startWatching(dirs: string[], callback: (event: FileChangeEvent) => void): () => void {
  stopWatching();

  watcher = chokidar.watch(dirs, {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  });

  const notify = () => {
    for (const event of pendingEvents.values()) {
      callback(event);
    }
    pendingEvents.clear();
  };

  const scheduleNotify = (event: FileChangeEvent) => {
    pendingEvents.set(event.path, event);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(notify, DEBOUNCE_MS);
  };

  watcher
    .on('add', (path) => scheduleNotify({ type: 'add', path }))
    .on('change', (path) => scheduleNotify({ type: 'change', path }))
    .on('unlink', (path) => scheduleNotify({ type: 'unlink', path }));

  return stopWatching;
}

export function stopWatching() {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  pendingEvents.clear();
}
