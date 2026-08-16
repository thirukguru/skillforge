import { useAppStore } from '../stores/appStore';
import { useEditorStore } from '../stores/editorStore';

// Shared skill actions used by both the editor toolbar and the global keyboard
// shortcuts, so behaviour (and the delete confirmation) stays identical.

export async function saveCurrentSkill(): Promise<void> {
  const { selectedSkill } = useAppStore.getState();
  const editor = useEditorStore.getState();
  if (!selectedSkill || !editor.isDirty) return;
  if (window.electronAPI?.writeFile) {
    await window.electronAPI.writeFile(selectedSkill.filePath, editor.currentContent);
    editor.markSaved();
  }
}

/** Delete the selected skill after an explicit confirmation. No-op if declined. */
export async function deleteSelectedSkill(): Promise<void> {
  const { selectedSkill, scanForSkills, selectSkill } = useAppStore.getState();
  if (!selectedSkill) return;

  const confirmed = window.confirm(
    `Delete "${selectedSkill.name}"?\n\nThis permanently removes the file:\n${selectedSkill.filePath}`
  );
  if (!confirmed) return;

  if (window.electronAPI?.deleteFile) {
    await window.electronAPI.deleteFile(selectedSkill.filePath);
  }
  await scanForSkills();
  selectSkill(null);
}
