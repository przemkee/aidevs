import { FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import {
  getWallBounceEnabled,
  setWallBounceEnabled,
  getSpeedMultiplier,
  setSpeedMultiplier,
  getMusicEnabled,
  setMusicEnabled
} from '../../icy-tower/game.js';

const SettingsPanel: FunctionalComponent = () => {
  const [wallBounce, setWallBounce] = useState(getWallBounceEnabled());
  const [speed, setSpeed] = useState(getSpeedMultiplier());
  const [music, setMusic] = useState(getMusicEnabled());

  const decreaseSpeed = () => {
    const v = Math.max(0.5, speed - 0.5);
    setSpeed(v);
    setSpeedMultiplier(v);
  };

  const increaseSpeed = () => {
    const v = Math.min(3, speed + 0.5);
    setSpeed(v);
    setSpeedMultiplier(v);
  };

  return (
    <div class="settings-panel">
      <label>
        <input
          type="checkbox"
          checked={wallBounce}
          onChange={e => {
            const v = (e.target as HTMLInputElement).checked;
            setWallBounce(v);
            setWallBounceEnabled(v);
          }}
        />
        Wall bounce
      </label>
      <div class="speed-control">
        <button onClick={decreaseSpeed}>-</button>
        <span>{speed.toFixed(1)}x</span>
        <button onClick={increaseSpeed}>+</button>
      </div>
      <label>
        <input
          type="checkbox"
          checked={music}
          onChange={e => {
            const v = (e.target as HTMLInputElement).checked;
            setMusic(v);
            setMusicEnabled(v);
          }}
        />
        Music
      </label>
    </div>
  );
};

export default SettingsPanel;
