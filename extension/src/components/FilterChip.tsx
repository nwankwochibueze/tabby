import { useState } from "react";

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

// ─── Component ───────────────────────────────────────────────

const FilterChip = ({ label, isActive = false, onClick }: FilterChipProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px var(--spacing-md)",
        background: isActive
          ? "var(--bg-surface-raised)"
          : isHovered
            ? "var(--bg-hover)"
            : "var(--bg-surface)",
        border: isActive
          ? "1px solid var(--border-active)"
          : "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        fontSize: "var(--font-size-sm)",
        fontWeight: isActive
          ? "var(--font-weight-bold)"
          : "var(--font-weight-medium)",
        fontFamily: "var(--font-family)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
};

export default FilterChip;
