import type { Tab, TabGroup, TabContext } from '@tabby/types';
import { detectContext } from './utils/detectContext';

// Why: Maps each context to a display color for the visual map (Phase 3)
const CONTEXT_COLORS: Record<TabContext, string> = {
  work: '#4F8EF7',
  research: '#A78BFA',
  entertainment: '#F87171',
  social: '#34D399',
  shopping: '#FBBF24',
  unknown: '#9CA3AF',
};

// Why: Maps context to a human-readable group label
const CONTEXT_LABELS: Record<TabContext, string> = {
  work: 'Work',
  research: 'Research',
  entertainment: 'Entertainment',
  social: 'Social',
  shopping: 'Shopping',
  unknown: 'Other',
};

// Why: Converts a raw chrome.tabs.Tab into our typed Tab interface
const toTab = (chromeTab: chrome.tabs.Tab): Tab | null => {
  // Why: Tabs without an id or url are not usable
  if (!chromeTab.id || !chromeTab.url) return null;

  const url = chromeTab.url;
  const title = chromeTab.title ?? '';
  const context = detectContext(url, title);

  return {
    id: chromeTab.id,
    url,
    title,
    favIconUrl: chromeTab.favIconUrl,
    windowId: chromeTab.windowId,
    active: chromeTab.active,
    pinned: chromeTab.pinned,
    lastAccessed: chromeTab.lastAccessed,
    context,
  };
};

// Why: Main grouping function — takes raw Chrome tabs and returns TabGroups
export const groupTabs = (chromeTabs: chrome.tabs.Tab[]): TabGroup[] => {
  const tabsByContext = new Map<TabContext, Tab[]>();

  for (const chromeTab of chromeTabs) {
    const tab = toTab(chromeTab);
    if (!tab) continue;

    const existing = tabsByContext.get(tab.context) ?? [];
    tabsByContext.set(tab.context, [...existing, tab]);
  }

  const now = Date.now();

  // Why: Convert the map into an array of TabGroup objects
  const groups: TabGroup[] = [];

  for (const [context, tabs] of tabsByContext.entries()) {
    groups.push({
      id: `group-${context}`,
      label: CONTEXT_LABELS[context],
      context,
      color: CONTEXT_COLORS[context],
      tabs,
      createdAt: now,
      updatedAt: now,
    });
  }

  return groups;
};