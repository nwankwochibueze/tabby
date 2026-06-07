// This component renders a single group card in the dashboard.
// It displays the group label, context icon, tab count, and an expand/collapse chevron. When expanded, it shows a list of tabs in the group.

import { useState } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import type { TabGroup, Tab } from "@tabby/types";
import ContextIcon from "./ContextIcon";
import TabRow from "./TabRow";

interface GroupCardProps {
  group: TabGroup;
  onTabClick?: (tab: Tab) => void;
  defaultExpanded?: boolean;
}

// ─── Component ───────────────────────────────────────────────

const GroupCard = ({
  group,
  onTabClick,
  defaultExpanded = false,
}: GroupCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleTabClick = (tab: Tab) => {
    // WHY: Switch to the clicked tab in Chrome
    chrome.tabs.update(tab.id, { active: true });
    onTabClick?.(tab);
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${isExpanded ? "var(--border-active)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-xs)",
        overflow: "hidden",
        transition: "border-color 0.15s ease",
      }}
    >
      {/* ── Group Header ── */}

      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-sm)",
          padding: "0 var(--spacing-md)",
          height: "44px",
          cursor: "pointer",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background =
            "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      >
        {/* Context icon */}
        <ContextIcon context={group.context} size={16} />

        {/* Group label */}
        <span
          style={{
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-family)",
            flex: 1,
          }}
        >
          {group.label}
        </span>

        {/* Tab count plain text */}

        <span
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-family)",
          }}
        >
          {group.tabs.length} Tabs
        </span>

        {/* Chevron */}

        <span
          style={{
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isExpanded ? (
            <CaretDown size={14} weight="regular" />
          ) : (
            <CaretRight size={14} weight="regular" />
          )}
        </span>
      </div>

      {/* ── Tab List ── */}

      {isExpanded && (
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {group.tabs.map((tab) => (
            <TabRow key={tab.id} tab={tab} onClick={handleTabClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupCard;
