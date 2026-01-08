// =========================
// Auth Service
// =========================
//
// Responsabilités :
// - gérer le token JWT
// - exposer l’état d’authentification
// - fournir login / logout
// - notifier l’application des changements d’état
//
// AUCUNE dépendance UI
// AUCUNE dépendance GoldenLayout
//

const TOKEN_KEY = "auth_token";

// =========================
// Init
// =========================

export function initAuth() {
  // Point d’extension futur :
  // - vérification token expiré
  // - refresh token
  // - récupération user profile
  //
  // Pour l’instant : rien à faire
}

// =========================
// Token helpers
// =========================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// =========================
// Auth state
// =========================

export function isAuthenticated() {
  return !!getToken();
}

// =========================
// Login / Logout
// =========================

/**
 * Login via API backend
 * @param {Object} credentials { email, password }
 */
export async function login(credentials) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();

  if (!data.token) {
    throw new Error("No token returned by backend");
  }

  setToken(data.token);

  notifyAuthChanged();
}

/**
 * Logout utilisateur
 */
export function logout() {
  clearToken();
  notifyAuthChanged();
}

// =========================
// Events
// =========================

function notifyAuthChanged() {
  document.dispatchEvent(new CustomEvent("auth-changed"));
}
