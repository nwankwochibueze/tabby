import type { TabGroup } from './tab.types';

export interface Session {
  id: string;
  userId: string;
  name: string;
  groups: TabGroup[];
  createdAt: number;
  updatedAt: number;
}

export interface SessionSnapshot {
  id: string;
  sessionId: string;
  groups: TabGroup[];
  snapshotAt: number;
}