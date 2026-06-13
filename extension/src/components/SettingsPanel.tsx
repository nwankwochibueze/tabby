// WHY THIS FILE EXISTS:
// SettingsPanel is a full panel view that replaces the dashboard
// when the user clicks the gear icon. It contains all account
// and session management in one contained place.
// The dashboard is never disrupted — settings takes over the
// full panel height and closes cleanly when done.

import { useState, useEffect } from "react";
import { ArrowLeft, SignOut, SignIn } from "@phosphor-icons/react";
import { tokenApi, sessionsApi } from "../shared/api";

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

interface SettingsPanelProps {
  isLoggedIn: boolean;
  groups: unknown[];
  onClose: () => void;
  onLogout: () => void;
  onLogin: () => void;
}

const SettingsPanel = ({
  isLoggedIn,
  groups,
  onClose,
  onLogout,
  onLogin,
}: SettingsPanelProps) => {
  const [manualSessions, setManualSessions] = useState<ManualSession[]>([]);
  const [autoSaves, setAutoSaves] = useState<AutoSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    sessionsApi.getAll().then((result) => {
      setManualSessions(result.sessions ?? []);
    });

    chrome.runtime.sendMessage({ type: "GET_AUTO_SAVES" }, (response) => {
      setAutoSaves(response?.autoSaves ?? []);
      setLoading(false);
    });
  }, [isLoggedIn]);

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
      // Refresh sessions list
      sessionsApi.getAll().then((r) => setManualSessions(r.sessions ?? []));
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  };

  const restoreTabs = (sessionGroups: AutoSave["groups"], id: string) => {
    setRestoring(id);
    chrome.tabs.query({}, (existingTabs) => {
      const openUrls = new Set(existingTabs.map((t) => t.url));
      for (const group of sessionGroups) {
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
    });
  };

  const handleDeleteManual = async (id: string) => {
    await sessionsApi.delete(id);
    setManualSessions(manualSessions.filter((s) => s.id !== id));
  };

  const handleLogout = async () => {
    await tokenApi.clear();
    onLogout();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const totalTabs = (g: AutoSave["groups"]) =>
    g.reduce((sum, group) => sum + group.tabs.length, 0);

  const sectionLabel = (text: string) => (
    <div
      style={{
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontFamily: "var(--font-family)",
        padding: "var(--spacing-sm) 0 var(--spacing-xs)",
      }}
    >
      {text}
    </div>
  );

  const sessionRow = (
    name: string,
    subtitle: string,
    id: string,
    sessionGroups: AutoSave["groups"],
    onDelete?: () => void,
  ) => (
    <div
      key={id}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xs)",
        padding: "var(--spacing-sm) var(--spacing-md)",
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-sm)",
      }}
    >
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
          {name}
        </div>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-family)",
            marginTop: "2px",
          }}
        >
          {subtitle}
        </div>
      </div>
      <button
        onClick={() => restoreTabs(sessionGroups, id)}
        disabled={restoring === id}
        style={{
          padding: "4px var(--spacing-sm)",
          background: "var(--interactive-primary)",
          border: "none",
          borderRadius: "var(--radius-xs)",
          color: "var(--text-inverse)",
          fontSize: "var(--font-size-xs)",
          fontFamily: "var(--font-family)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {restoring === id ? "Opening..." : "Restore"}
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          style={{
            padding: "4px var(--spacing-sm)",
            background: "transparent",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xs)",
            color: "var(--text-muted)",
            fontSize: "var(--font-size-xs)",
            fontFamily: "var(--font-family)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );

  return (
    <div
      style={{
        width: "var(--panel-width)",
        height: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-sm)",
          padding: "0 var(--spacing-lg)",
          height: "52px",
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border-default)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: "var(--spacing-xs)",
            borderRadius: "var(--radius-xs)",
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
          <ArrowLeft size={20} />
        </button>
        <span
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-family)",
          }}
        >
          Settings
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--spacing-md) var(--spacing-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-xs)",
        }}
      >
        {/* Account section */}
        {sectionLabel("Account")}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              padding: "10px var(--spacing-md)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xs)",
              color: "var(--text-danger)",
              fontSize: "var(--font-size-sm)",
              fontFamily: "var(--font-family)",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            <SignOut size={16} />
            Sign out
          </button>
        ) : (
          <button
            onClick={onLogin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
              padding: "10px var(--spacing-md)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xs)",
              color: "var(--text-primary)",
              fontSize: "var(--font-size-sm)",
              fontFamily: "var(--font-family)",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            <SignIn size={16} />
            Sign in to sync sessions
          </button>
        )}

        {/* Sessions section — only when logged in */}
        {isLoggedIn && (
          <>
            {sectionLabel("Sessions")}

            {/* Save session */}
            {showSaveInput ? (
              <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
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
                  padding: "10px var(--spacing-md)",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-xs)",
                  color:
                    saveStatus === "saved"
                      ? "var(--context-social)"
                      : "var(--text-primary)",
                  fontSize: "var(--font-size-sm)",
                  fontFamily: "var(--font-family)",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                {saveStatus === "saved"
                  ? "✓ Session saved"
                  : "💾 Save current session"}
              </button>
            )}

            {/* Saved workspaces */}
            {sectionLabel("Saved Workspaces")}

            {loading && (
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-family)",
                }}
              >
                Loading...
              </div>
            )}

            {!loading && manualSessions.length === 0 && (
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-family)",
                }}
              >
                No saved workspaces yet
              </div>
            )}

            {manualSessions.map((s) =>
              sessionRow(
                s.name,
                `${totalTabs(s.groups)} tabs · ${formatDate(s.createdAt)}`,
                s.id,
                s.groups,
                () => handleDeleteManual(s.id),
              ),
            )}

            {/* Auto saves */}
            {sectionLabel("Auto Saves")}

            {!loading && autoSaves.length === 0 && (
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-family)",
                }}
              >
                No auto saves yet — saves every 30 mins
              </div>
            )}

            {autoSaves.map((s) =>
              sessionRow(
                s.name,
                `${totalTabs(s.groups)} tabs · ${formatDate(s.savedAt)}`,
                s.id,
                s.groups,
              ),
            )}
          </>
        )}

        {/* Pro features hint when logged out */}
        {!isLoggedIn && (
          <div
            style={{
              marginTop: "var(--spacing-md)",
              padding: "var(--spacing-md)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-xs)",
              color: "var(--text-muted)",
              fontFamily: "var(--font-family)",
              lineHeight: "1.6",
            }}
          >
            ✨ Sign in to unlock:
            <br />
            • Save and restore sessions
            <br />
            • Sync across devices
            <br />
            • AI tab suggestions
            <br />• Focus Mode
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
