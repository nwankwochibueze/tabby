import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

// ─── Props ───────────────────────────────────────────────────
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

// ─── Component ───────────────────────────────────────────────

const SearchBar = ({
  onSearch,
  placeholder = "Search tabs or commands",
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-sm)",
        padding: "0 var(--spacing-md)",
        background: "var(--bg-surface)",
        border: `1px solid ${isFocused ? "var(--border-focus)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)",
        height: "36px",
        transition: "border-color 0.15s ease",
      }}
    >
      {/* Search icon */}
      <MagnifyingGlass
        size={16}
        color={isFocused ? "var(--text-secondary)" : "var(--text-muted)"}
        weight="regular"
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--text-primary)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-regular)",
          fontFamily: "var(--font-family)",
        }}
      />

      {/* Keyboard shortcut hint */}

      {!isFocused && !value && (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-muted)",
            background: "var(--bg-surface-raised)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xs)",
            padding: "2px 5px",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-family)",
          }}
        >
          ⌘K
        </span>
      )}
    </div>
  );
};

export default SearchBar;
