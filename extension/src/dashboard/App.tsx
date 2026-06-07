// ─── Overview ──────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// App.tsx is the root component of the Tabby side panel.
// It reads tab groups from chrome.storage, manages search
// and filter state, and renders the full panel UI.

import { useState, useEffect } from "react";
import type { TabGroup } from "@tabby/types";
import PanelHeader from "../components/PanelHeader";
import SearchBar from "../components/SearchBar";
import FilterChip from "../components/FilterChip";
import GroupCard from "../components/GroupCard";

type FilterMode = "ALL_TABS" | "RECENT" | "DUPLICATES";

// ─── Component ───────────────────────────────────────────────

const App = () => {
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("ALL_TABS");

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

  // ── Render ────────────────────────────────────────────────

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
      {/* Panel header — always visible */}
      <PanelHeader totalTabs={totalTabs} />

      {/* Scrollable content area */}
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
        {/* Search bar */}
        <SearchBar onSearch={setSearchQuery} />

        {/* Filter chips */}
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-xs)",
          }}
        >
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

        {/* Group cards */}
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

        {/* New group button */}
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
