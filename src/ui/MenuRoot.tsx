import { FunctionalComponent, h } from 'preact';
import { startArcade, startBooster } from '../../icy-tower/game.js';

const handleClick = (label: string) => () => console.log(label);

const MenuRoot: FunctionalComponent = () => (
  <div class="menu-root">
    <div class="central">
      <button onClick={startArcade}>Arcade Mode</button>
      <button onClick={startBooster}>Booster Mode</button>
      <button onClick={handleClick('button-3')}>Button 3</button>
    </div>
    <div class="corners">
      <button class="back" onClick={handleClick('Back')}>Back</button>
      <button class="settings" onClick={handleClick('Settings')}>Settings</button>
      <button class="manual" onClick={handleClick('Manual')}>Manual</button>
    </div>
  </div>
);

export default MenuRoot;
