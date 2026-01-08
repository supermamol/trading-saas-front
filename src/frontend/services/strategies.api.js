import { getToken } from "./auth.service";

const BASE_URL = "/api/strategies";

/**
 * Helper commun pour injecter le JWT
 */
async function apiFetch(url, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error("API error");
  }

  // DELETE peut ne rien renvoyer
  if (res.status === 204) {
    return;
  }

  return res.json();
}

/* =======================
 * READ
 * ======================= */
export async function getStrategies() {
  return apiFetch(BASE_URL);
}

/* =======================
 * CREATE
 * ======================= */
export async function createStrategy(name) {
  return apiFetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
}

/* =======================
 * DELETE
 * ======================= */
export async function deleteStrategy(id) {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
