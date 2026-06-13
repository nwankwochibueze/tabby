// WHY THIS FILE EXISTS:
// App.tsx is the root component of the Tabby side panel.
// Manages two views — dashboard and settings.
// Dashboard shows tab groups. Settings shows account and session management.
// Switching between them keeps both views clean and uncluttered.

import { useState, useEffect } from "react";
import type { TabGroup } from "@tabby/types";
import PanelHeader from "../components/PanelHeader";
import SearchBar from "../components/SearchBar";
import FilterChip from "../components/FilterChip";
import GroupCard from "../components/GroupCard";
import LoginForm from "../components/LoginForm";
import SettingsPanel from "../components/SettingsPanel";
import { tokenApi } from "../shared/api";

type FilterMode = "ALL_TABS" | "RECENT" | "DUPLICATES";
type View = "dashboard" | "settings" | "login";

const App = () => {
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("ALL_TABS");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [showCrashRestore, setShowCrashRestore] = useState(false);

  useEffect(() => {
    tokenApi.exists().then(setIsLoggedIn);
  }, []);

  useEffect(() => {
    chrome.storage.local.get(["showCrashRestore"], (result) => {
      if (result["showCrashRestore"]) setShowCrashRestore(true);
    });
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

  if (isLoggedIn === null)
    return (
      <div
        style={{
          width: "var(--panel-width)",
          height: "100vh",
          background: "var(--bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "var(--logomark-size)",
            height: "var(--logomark-size)",
            borderRadius: "var(--radius-sm)",
            background:
              "linear-gradient(135deg, var(--context-work), var(--context-research))",
          }}
        />
      </div>
    );

  if (view === "login") {
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
        <LoginForm
          onSuccess={() => {
            setIsLoggedIn(true);
            setView("dashboard");
          }}
        />
      </div>
    );
  }

  if (view === "settings") {
    return (
      <SettingsPanel
        isLoggedIn={isLoggedIn === true}
        groups={groups}
        onClose={() => setView("dashboard")}
        onLogout={() => {
          setIsLoggedIn(false);
          setView("dashboard");
        }}
        onLogin={() => setView("login")}
      />
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
        onSettingsClick={() => setView("settings")}
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

        {/* Crash restore banner */}
        {showCrashRestore && (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--context-shopping)",
              borderRadius: "var(--radius-sm)",
              padding: "var(--spacing-sm) var(--spacing-md)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-xs)",
            }}
          >
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-family)",
              }}
            >
              ⚠️ Chrome closed unexpectedly
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-family)",
              }}
            >
              Restore your last saved session?
            </div>
            <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
              <button
                onClick={() => {
                  setShowCrashRestore(false);
                  setView("settings");
                  chrome.runtime.sendMessage({ type: "DISMISS_CRASH_RESTORE" });
                }}
                style={{
                  padding: "4px var(--spacing-sm)",
                  background: "var(--interactive-primary)",
                  border: "none",
                  borderRadius: "var(--radius-xs)",
                  color: "var(--text-inverse)",
                  fontSize: "var(--font-size-xs)",
                  fontFamily: "var(--font-family)",
                  cursor: "pointer",
                }}
              >
                View Sessions
              </button>
              <button
                onClick={() => {
                  setShowCrashRestore(false);
                  chrome.runtime.sendMessage({ type: "DISMISS_CRASH_RESTORE" });
                }}
                style={{
                  padding: "4px var(--spacing-sm)",
                  background: "transparent",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-xs)",
                  color: "var(--text-muted)",
                  fontSize: "var(--font-size-xs)",
                  fontFamily: "var(--font-family)",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </div>
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
