import { getToken, logout } from "./auth.service.js";

export async function fetchAuth(url, options = {}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    logout();
    throw new Error("Session expired");
  }

  return res;
}
