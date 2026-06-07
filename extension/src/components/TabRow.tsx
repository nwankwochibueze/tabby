import type { Tab } from "@tabby/types";

interface TabRowProps {
  tab: Tab;
  onClick?: (tab: Tab) => void;
}

// ─── Component ───────────────────────────────────────────────

const TabRow = ({ tab, onClick }: TabRowProps) => {
  return (
    <div
      onClick={() => onClick?.(tab)}
      title={tab.title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-sm)",
        padding: "7px var(--spacing-md)",
        background: tab.active ? "var(--bg-hover)" : "transparent",
        cursor: "pointer",
        borderBottom: "1px solid var(--border-subtle)",
        transition: "background 0.1s ease",
      }}
      onMouseEnter={(e) => {
        if (!tab.active) {
          (e.currentTarget as HTMLDivElement).style.background =
            "var(--bg-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!tab.active) {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }
      }}
    >
      {/* Favicon */}

      {tab.favIconUrl ? (
        <img
          src={tab.favIconUrl}
          alt=""
          style={{
            width: "var(--icon-sm)",
            height: "var(--icon-sm)",
            borderRadius: "var(--radius-xs)",
            flexShrink: 0,
            objectFit: "contain",
          }}
          onError={(e) => {
            // WHY: If favicon fails to load hide it gracefully
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span
          style={{
            width: "var(--icon-sm)",
            height: "var(--icon-sm)",
            borderRadius: "var(--radius-xs)",
            background: "var(--bg-surface-raised)",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
      )}

      {/* Tab title */}

      <span
        style={{
          flex: 1,
          fontSize: "var(--font-size-sm)",
          fontWeight: tab.active
            ? "var(--font-weight-semibold)"
            : "var(--font-weight-regular)",
          color: tab.active ? "var(--text-primary)" : "var(--text-secondary)",
          fontFamily: "var(--font-family)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {tab.title}
      </span>

      {/* Active indicator */}
      {tab.active && (
        <span
          style={{
            width: "var(--dot-active)",
            height: "var(--dot-active)",
            borderRadius: "var(--radius-full)",
            background: "var(--border-active)",
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
};

export default TabRow;
