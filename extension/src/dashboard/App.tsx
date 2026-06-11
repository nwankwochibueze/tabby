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
import { tokenApi, sessionsApi } from "../shared/api";

type FilterMode = "ALL_TABS" | "RECENT" | "DUPLICATES";

const App = () => {
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("ALL_TABS");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

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
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const handleSaveSession = async () => {
    if (!sessionName.trim()) return;

    setSaveStatus("saving");
    try {
      const result = await sessionsApi.save(sessionName.trim(), groups);
      if (result.error) {
        setSaveStatus("error");
        return;
      }
      setSaveStatus("saved");
      setSessionName("");
      setShowSaveInput(false);
      // WHY: Reset status after 2 seconds so button returns to normal
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  };

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

  if (isLoggedIn === null) return null;

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
      <PanelHeader
        totalTabs={totalTabs}
        onLogout={() => setIsLoggedIn(false)}
        onLogin={() => setIsLoggedIn(false)}
        isLoggedIn={isLoggedIn === true}
      />

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

        {/* Save Session UI — only shown when logged in */}
        {isLoggedIn && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-xs)",
            }}
          >
            {showSaveInput ? (
              <div
                style={{
                  display: "flex",
                  gap: "var(--spacing-xs)",
                }}
              >
                <input
                  type="text"
                  placeholder="Session name..."
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSession()}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: "6px var(--spacing-sm)",
                    background: "var(--bg-surface-raised)",
                    border: "1px solid var(--border-focus)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-primary)",
                    fontSize: "var(--font-size-sm)",
                    fontFamily: "var(--font-family)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSaveSession}
                  disabled={saveStatus === "saving"}
                  style={{
                    padding: "6px var(--spacing-sm)",
                    background: "var(--interactive-primary)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-inverse)",
                    fontSize: "var(--font-size-xs)",
                    fontFamily: "var(--font-family)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {saveStatus === "saving" ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setShowSaveInput(false);
                    setSessionName("");
                  }}
                  style={{
                    padding: "6px var(--spacing-sm)",
                    background: "transparent",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-muted)",
                    fontSize: "var(--font-size-xs)",
                    fontFamily: "var(--font-family)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveInput(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--spacing-xs)",
                  padding: "7px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  color:
                    saveStatus === "saved"
                      ? "var(--context-social)"
                      : "var(--text-secondary)",
                  fontSize: "var(--font-size-xs)",
                  fontFamily: "var(--font-family)",
                  cursor: "pointer",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                {saveStatus === "saved"
                  ? "✓ Session saved"
                  : "💾 Save current session"}
              </button>
            )}
          </div>
        )}

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
