const BASE_URL = "/api/strategies";

// READ
export async function getStrategies() {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch strategies");
  }
  return res.json();
}

// CREATE
export async function createStrategy(name) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  if (!res.ok) {
    throw new Error("Failed to create strategy");
  }
  return res.json();
}

// DELETE
export async function deleteStrategy(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    throw new Error("Failed to delete strategy");
  }
}
