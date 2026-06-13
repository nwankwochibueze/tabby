// WHY THIS FILE EXISTS:
// Shows both manual and auto-saved sessions in the gear menu.
// Manual saves are permanent named workspaces.
// Auto saves are the last 3 automatic snapshots for crash recovery.

import { useState, useEffect } from "react";
import { sessionsApi } from "../shared/api";

interface ManualSession {
  id: string;
  name: string;
  createdAt: string;
  groups: Array<{
    label: string;
    tabs: Array<{ url: string; title: string }>;
  }>;
}

interface AutoSave {
  id: string;
  name: string;
  savedAt: string;
  groups: Array<{
    label: string;
    tabs: Array<{ url: string; title: string }>;
  }>;
}

interface SessionsListProps {
  onClose: () => void;
}

const SessionsList = ({ onClose }: SessionsListProps) => {
  const [manualSessions, setManualSessions] = useState<ManualSession[]>([]);
  const [autoSaves, setAutoSaves] = useState<AutoSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    // Load manual sessions from backend
    sessionsApi.getAll().then((result) => {
      setManualSessions(result.sessions ?? []);
    });

    // Load auto saves from chrome.storage
    chrome.runtime.sendMessage({ type: "GET_AUTO_SAVES" }, (response) => {
      setAutoSaves(response?.autoSaves ?? []);
      setLoading(false);
    });
  }, []);

  const restoreTabs = (groups: AutoSave["groups"]) => {
    chrome.tabs.query({}, (existingTabs) => {
      const openUrls = new Set(existingTabs.map((t) => t.url));
      for (const group of groups) {
        for (const tab of group.tabs) {
          if (
            tab.url &&
            !tab.url.startsWith("chrome://") &&
            !openUrls.has(tab.url)
          ) {
            chrome.tabs.create({ url: tab.url, active: false });
          }
        }
      }
      setRestoring(null);
      onClose();
    });
  };

  const handleRestoreManual = (session: ManualSession) => {
    setRestoring(session.id);
    restoreTabs(session.groups);
  };

  const handleRestoreAuto = (save: AutoSave) => {
    setRestoring(save.id);
    restoreTabs(save.groups);
  };

  const handleDeleteManual = async (id: string) => {
    await sessionsApi.delete(id);
    setManualSessions(manualSessions.filter((s) => s.id !== id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalTabs = (groups: AutoSave["groups"]) =>
    groups.reduce((sum, g) => sum + g.tabs.length, 0);

  const sessionRowStyle = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-xs)",
    padding: "var(--spacing-sm) var(--spacing-md)",
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
  };

  const restoreButtonStyle = {
    padding: "4px var(--spacing-sm)",
    background: "var(--interactive-primary)",
    border: "none",
    borderRadius: "var(--radius-xs)",
    color: "var(--text-inverse)",
    fontSize: "var(--font-size-xs)",
    fontFamily: "var(--font-family)",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  };

  const deleteButtonStyle = {
    padding: "4px var(--spacing-sm)",
    background: "transparent",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-xs)",
    color: "var(--text-muted)",
    fontSize: "var(--font-size-xs)",
    fontFamily: "var(--font-family)",
    cursor: "pointer",
    flexShrink: 0,
  };

  const sectionLabelStyle = {
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)" as const,
    color: "var(--text-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    fontFamily: "var(--font-family)",
    padding: "var(--spacing-xs) 0",
  };

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--spacing-lg)",
          color: "var(--text-muted)",
          fontSize: "var(--font-size-sm)",
          fontFamily: "var(--font-family)",
        }}
      >
        Loading sessions...
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-sm)",
        padding: "var(--spacing-md)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={sectionLabelStyle}>Sessions</span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-family)",
          }}
        >
          ✕
        </button>
      </div>

      {/* Manual saves */}
      <div style={sectionLabelStyle}>Saved Workspaces</div>

      {manualSessions.length === 0 && (
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-family)",
            padding: "var(--spacing-xs) 0",
          }}
        >
          No saved workspaces yet
        </div>
      )}

      {manualSessions.map((session) => (
        <div key={session.id} style={sessionRowStyle}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-family)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {session.name}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-family)",
                marginTop: "2px",
              }}
            >
              {totalTabs(session.groups)} tabs · {formatDate(session.createdAt)}
            </div>
          </div>
          <button
            onClick={() => handleRestoreManual(session)}
            disabled={restoring === session.id}
            style={restoreButtonStyle}
          >
            {restoring === session.id ? "Opening..." : "Restore"}
          </button>
          <button
            onClick={() => handleDeleteManual(session.id)}
            style={deleteButtonStyle}
          >
            ✕
          </button>
        </div>
      ))}

      {/* Auto saves */}
      <div style={{ ...sectionLabelStyle, marginTop: "var(--spacing-sm)" }}>
        Auto Saves
      </div>

      {autoSaves.length === 0 && (
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-family)",
            padding: "var(--spacing-xs) 0",
          }}
        >
          No auto saves yet — saves every 30 mins
        </div>
      )}

      {autoSaves.map((save) => (
        <div key={save.id} style={sessionRowStyle}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-family)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {save.name}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-family)",
                marginTop: "2px",
              }}
            >
              {totalTabs(save.groups)} tabs · {formatDate(save.savedAt)}
            </div>
          </div>
          <button
            onClick={() => handleRestoreAuto(save)}
            disabled={restoring === save.id}
            style={restoreButtonStyle}
          >
            {restoring === save.id ? "Opening..." : "Restore"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SessionsList;
