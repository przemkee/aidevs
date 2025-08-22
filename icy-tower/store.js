export function load(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
}

export function isNewUiEnabled() {
  const q = new URLSearchParams(location.search).get('ui');
  if (q === 'new') return true;
  if (q === 'old') return false;
  return load('newUi', false);
}

export function setNewUiEnabled(v) {
  save('newUi', !!v);
}
