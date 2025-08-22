import { FunctionalComponent, h } from 'preact';

const handleClick = (label: string) => () => console.log(label);

const MenuRoot: FunctionalComponent = () => (
  <div class="menu-root">
    <div class="central">
      <button onClick={handleClick('button-1')}>Button 1</button>
      <button onClick={handleClick('button-2')}>Button 2</button>
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
