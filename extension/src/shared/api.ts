// WHY THIS FILE EXISTS:
// Single API client for all communication between the extension
// and the Tabby backend server. Every HTTP request to the server
// goes through this file — never fetch directly from components.
// This keeps the server URL and auth token handling in one place.

const BASE_URL = "http://localhost:3000";

// WHY: Gets the stored JWT token from chrome.storage.
// Returns null if the user is not logged in.
const getToken = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get(["token"]);
  return (result["token"] as string) ?? null;
};

// WHY: Builds headers for every request.
// Automatically adds the Authorization header when a token exists.
const buildHeaders = async (requiresAuth: boolean): Promise<HeadersInit> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// ─── Auth API ────────────────────────────────────────────────

export const authApi = {
  register: async (email: string, password: string, displayName: string) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: await buildHeaders(false),
      body: JSON.stringify({ email, password, displayName }),
    });
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: await buildHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
};

// ─── Sessions API ─────────────────────────────────────────────

export const sessionsApi = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/sessions`, {
      method: "GET",
      headers: await buildHeaders(true),
    });
    return response.json();
  },

  save: async (name: string, groups: unknown) => {
    const response = await fetch(`${BASE_URL}/sessions`, {
      method: "POST",
      headers: await buildHeaders(true),
      body: JSON.stringify({ name, groups }),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${BASE_URL}/sessions/${id}`, {
      method: "DELETE",
      headers: await buildHeaders(true),
    });
    return response.json();
  },
};

// ─── Token management ─────────────────────────────────────────

export const tokenApi = {
  save: async (token: string) => {
    await chrome.storage.local.set({ token });
  },

  clear: async () => {
    await chrome.storage.local.remove(["token"]);
  },

  exists: async (): Promise<boolean> => {
    const token = await getToken();
    return token !== null;
  },
};
