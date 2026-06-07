import { Gear } from "@phosphor-icons/react";
import CountBadge from "./CountBadge";

interface PanelHeaderProps {
  totalTabs: number;
  onSettingsClick?: () => void;
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

// ─── Component ───────────────────────────────────────────────

const PanelHeader = ({ totalTabs, onSettingsClick }: PanelHeaderProps) => {
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
      }}
    >
      {/* Logo mark + wordmark */}
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

      {/* Total tab count */}

      <CountBadge count={totalTabs} />

      {/* Settings icon */}
      <button
        onClick={onSettingsClick}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "var(--spacing-xs)",
          borderRadius: "var(--radius-xs)",
          color: "var(--text-muted)",
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
        <Gear size={20} weight="regular" />
      </button>
    </div>
  );
};

export default PanelHeader;
