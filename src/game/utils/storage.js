const SAVE_KEY = "emotion-card-save";

export function loadLocal() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchSave() {
  try {
    const response = await fetch("/api/save");
    if (!response.ok) return loadLocal();
    return await response.json();
  } catch {
    return loadLocal();
  }
}

export async function persist(state) {
  const clean = JSON.stringify(state);
  localStorage.setItem(SAVE_KEY, clean);

  try {
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: clean,
    });
  } catch {
    // localStorage keeps the game usable when the file server is unavailable.
  }
}

export async function clearPersisted() {
  localStorage.removeItem(SAVE_KEY);

  try {
    await fetch("/api/save", { method: "DELETE" });
  } catch {
    // If the file server is unavailable, localStorage removal is still enough.
  }
}
