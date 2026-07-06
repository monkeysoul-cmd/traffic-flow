/**
 * TrafficFlow API Client
 * Centralized API communication layer for the frontend.
 * Attaches JWT from localStorage to all authenticated requests.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Core Fetch Helper ─────────────────────────────────────────────────────────

async function fetchApi(endpoint, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // If token is expired/invalid, clear it
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tf_token");
          localStorage.removeItem("tf_user");
        }
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // Network errors or backend not running — return null instead of crashing
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.warn(`[API] Backend unavailable at ${API_BASE}${endpoint}`);
      return null;
    }
    throw error;
  }
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export async function apiLogin(email, password) {
  const data = await fetchApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data?.success) {
    localStorage.setItem("tf_token", data.token);
    localStorage.setItem("tf_user", JSON.stringify(data.user));
  }

  return data;
}

export async function apiSignup({ fullName, email, password, governmentId, department, location }) {
  const data = await fetchApi("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password, governmentId, department, location }),
  });

  if (data?.success) {
    localStorage.setItem("tf_token", data.token);
    localStorage.setItem("tf_user", JSON.stringify(data.user));
  }

  return data;
}

export async function apiGetMe() {
  return fetchApi("/api/auth/me");
}

// ── Traffic API ───────────────────────────────────────────────────────────────

export async function apiGetTrafficScans() {
  return fetchApi("/api/traffic/scans");
}

export async function apiSaveTrafficScan({ location, vehicleCount, trafficLevel, potentialIncidents, model }) {
  return fetchApi("/api/traffic/scans", {
    method: "POST",
    body: JSON.stringify({ location, vehicleCount, trafficLevel, potentialIncidents, model }),
  });
}

export async function apiGetTrafficStats() {
  return fetchApi("/api/traffic/stats");
}

// ── Dispatch API ──────────────────────────────────────────────────────────────

export async function apiGetDispatchLogs() {
  return fetchApi("/api/dispatch/logs");
}

export async function apiSaveDispatchLog({ unit, incidentId, location, user }) {
  return fetchApi("/api/dispatch/logs", {
    method: "POST",
    body: JSON.stringify({ unit, incidentId, location, user }),
  });
}

export async function apiGetLightControlLogs() {
  return fetchApi("/api/dispatch/light-control");
}

export async function apiSaveLightControlLog({ location, action, user }) {
  return fetchApi("/api/dispatch/light-control", {
    method: "POST",
    body: JSON.stringify({ location, action, user }),
  });
}

// ── Incidents API ─────────────────────────────────────────────────────────────

export async function apiGetIncidents() {
  return fetchApi("/api/incidents");
}

export async function apiSaveIncident({ id, location, type, priority, time }) {
  return fetchApi("/api/incidents", {
    method: "POST",
    body: JSON.stringify({ id, location, type, priority, time }),
  });
}

// ── Token Helpers ─────────────────────────────────────────────────────────────

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tf_token");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem("tf_user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tf_token");
  localStorage.removeItem("tf_user");
}

export function isAuthenticated() {
  return !!getStoredToken();
}
