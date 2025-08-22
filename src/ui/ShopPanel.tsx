import { FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import { load, save } from '../../icy-tower/store.js';

const characters = ['character.png', 'character2.png', 'character3.png', 'character4.png'];

const ShopPanel: FunctionalComponent = () => {
  const [ringCount, setRingCount] = useState(load('ringCount', 0));
  const [extraSkillSlots, setExtraSkillSlots] = useState(load('extraSkillSlots', 0));
  const [purchasedCharacters, setPurchasedCharacters] = useState<string[]>(
    load('purchasedCharacters', ['character.png'])
  );
  const [selectedCharacter, setSelectedCharacter] = useState(load('selectedCharacter', 'character.png'));

  const spend = (amount: number) => {
    const newCount = ringCount - amount;
    setRingCount(newCount);
    save('ringCount', newCount);
  };

  const buySlot = () => {
    if (extraSkillSlots > 0 || ringCount < 50) return;
    spend(50);
    setExtraSkillSlots(extraSkillSlots + 1);
    save('extraSkillSlots', extraSkillSlots + 1);
  };

  const buyOrSelectCharacter = (c: string) => {
    if (purchasedCharacters.includes(c)) {
      setSelectedCharacter(c);
      save('selectedCharacter', c);
    } else if (ringCount >= 50) {
      spend(50);
      const newChars = [...purchasedCharacters, c];
      setPurchasedCharacters(newChars);
      save('purchasedCharacters', newChars);
      setSelectedCharacter(c);
      save('selectedCharacter', c);
    }
  };

  return (
    <div class="shop-panel">
      <div class="ring-display">Rings: {ringCount}</div>
      <div class="shop-item">
        <button disabled={extraSkillSlots > 0 || ringCount < 50} onClick={buySlot}>
          Buy extra slot (50 rings)
        </button>
        {extraSkillSlots > 0 && <span class="owned">Purchased</span>}
      </div>
      <div class="character-row">
        {characters.map(c => {
          const owned = purchasedCharacters.includes(c);
          const selected = selectedCharacter === c;
          return (
            <div
              key={c}
              class={`character-item${owned ? ' owned' : ''}${selected ? ' selected' : ''}`}
              onClick={() => buyOrSelectCharacter(c)}
            >
              <img src={`assets/${c}`} alt={c} />
              {!owned && <div class="price">50</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopPanel;
