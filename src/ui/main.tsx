import { render } from 'preact';
import MenuRoot from './MenuRoot';
import './menu.css';

const container = document.getElementById('ui-root');
if (container) {
  container.style.display = 'block';
  render(<MenuRoot />, container);
}
