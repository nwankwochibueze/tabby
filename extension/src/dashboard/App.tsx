// WHY THIS FILE EXISTS:
// App.tsx is the root component of the Tabby side panel.
// It reads tab groups from chrome.storage, manages search
// and filter state, and renders the full panel UI.
// It also checks for a JWT token — if none exists it shows
// the LoginForm instead of the main dashboard.

import { useState, useEffect } from "react";
import type { TabGroup } from "@tabby/types";
import PanelHeader from "../components/PanelHeader";
import SearchBar from "../components/SearchBar";
import FilterChip from "../components/FilterChip";
import GroupCard from "../components/GroupCard";
import LoginForm from "../components/LoginForm";
import { tokenApi } from "../shared/api";

type FilterMode = "ALL_TABS" | "RECENT" | "DUPLICATES";

const App = () => {
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("ALL_TABS");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // WHY: Check for existing token on mount to decide which view to show.
  useEffect(() => {
    tokenApi.exists().then(setIsLoggedIn);
  }, []);

  useEffect(() => {
    chrome.storage.local.get(["groups"], (result) => {
      setGroups((result["groups"] as TabGroup[]) ?? []);
    });

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
    ) => {
      if (changes["groups"]) {
        setGroups((changes["groups"].newValue as TabGroup[]) ?? []);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const filteredGroups = groups
    .map((group) => {
      const filteredTabs = group.tabs.filter((tab) => {
        const query = searchQuery.toLowerCase();
        if (!query) return true;
        return (
          tab.title.toLowerCase().includes(query) ||
          tab.url.toLowerCase().includes(query)
        );
      });
      return { ...group, tabs: filteredTabs };
    })
    .filter((group) => group.tabs.length > 0);

  const totalTabs = groups.reduce((sum, g) => sum + g.tabs.length, 0);

  // WHY: null means token check is still in progress — render nothing
  // to avoid a flash of the wrong screen.
  if (isLoggedIn === null) return null;

  // WHY: No token found — show login form instead of dashboard.
  if (!isLoggedIn) {
    return (
      <div
        style={{
          width: "var(--panel-width)",
          height: "100vh",
          background: "var(--bg-base)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <LoginForm onSuccess={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "var(--panel-width)",
        height: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-family)",
        overflow: "hidden",
      }}
    >
      <PanelHeader totalTabs={totalTabs} />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)",
          padding: "var(--spacing-sm) var(--spacing-sm) var(--spacing-xl)",
        }}
      >
        <SearchBar onSearch={setSearchQuery} />

        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          {(["ALL_TABS", "RECENT", "DUPLICATES"] as FilterMode[]).map(
            (mode) => (
              <FilterChip
                key={mode}
                label={mode.replace("_", " ")}
                isActive={filterMode === mode}
                onClick={() => setFilterMode(mode)}
              />
            ),
          )}
        </div>

        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              color: "var(--text-muted)",
              fontSize: "var(--font-size-sm)",
              fontFamily: "var(--font-family)",
              paddingTop: "var(--spacing-xl)",
            }}
          >
            No tabs found
          </div>
        )}

        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--spacing-xs)",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-family)",
            cursor: "pointer",
            padding: "var(--spacing-md)",
            letterSpacing: "0.05em",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--text-muted)";
          }}
        >
          ⊕ NEW GROUP
        </button>
      </div>
    </div>
  );
};

export default App;
