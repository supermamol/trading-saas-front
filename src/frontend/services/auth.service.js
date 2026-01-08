// =========================
// Auth Service
// =========================

const TOKEN_KEY = "auth_token";

// =========================
// Init
// =========================

export function initAuth() {
  // À terme : refresh token, user profile, etc.
  // Pour l’instant : rien
}

// =========================
// Token helpers
// =========================

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      logout(); // 🔥 clé du fix
      return null;
    }

    return token;
  } catch (e) {
    // token corrompu
    logout();
    return null;
  }
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
  return !!getToken(); // ⚠️ passe maintenant par la vérif exp
}

// =========================
// Login / Logout
// =========================

export async function login(credentials) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
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
