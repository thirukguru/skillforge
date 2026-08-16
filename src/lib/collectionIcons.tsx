import React from 'react';
import {
  Folder, Star, Bookmark, Tag, Inbox, Archive,
  FileText, Settings, Wrench, Hammer, Paintbrush, Sparkles,
  Terminal, Globe, Globe2, Zap, Flame, Leaf,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Ordered set of icons offered in the collection icon picker.
export const COLLECTION_ICONS: Record<string, LucideIcon> = {
  Folder, Star, Bookmark, Tag, Inbox, Archive,
  FileText, Settings, Wrench, Hammer, Paintbrush, Sparkles,
  Terminal, Globe, Globe2, Zap, Flame, Leaf,
};

export const COLLECTION_ICON_NAMES = Object.keys(COLLECTION_ICONS);

/** Render a collection's icon by stored name, falling back to Folder. */
export function CollectionIcon({ name, size = 16, className }: { name?: string; size?: number; className?: string }) {
  const Icon = (name && COLLECTION_ICONS[name]) || Folder;
  return <Icon size={size} className={className} />;
}
