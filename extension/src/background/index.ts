// Why: Log when extension installs and initialize storage defaults
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Tabby] Extension installed');
  chrome.storage.local.set({ groups: [], sessions: [] });
});

// Why: Fired when any tab is created — entry point for grouping logic (Phase 2)
chrome.tabs.onCreated.addListener((tab) => {
  console.log('[Tabby] Tab created:', tab.id, tab.url);
});

// Why: Fired when tab URL or title changes — re-evaluate its context
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('[Tabby] Tab updated:', tabId, tab.url);
  }
});

// Why: Fired when a tab is closed — trigger session snapshot (Phase 4)
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('[Tabby] Tab closed:', tabId);
});

// Why: Fired when user switches tabs — track active time (Phase 5)
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('[Tabby] Tab activated:', activeInfo.tabId);
});

// Why: Listen for messages from popup/dashboard
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_ALL_TABS') {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ tabs });
    });
    return true;
  }
});