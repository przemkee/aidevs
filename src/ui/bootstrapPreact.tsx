import { render, h } from 'preact';
import MenuRoot from './MenuRoot';
import './menu.css';

export function mount() {
  const el = document.getElementById('ui-root')!;
  render(<MenuRoot />, el);
}
