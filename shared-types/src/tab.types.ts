export type TabContext =
  | 'work'
  | 'research'
  | 'entertainment'
  | 'social'
  | 'shopping'
  | 'unknown';

export interface Tab {
  id: number;
  url: string;
  title: string;
  favIconUrl?: string;
  windowId: number;
  active: boolean;
  pinned: boolean;
  lastAccessed?: number;
  context: TabContext;
}

export interface TabGroup {
  id: string;
  label: string;
  context: TabContext;
  color: string;
  tabs: Tab[];
  createdAt: number;
  updatedAt: number;
}