import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Plus, FileText, Contact, ScrollText, Folder, Globe } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { CreateDialog } from '../../stores/appStore';

const item =
  'flex items-center gap-2.5 px-2.5 py-1.5 text-sm text-[var(--text-primary)] rounded outline-none cursor-pointer data-[highlighted]:bg-[var(--surface-2)]';

export function CreateMenu() {
  const setCreateDialog = useAppStore((s) => s.setCreateDialog);
  const open = (d: CreateDialog) => setCreateDialog(d);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          title="New…"
          className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors outline-none"
        >
          <Plus className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[190px] bg-[var(--bg-tertiary)] border border-[var(--border-2)] rounded-lg p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          <DropdownMenu.Item className={item} onSelect={() => open('skill')}>
            <FileText size={16} className="text-[var(--text-secondary)]" /> New Skill
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onSelect={() => open('agent')}>
            <Contact size={16} className="text-[var(--text-secondary)]" /> New Agent
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onSelect={() => open('rule')}>
            <ScrollText size={16} className="text-[var(--text-secondary)]" /> New Rule
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onSelect={() => open('collection')}>
            <Folder size={16} className="text-[var(--text-secondary)]" /> New Collection
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-2)]" />
          <DropdownMenu.Item className={item} onSelect={() => open('registry')}>
            <Globe size={16} className="text-[var(--text-secondary)]" /> Browse Registry
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
