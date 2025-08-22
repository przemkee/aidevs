export function getLocal(key, defaultValue) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function setLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
