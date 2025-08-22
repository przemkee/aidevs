import './game.js';
import { isNewUiEnabled } from './store.js';

if (isNewUiEnabled()) {
  const root = document.getElementById('ui-root');
  root.style.display = 'block';
  const mainMenu = document.getElementById('mainMenu');
  if (mainMenu) {
    mainMenu.style.display = 'none';
  }
  import('../src/ui/bootstrapPreact').then(m => m.mount());
}
