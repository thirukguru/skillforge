import { create } from 'zustand';

interface EditorState {
  mode: 'edit' | 'preview';
  isDirty: boolean;
  originalContent: string;
  currentContent: string;
  
  setMode: (mode: 'edit' | 'preview') => void;
  setContent: (content: string) => void;
  loadContent: (content: string) => void;
  markSaved: () => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'preview',
  isDirty: false,
  originalContent: '',
  currentContent: '',

  setMode: (mode) => set({ mode }),
  setContent: (content) => set((state) => ({ 
    currentContent: content,
    isDirty: content !== state.originalContent
  })),
  loadContent: (content) => set({ 
    originalContent: content, 
    currentContent: content, 
    isDirty: false,
    mode: 'preview' // Optional: reset to preview on load
  }),
  markSaved: () => set((state) => ({ 
    isDirty: false,
    originalContent: state.currentContent 
  })),
  reset: () => set({ 
    mode: 'preview', 
    isDirty: false, 
    originalContent: '', 
    currentContent: '' 
  })
}));
