import { groupTabs } from '../shared/groupEngine';

// Why: Initialize storage with empty defaults on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Tabby] Extension installed');
  chrome.storage.local.set({ groups: [], sessions: [] });
});

// Why: Re-run grouping engine whenever the tab state changes
const refreshGroups = (): void => {
  chrome.tabs.query({}, (chromeTabs) => {
    const groups = groupTabs(chromeTabs);
    chrome.storage.local.set({ groups });
    console.log('[Tabby] Groups updated:', groups);
  });
};

// Why: Run grouping when a new tab is created
chrome.tabs.onCreated.addListener(() => {
  refreshGroups();
});

// Why: Run grouping when a tab finishes loading (URL/title now available)
chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    refreshGroups();
  }
});

// Why: Re-group when a tab is closed
chrome.tabs.onRemoved.addListener(() => {
  refreshGroups();
});

// Why: Track which tab is active (used for insights in Phase 5)
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('[Tabby] Tab activated:', activeInfo.tabId);
});

// Why: Respond to popup/dashboard requesting current groups
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_GROUPS') {
    chrome.storage.local.get(['groups'], (result) => {
      sendResponse({ groups: result['groups'] ?? [] });
    });
    return true;
  }

  if (message.type === 'GET_ALL_TABS') {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ tabs });
    });
    return true;
  }
});