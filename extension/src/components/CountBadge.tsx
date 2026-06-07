interface CountBadgeProps {
  count: number;
}

// ─── Component ───────────────────────────────────────────────

const CountBadge = ({ count }: CountBadgeProps) => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-surface-raised)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-secondary)",
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-medium)",
        fontFamily: "var(--font-family)",
        padding: "2px 8px",
        minWidth: "24px",
        whiteSpace: "nowrap",
      }}
    >
      {count}
    </span>
  );
};

export default CountBadge;
