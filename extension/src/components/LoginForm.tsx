// WHY THIS FILE EXISTS:
// Shows a login and register form inside the dashboard.
// Only visible when the user has no JWT token stored.
// On successful login the token is saved to chrome.storage
// and the parent component switches to the main dashboard view.

import { useState } from "react";
import { authApi, tokenApi } from "../shared/api";

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const result = await authApi.register(email, password, displayName);
        if (result.error) {
          setError(result.error);
          return;
        }
        // WHY: After register automatically log in
        const loginResult = await authApi.login(email, password);
        if (loginResult.error) {
          setError(loginResult.error);
          return;
        }
        await tokenApi.save(loginResult.token);
        onSuccess();
      } else {
        const result = await authApi.login(email, password);
        if (result.error) {
          setError(result.error);
          return;
        }
        await tokenApi.save(result.token);
        onSuccess();
      }
    } catch {
      setError("Something went wrong. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px var(--spacing-md)",
    background: "var(--bg-surface-raised)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: "var(--font-size-sm)",
    fontFamily: "var(--font-family)",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-md)",
        padding: "var(--spacing-xl)",
      }}
    >
      {/* Logo and title */}
      <div style={{ textAlign: "center", marginBottom: "var(--spacing-sm)" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-md)",
            background:
              "linear-gradient(135deg, var(--context-work), var(--context-research))",
            margin: "0 auto var(--spacing-sm)",
          }}
        />
        <div
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-family)",
          }}
        >
          Tabby
        </div>
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-family)",
            marginTop: "4px",
          }}
        >
          {mode === "login"
            ? "Sign in to sync your sessions"
            : "Create an account"}
        </div>
      </div>

      {/* Form fields */}
      {mode === "register" && (
        <input
          type="text"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={inputStyle}
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      {/* Error message */}
      {error && (
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-danger)",
            fontFamily: "var(--font-family)",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "10px",
          background: loading
            ? "var(--text-muted)"
            : "var(--interactive-primary)",
          border: "none",
          borderRadius: "var(--radius-full)",
          color: "var(--text-inverse)",
          fontSize: "var(--font-size-md)",
          fontWeight: "var(--font-weight-bold)",
          fontFamily: "var(--font-family)",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.15s ease",
        }}
      >
        {loading
          ? "Please wait..."
          : mode === "login"
            ? "Sign In"
            : "Create Account"}
      </button>

      {/* Toggle mode */}
      <div
        style={{
          textAlign: "center",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-family)",
        }}
      >
        {mode === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <span
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          style={{
            color: "var(--text-link)",
            cursor: "pointer",
          }}
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </span>
      </div>

      {/* Skip option */}
      <div
        style={{
          textAlign: "center",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-family)",
          cursor: "pointer",
        }}
        onClick={onSuccess}
      >
        Skip for now — use without account
      </div>
    </div>
  );
};

export default LoginForm;
