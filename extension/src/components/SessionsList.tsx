// WHY THIS FILE EXISTS:
// Shows a list of saved sessions the user can restore.
// Each session reopens all its tabs in Chrome when clicked.
// Only visible when the user is logged in.

import { useState, useEffect } from "react";
import { sessionsApi } from "../shared/api";

interface SavedSession {
  id: string;
  name: string;
  createdAt: string;
  groups: Array<{
    label: string;
    tabs: Array<{ url: string; title: string }>;
  }>;
}

interface SessionsListProps {
  onClose: () => void;
}

const SessionsList = ({ onClose }: SessionsListProps) => {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    sessionsApi.getAll().then((result) => {
      setSessions(result.sessions ?? []);
      setLoading(false);
    });
  }, []);

  const handleRestore = async (session: SavedSession) => {
    setRestoring(session.id);

    // WHY: Opens every tab from every group in the saved session.
    // chrome.tabs.create opens each URL as a new tab in Chrome.
    for (const group of session.groups) {
      for (const tab of group.tabs) {
        if (tab.url && !tab.url.startsWith("chrome://")) {
          chrome.tabs.create({ url: tab.url, active: false });
        }
      }
    }

    setRestoring(null);
    onClose();
  };

  const handleDelete = async (id: string) => {
    await sessionsApi.delete(id);
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalTabs = (session: SavedSession) =>
    session.groups.reduce((sum, g) => sum + g.tabs.length, 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-xs)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--spacing-xs) 0",
        }}
      >
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontFamily: "var(--font-family)",
          }}
        >
          Saved Sessions
        </span>
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

      {/* Loading state */}
      {loading && (
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
      )}

      {/* Empty state */}
      {!loading && sessions.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--spacing-lg)",
            color: "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-family)",
          }}
        >
          No saved sessions yet
        </div>
      )}

      {/* Sessions list */}
      {sessions.map((session) => (
        <div
          key={session.id}
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
          {/* Session info */}
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
              {totalTabs(session)} tabs · {formatDate(session.createdAt)}
            </div>
          </div>

          {/* Restore button */}
          <button
            onClick={() => handleRestore(session)}
            disabled={restoring === session.id}
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
            {restoring === session.id ? "Opening..." : "Restore"}
          </button>

          {/* Delete button */}
          <button
            onClick={() => handleDelete(session.id)}
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
        </div>
      ))}
    </div>
  );
};

export default SessionsList;
