import './game.js';
import { isNewUiEnabled, setNewUiEnabled } from './store.js';

if (isNewUiEnabled()) {
  const root = document.getElementById('ui-root');
  root.style.display = 'block';
  const mainMenu = document.getElementById('mainMenu');
  if (mainMenu) {
    mainMenu.style.display = 'none';
  }
  import('../src/ui/bootstrapPreact')
    .then(m => m.mount())
    .catch(err => {
      console.error(err);
      if (mainMenu) mainMenu.style.display = 'block';
      if (root) {
        root.style.display = 'none';
        root.innerHTML = '';
      }
      const useNewUi = document.getElementById('useNewUi');
      if (useNewUi) useNewUi.checked = false;
      setNewUiEnabled(false);
    });
}
