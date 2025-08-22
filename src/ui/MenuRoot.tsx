import { FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import { startArcade, startBooster } from '../../icy-tower/game.js';
import SettingsPanel from './SettingsPanel';
import ManualPanel from './ManualPanel';
import ShopPanel from './ShopPanel';

const MenuRoot: FunctionalComponent = () => {
  const [panel, setPanel] = useState<'main' | 'settings' | 'manual' | 'shop'>('main');

  return (
    <div class="menu-root">
      {panel === 'main' && (
        <div class="central">
          <button onClick={startBooster}>Booster Mode</button>
          <button onClick={startArcade}>Arcade Mode</button>
          <button onClick={() => setPanel('shop')}>Shop</button>
        </div>
      )}
      {panel === 'settings' && <SettingsPanel />}
      {panel === 'manual' && <ManualPanel />}
      {panel === 'shop' && <ShopPanel />}
      <div class="corners">
        {panel !== 'main' && (
          <button class="back" onClick={() => setPanel('main')}>
            Back to Main
          </button>
        )}
        <button class="settings" onClick={() => setPanel('settings')}>
          Settings
        </button>
        <button class="manual" onClick={() => setPanel('manual')}>
          Manual
        </button>
      </div>
    </div>
  );
};

export default MenuRoot;
