import { useState } from "react";
import type { ReactNode } from "react";

interface CTAButtonProps {
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

// ─── Component ───────────────────────────────────────────────

const CTAButton = ({
  onClick,
  children,
  icon,
  disabled = false,
}: CTAButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--spacing-sm)",
        width: "100%",
        padding: "10px var(--spacing-lg)",
        background: disabled
          ? "var(--text-muted)"
          : isHovered
            ? "var(--interactive-primary-hover)"
            : "var(--interactive-primary)",
        border: "none",
        borderRadius: "var(--radius-full)",
        color: "var(--text-inverse)",
        fontSize: "var(--font-size-md)",
        fontWeight: "var(--font-weight-bold)",
        fontFamily: "var(--font-family)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s ease",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon && (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      )}
      {children}
    </button>
  );
};

export default CTAButton;
