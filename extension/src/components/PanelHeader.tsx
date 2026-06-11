// WHY THIS FILE EXISTS:
// PanelHeader renders the top bar of the Tabby side panel.
// Shows logo, wordmark, total tab count and settings gear.
// Settings gear shows contextual options based on auth state —
// Sign out when logged in, Sign in when logged out.

import { useState } from "react";
import { Gear, SignOut, SignIn } from "@phosphor-icons/react";
import CountBadge from "./CountBadge";
import { tokenApi } from "../shared/api";

interface PanelHeaderProps {
  totalTabs: number;
  onLogout: () => void;
  onLogin: () => void;
  isLoggedIn: boolean;
}

const LogoMark = () => (
  <div
    style={{
      width: "var(--logomark-size)",
      height: "var(--logomark-size)",
      borderRadius: "var(--radius-sm)",
      background:
        "linear-gradient(135deg, var(--context-work), var(--context-research))",
      flexShrink: 0,
    }}
  />
);

const PanelHeader = ({
  totalTabs,
  onLogout,
  onLogin,
  isLoggedIn,
}: PanelHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await tokenApi.clear();
    setShowMenu(false);
    onLogout();
  };

  const handleLogin = () => {
    setShowMenu(false);
    onLogin();
  };

  const menuButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
    width: "100%",
    padding: "10px var(--spacing-md)",
    background: "transparent",
    border: "none",
    fontSize: "var(--font-size-sm)",
    fontFamily: "var(--font-family)",
    cursor: "pointer",
    textAlign: "left" as const,
  };

  return (
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
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-sm)",
          flex: 1,
        }}
      >
        <LogoMark />
        <span
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-family)",
            letterSpacing: "-0.02em",
          }}
        >
          Tabby
        </span>
      </div>

      <CountBadge count={totalTabs} />

      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "var(--spacing-xs)",
          borderRadius: "var(--radius-xs)",
          color: showMenu ? "var(--text-secondary)" : "var(--text-muted)",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--text-secondary)";
        }}
        onMouseLeave={(e) => {
          if (!showMenu) {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--text-muted)";
          }
        }}
      >
        <Gear size={20} weight="regular" />
      </button>

      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: "var(--spacing-lg)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            zIndex: 100,
            minWidth: "160px",
          }}
        >
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{ ...menuButtonStyle, color: "var(--text-danger)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              <SignOut size={14} />
              Sign out
            </button>
          ) : (
            <>
              <button
                onClick={handleLogin}
                style={{ ...menuButtonStyle, color: "var(--text-primary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
              >
                <SignIn size={14} />
                Sign in to sync
              </button>
              <div
                style={{
                  padding: "6px var(--spacing-md)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-family)",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                ✨ Save sessions, sync across devices and get AI suggestions
                with Pro
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PanelHeader;
