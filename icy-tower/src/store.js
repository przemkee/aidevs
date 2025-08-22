// Simple wrapper around localStorage for JSON data
export function load(key, defaultValue) {
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
