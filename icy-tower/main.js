import './game.js';
import { isNewUiEnabled } from './store.js';

if (isNewUiEnabled()) {
  const root = document.getElementById('ui-root');
  root.style.display = 'block';
  document.getElementById('mainMenu')?.style.display = 'none';
  import('../src/ui/bootstrapPreact').then(m => m.mount());
}
