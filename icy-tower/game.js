import { startMusic, stopMusic } from './audio.js';
import { load, save } from './store.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// WALL-BOUNCE: global configuration
const config = {
  wallBounceEnabledDefault: true,
  wallSlideMaxDownSpeed: 120
};

const game = { // WALL-BOUNCE
  settings: {
    wallBounceEnabled: load('wallBounceEnabled', config.wallBounceEnabledDefault),
    speedMultiplier: 1,
    musicEnabled: load('musicEnabled', true),
    continuousPlay: true
  }
};

const menu = document.getElementById('mainMenu'); // WALL-BOUNCE start menu renamed
const arcadeBtn = document.getElementById('arcadeBtn');
const boosterBtn = document.getElementById('boosterBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const backBtn = document.getElementById('backBtn');
const difficultySelect = document.getElementById('difficulty');
const gameContainer = document.getElementById('gameContainer');
const scoreDisplay = document.getElementById('currentScore');
const comboDisplay = document.getElementById('comboDisplay');
const scoreTable = document.getElementById('scoreTable');
const gameOverDiv = document.getElementById('gameOver');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const newGameBtn = document.getElementById('newGameBtn');
const boosterFrames = document.getElementById('boosterFrames');
const wheelOverlay = document.getElementById('wheelOverlay');
const spinBtn = document.getElementById('spinBtn');
const wheelCanvas = document.getElementById('spinWheel');
const wheelCtx = wheelCanvas.getContext('2d');
const shopBtn = document.getElementById('shopBtn');
const shopMenu = document.getElementById('shopMenu');
const shopBackBtn = document.getElementById('shopBackBtn');
const buySlotItem = document.getElementById('buySlotItem');
const ringDisplay = document.getElementById('ringDisplay');
const shopRingDisplay = document.getElementById('shopRingDisplay');
const shopMessage = document.getElementById('shopMessage');
const refundBtn = document.getElementById('refundBtn');
const resetGameBtn = document.getElementById('resetGameBtn');
const characterItems = document.querySelectorAll('.character-item');
let purchasedCharacters = load('purchasedCharacters', ['character.png']);
let selectedCharacter = load('selectedCharacter', 'character.png');
characterItems.forEach(item => {
  if (purchasedCharacters.includes(item.dataset.character)) {
    item.classList.add('owned');
  }
});
let ringCount = load('ringCount', 0);
let wheelSpun = false;
let spinning = false;
let boosterSlots = Array.from(document.querySelectorAll('.booster-frame'));
let skills = Array(boosterSlots.length).fill('');
let extraSkillSlots = load('extraSkillSlots', 0);

function createBoosterSlot() {
  const slot = document.createElement('div');
  slot.classList.add('booster-frame');
  boosterFrames.appendChild(slot);
  boosterSlots.push(slot);
  skills.push('');
}

function removeExtraSlots() {
  while (boosterSlots.length > 3) {
    const slot = boosterSlots.pop();
    boosterFrames.removeChild(slot);
    skills.pop();
  }
}

for (let i = 0; i < extraSkillSlots; i++) {
  createBoosterSlot();
}

updateShopItem();

let nextSkillIndex = 0;
let redCount = 0, yellowCount = 0, greenCount = 0, blueCount = 0;
const wheelColors = ['red', 'yellow', 'green', 'blue', 'red', 'yellow', 'green', 'blue'];
let chosenIndex = 0;
// WALL-BOUNCE: option controls
const toggleWallBounce = document.getElementById('toggleWallBounce');
const speedMinus = document.getElementById('speedMinus');
const speedPlus = document.getElementById('speedPlus');
const speedValue = document.getElementById('speedValue');
const toggleMusic = document.getElementById('toggleMusic');
toggleWallBounce.checked = game.settings.wallBounceEnabled;
toggleMusic.checked = game.settings.musicEnabled;
function updateSpeedLabel() { speedValue.textContent = game.settings.speedMultiplier.toFixed(1) + 'x'; }
updateSpeedLabel();
toggleWallBounce.addEventListener('change', () => {
  game.settings.wallBounceEnabled = toggleWallBounce.checked;
  save('wallBounceEnabled', game.settings.wallBounceEnabled);
});
speedMinus.addEventListener('click', () => {
  game.settings.speedMultiplier = Math.max(0.5, game.settings.speedMultiplier - 0.5);
  updateSpeedLabel();
});
speedPlus.addEventListener('click', () => {
  game.settings.speedMultiplier = Math.min(3, game.settings.speedMultiplier + 0.5);
  updateSpeedLabel();
});
toggleMusic.addEventListener('change', () => {
  game.settings.musicEnabled = toggleMusic.checked;
  save('musicEnabled', game.settings.musicEnabled);
  if (game.settings.musicEnabled) {
    startMusic();
  } else {
    stopMusic();
  }
});

function updateRingDisplay() {
  if (ringDisplay) ringDisplay.textContent = `Obręcze: ${ringCount}`;
  if (shopRingDisplay) shopRingDisplay.textContent = `Obręcze: ${ringCount}`;
}

function showShopMessage(msg) {
  if (!shopMessage) return;
  shopMessage.textContent = msg;
  shopMessage.style.display = 'block';
  setTimeout(() => {
    shopMessage.style.display = 'none';
  }, 5000);
}

function updateShopItem() {
  if (!buySlotItem) return;
  if (extraSkillSlots > 0) {
    buySlotItem.classList.add('purchased');
  } else {
    buySlotItem.classList.remove('purchased');
  }
}

function refundPurchases() {
  ringCount += extraSkillSlots * 50;
  ringCount += (purchasedCharacters.length - 1) * 50;
  extraSkillSlots = 0;
  purchasedCharacters = ['character.png'];
  selectedCharacter = 'character.png';
  save('ringCount', ringCount);
  save('extraSkillSlots', extraSkillSlots);
  save('purchasedCharacters', purchasedCharacters);
  save('selectedCharacter', selectedCharacter);
  removeExtraSlots();
  characterItems.forEach(item => {
    item.classList.remove('owned');
    if (item.dataset.character === 'character.png') {
      item.classList.add('owned');
    }
  });
  updateRingDisplay();
  updateShopItem();
  updateCharacterImage();
}

function resetGame() {
  ringCount = 0;
  extraSkillSlots = 0;
  purchasedCharacters = ['character.png'];
  selectedCharacter = 'character.png';
  save('ringCount', ringCount);
  save('extraSkillSlots', extraSkillSlots);
  save('purchasedCharacters', purchasedCharacters);
  save('selectedCharacter', selectedCharacter);
  removeExtraSlots();
  characterItems.forEach(item => {
    item.classList.remove('owned');
    if (item.dataset.character === 'character.png') {
      item.classList.add('owned');
    }
  });
  updateRingDisplay();
  updateShopItem();
  updateCharacterImage();
}

updateRingDisplay();

// wheel drawing for booster mode pause
function drawWheel() {
  const radius = wheelCanvas.width / 2;
  for (let i = 0; i < 8; i++) {
    wheelCtx.beginPath();
    wheelCtx.moveTo(radius, radius);
    const start = -Math.PI / 2 + i * Math.PI / 4;
    const end = start + Math.PI / 4;
    wheelCtx.arc(radius, radius, radius, start, end);
    wheelCtx.fillStyle = wheelColors[i];
    wheelCtx.fill();
    wheelCtx.strokeStyle = '#000';
    wheelCtx.stroke();
  }
}
drawWheel();

function showWheel() {
  wheelOverlay.style.display = 'flex';
  spinBtn.textContent = 'Spin!';
  wheelCanvas.style.transition = 'none';
  wheelCanvas.style.transform = 'rotate(0deg)';
  wheelSpun = false;
  spinning = false;
}

spinBtn.addEventListener('click', () => {
  if (!wheelSpun && !spinning) {
    spinning = true;
    const spins = 5 + Math.floor(Math.random() * 6);
    chosenIndex = Math.floor(Math.random() * 8);
    const rotation = spins * 360 - chosenIndex * 45 - 22.5;
    requestAnimationFrame(() => {
      wheelCanvas.style.transition = 'transform 4s ease-in-out';
      wheelCanvas.style.transform = `rotate(${rotation}deg)`;
    });
  } else if (wheelSpun && !spinning) {
    wheelOverlay.style.display = 'none';
    paused = false;
  }
});

wheelCanvas.addEventListener('transitionend', () => {
  if (spinning) {
    spinning = false;
    wheelSpun = true;
    spinBtn.textContent = 'Continue';
    const color = wheelColors[chosenIndex];
    addSkill(color);
  }
});

function addSkill(color) {
  boosterSlots[nextSkillIndex].style.backgroundColor = color;
  skills[nextSkillIndex] = color;
  nextSkillIndex = (nextSkillIndex + 1) % boosterSlots.length;
  updateSkillEffects();
}

function resetSkills() {
  skills = Array(boosterSlots.length).fill('');
  nextSkillIndex = 0;
  for (let slot of boosterSlots) {
    slot.style.backgroundColor = '';
    slot.style.borderColor = '#000';
  }
  updateSkillEffects();
}

function updateSkillEffects() {
  redCount = skills.filter(c => c === 'red').length;
  yellowCount = skills.filter(c => c === 'yellow').length;
  greenCount = skills.filter(c => c === 'green').length;
  blueCount = skills.filter(c => c === 'blue').length;
  platformWidth = basePlatformWidth * (1 + 0.25 * blueCount);
  if (platforms) {
    for (let plat of platforms) {
      if (plat.id !== 0 && plat !== widePlatform) {
        const center = plat.x + plat.width / 2;
        plat.width = platformWidth;
        plat.x = Math.min(Math.max(center - plat.width / 2, gameAreaX),
          gameAreaX + gameAreaWidth - plat.width);
      }
    }
  }
}

settingsBtn.addEventListener('click', () => {
  menu.style.display = 'none';
  settingsMenu.style.display = 'block';
});

backBtn.addEventListener('click', () => {
  settingsMenu.style.display = 'none';
  menu.style.display = 'block';
  updateRingDisplay();
});

shopBtn.addEventListener('click', () => {
  menu.style.display = 'none';
  shopMenu.style.display = 'block';
  updateRingDisplay();
});

shopBackBtn.addEventListener('click', () => {
  shopMenu.style.display = 'none';
  menu.style.display = 'block';
  updateRingDisplay();
});

if (refundBtn) {
  refundBtn.addEventListener('click', () => {
    refundPurchases();
  });
}

if (resetGameBtn) {
  resetGameBtn.addEventListener('click', () => {
    resetGame();
  });
}

if (buySlotItem) {
  buySlotItem.addEventListener('click', () => {
    if (extraSkillSlots > 0) {
      showShopMessage('Przedmiot już zakupiony');
      return;
    }
    if (ringCount >= 50) {
      ringCount -= 50;
      save('ringCount', ringCount);
      updateRingDisplay();
      createBoosterSlot();
      extraSkillSlots = 1;
      save('extraSkillSlots', extraSkillSlots);
      updateShopItem();
    } else {
      showShopMessage('Brak środków!');
      updateRingDisplay();
    }
  });
}

if (characterItems.length) {
  characterItems.forEach(item => {
    item.addEventListener('click', () => {
      const char = item.dataset.character;
      if (purchasedCharacters.includes(char)) {
        selectedCharacter = char;
        save('selectedCharacter', char);
        updateCharacterImage();
        return;
      }
      if (ringCount >= 50) {
        ringCount -= 50;
        purchasedCharacters.push(char);
        save('ringCount', ringCount);
        save('purchasedCharacters', purchasedCharacters);
        selectedCharacter = char;
        save('selectedCharacter', char);
        item.classList.add('owned');
        updateRingDisplay();
        updateCharacterImage();
      } else {
        showShopMessage('Brak środków!');
      }
    });
  });
}

let backgroundImg = new Image();
let prevBackgroundImg = null;
let backgroundImages = [];
let currentBackgroundIndex = 0;
let backgroundY = 0;
let transitionPlatform = null;
const transitionHeight = 150;

function loadBackgrounds() {
  const encoded = [
    'YmFja2dyb3VuZDEuanBn',
    'YmFja2dyb3VuZDIuanBn',
    'YmFja2dyb3VuZDMuanBn'
  ];
  backgroundImages = encoded.map(name => `assets/${atob(name)}`);
  backgroundImg.src = backgroundImages[0];
}
loadBackgrounds();

function nextBackground(plat) {
  if (backgroundImages.length > 1) {
    prevBackgroundImg = backgroundImg;
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
    backgroundImg = new Image();
    backgroundImg.src = backgroundImages[currentBackgroundIndex];
    transitionPlatform = plat;
  }
}
const stepImg = new Image();
stepImg.src = 'assets/step.jpg';
const characterImg = new Image();
characterImg.src = `assets/${selectedCharacter}`;

function updateCharacterImage() {
  characterImg.src = `assets/${selectedCharacter}`;
  characterItems.forEach(item => {
    if (item.dataset.character === selectedCharacter) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}
updateCharacterImage();

const difficulties = {
  easy: { platformWidth: 90, speed: 1.5 },
  medium: { platformWidth: 70, speed: 2.5 },
  hard: { platformWidth: 50, speed: 3.5 }
};

const platformHeight = 20;
const borderWidth = 2;
const ringRadius = 15;

function updateScoreboard() {
  const scores = load('scores', []);
  scoreTable.textContent = scores
    .map((s, i) => `${i + 1}. ${s.name}: ${s.score}`)
    .join('\n');
}

updateScoreboard();

function startGame() {
  resetSkills();
  menu.style.display = 'none';
  gameContainer.style.display = 'block';
  wheelOverlay.style.display = 'none';
  boosterFrames.style.display = game.settings.continuousPlay ? 'none' : 'flex';
  canvas.width = 600;
  canvas.height = window.innerHeight;
  const diff = difficulties[difficultySelect.value];
  initGame(diff);
  if (game.settings.musicEnabled) {
    startMusic();
  }
  requestAnimationFrame(loop);
}

arcadeBtn.addEventListener('click', () => {
  game.settings.continuousPlay = true;
  startGame();
});

boosterBtn.addEventListener('click', () => {
  game.settings.continuousPlay = false;
  startGame();
});

document.addEventListener('keydown', e => {
  if (wheelOverlay.style.display !== 'none' && e.code === 'Space') {
    spinBtn.click();
  } else if (gameOverDiv.style.display !== 'none' && e.code === 'Space') {
    newGameBtn.click();
  } else if (menu.style.display !== 'none' && e.code === 'Space') {
    arcadeBtn.click();
  } else if (paused && e.code === 'Space') {
    paused = false;
  }
});

const gravity = 0.5;
let basePlatformWidth = 90;
let platformWidth = 90;
let speed = 2;

let player, platforms, keys, gameOver, gameStarted, score;
let gameOverDisplayed = false;
let gameAreaWidth, gameAreaX;
let platformSpacing, nextPlatformId, comboMultiplier, comboHits;
let stars, rings;
let longJumpReady;
let boostTimer;
let autoJumpTimer = 0;
const autoJumpInterval = 30;
let paused = false;
let widePlatform = null;
function initGame(diff) {
  basePlatformWidth = diff.platformWidth;
  platformWidth = basePlatformWidth * (1 + 0.25 * blueCount);
  speed = diff.speed;
  gameAreaWidth = Math.min(600, canvas.width);
  gameAreaX = (canvas.width - gameAreaWidth) / 2;
  player = {
    x: gameAreaX + gameAreaWidth / 2 - 20,
    y: canvas.height - platformHeight - 90,
    width: 40,
    height: 90,
    vx: 0,
    vy: 0,
    onGround: true,
    lastPlatformId: 0,
    isCombo: false, // WALL-BOUNCE
    wallBounceCount: 0, // WALL-BOUNCE
    wallContactDir: 0, // WALL-BOUNCE
    rotation: 0, // WALL-BOUNCE flip rotation
    flipDir: 0, // WALL-BOUNCE flip direction
    flipping: false // WALL-BOUNCE flip state
  };
  // WALL-BOUNCE methods
  player.tryWallBounce = function() {
    if (this.wallContactDir === 0) return false;
    if (this.wallBounceCount > 0) return false;
    this.wallBounceCount = 1;
    this.vx = -this.wallContactDir * 4 * game.settings.speedMultiplier;
    this.vy = -20 * Math.pow(2, greenCount) * game.settings.speedMultiplier;
    this.flipping = true;
    this.rotation = 0;
    this.flipDir = -this.wallContactDir;
    return true;
  };
  platforms = [];
  const num = Math.ceil(canvas.height / 100);
  platformSpacing = (canvas.height - platformHeight) / (num - 1);
  platforms.push({
    x: gameAreaX,
    y: canvas.height - platformHeight,
    width: gameAreaWidth,
    height: platformHeight,
    id: 0
  });
  rings = [];
  for (let i = 1; i < num; i++) {
    const plat = {
      x: gameAreaX + Math.random() * (gameAreaWidth - platformWidth),
      y: canvas.height - platformHeight - i * platformSpacing,
      width: platformWidth,
      height: platformHeight,
      id: i
    };
    platforms.push(plat);
    if (i % 20 === 0) {
      rings.push({
        x: plat.x + plat.width / 2,
        y: plat.y - ringRadius,
        radius: ringRadius
      });
    }
  }
  nextPlatformId = num;
  comboMultiplier = 1;
  comboHits = 0;
  longJumpReady = false;
  stars = [];
  keys = {};
  gameOver = false;
  gameStarted = false;
  score = 0;
  boostTimer = 0;
  scoreDisplay.style.color = '#fff';
  gameOverDisplayed = false;
  autoJumpTimer = 0;
  paused = false;
}

document.addEventListener('keydown', e => {
  keys[e.code] = true;
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
});

function update(now) { // WALL-BOUNCE
  const left = keys['ArrowLeft'] || keys['KeyA']; // WALL-BOUNCE
  const right = keys['ArrowRight'] || keys['KeyD']; // WALL-BOUNCE
  player.isCombo = comboMultiplier > 1; // WALL-BOUNCE

  if (left) player.vx = -4 * game.settings.speedMultiplier;
  else if (right) player.vx = 4 * game.settings.speedMultiplier;
  else player.vx = 0;

  if (player.onGround && autoJumpTimer <= 0) {
    let heightBoost = 1;
    if (longJumpReady && comboMultiplier >= 4) {
      heightBoost = comboMultiplier / 2;
      longJumpReady = false;
    }
    heightBoost *= 1 + 0.25 * redCount;
    player.vy = -20 * heightBoost * game.settings.speedMultiplier;
    player.onGround = false;
    if (!gameStarted) gameStarted = true;
    autoJumpTimer = autoJumpInterval;
  } else {
    autoJumpTimer--;
  }

  player.vy += gravity * game.settings.speedMultiplier;

  if (player.wallContactDir !== 0) { // WALL-BOUNCE slide
    if ((player.wallContactDir === -1 && left) || (player.wallContactDir === 1 && right)) {
      const maxDown = (config.wallSlideMaxDownSpeed / 60) * game.settings.speedMultiplier;
      player.vy = Math.min(player.vy, maxDown);
    }
  }

  player.x += player.vx;
  player.y += player.vy;

  if (player.flipping) {
    player.rotation += player.flipDir * 0.3;
    if (Math.abs(player.rotation) >= Math.PI * 2) {
      player.flipping = false;
      player.rotation = 0;
    }
  }

  // boundaries and wall contact with automatic bounce // WALL-BOUNCE
  const prevWallContact = player.wallContactDir;
  player.wallContactDir = 0;
  if (player.x < gameAreaX) {
    player.x = gameAreaX;
    player.wallContactDir = -1;
  }
  if (player.x + player.width > gameAreaX + gameAreaWidth) {
    player.x = gameAreaX + gameAreaWidth - player.width;
    player.wallContactDir = 1;
  }
  if (game.settings.wallBounceEnabled && player.wallContactDir !== 0 && prevWallContact === 0) {
    if (player.tryWallBounce()) {
      autoJumpTimer = autoJumpInterval;
      player.wallContactDir = 0;
    }
  }

  player.onGround = false;
  for (let plat of platforms) {
    if (
      player.x < plat.x + plat.width &&
      player.x + player.width > plat.x &&
      player.y + player.height > plat.y &&
      player.y + player.height < plat.y + plat.height + player.vy &&
      player.vy >= 0
    ) {
      player.y = plat.y - player.height;
      player.vy = 0;
      player.onGround = true;
      player.wallBounceCount = 0;
      const jumped = plat.id - player.lastPlatformId;
      const skipped = jumped - 1; // number of platforms skipped in this jump
      if (skipped >= 4) {
        boostTimer = 60;
        if (comboMultiplier === 1) {
          // first long jump starts the combo at x2
          comboMultiplier = 2;
          comboHits = 0;
          longJumpReady = false;
        } else {
          // count consecutive long jumps after combo start
          comboHits++;
        }

        // score with current multiplier before potential upgrade
        score += Math.round(jumped * comboMultiplier * (1 + 0.25 * yellowCount));

        // increase combo after required number of long jumps
        if (comboHits >= comboMultiplier) {
          comboMultiplier += 2;
          comboHits = 0;
          if (comboMultiplier >= 4) {
            longJumpReady = true;
          }
        }
      } else {
        score += Math.round(jumped * (1 + 0.25 * yellowCount));
        comboMultiplier = 1;
        comboHits = 0;
        longJumpReady = false;
      }
      player.lastPlatformId = plat.id;
        if (!game.settings.continuousPlay && plat.id !== 0) {
          const interval = plat.id <= 200 ? 100 : 200;
          if (plat.id % interval === 0) {
            paused = true;
            showWheel();
          }
        }
    }
  }

  if (gameStarted) {
    let scroll = speed * game.settings.speedMultiplier; // WALL-BOUNCE speed control
    if (player.y < canvas.height / 2) {
      const diffY = canvas.height / 2 - player.y;
      player.y = canvas.height / 2;
      for (let plat of platforms) {
        plat.y += diffY;
      }
      for (let star of stars) {
        star.y += diffY;
      }
      for (let ring of rings) {
        ring.y += diffY;
      }
      backgroundY += diffY;
    }
    if (player.onGround) {
      player.y += scroll;
    }
    for (let plat of platforms) {
      plat.y += scroll;
    }
    for (let star of stars) {
      star.y += scroll;
    }
    for (let ring of rings) {
      ring.y += scroll;
    }
    backgroundY += scroll;
  }

  if (comboMultiplier > 1) {
    const cx = player.x + player.width / 2;
    const cy = player.y + player.height;
    const last = stars[stars.length - 1];
    if (!last || Math.hypot(cx - last.x, cy - last.y) > 20) {
      stars.push({ x: cx, y: cy, life: 60 });
    }
  }
  for (let i = stars.length - 1; i >= 0; i--) {
    stars[i].life--;
    if (stars[i].life <= 0) stars.splice(i, 1);
  }
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    if (
      player.x < ring.x + ring.radius &&
      player.x + player.width > ring.x - ring.radius &&
      player.y < ring.y + ring.radius &&
      player.y + player.height > ring.y - ring.radius
    ) {
      rings.splice(i, 1);
      ringCount++;
      save('ringCount', ringCount);
      updateRingDisplay();
      score += Math.round(1000 * (1 + 0.25 * yellowCount));
      scoreDisplay.style.color = 'gold';
      setTimeout(() => (scoreDisplay.style.color = '#fff'), 1000);
      continue;
    }
    if (ring.y - ring.radius > canvas.height) rings.splice(i, 1);
  }

  scoreDisplay.textContent = score;
  if (boostTimer > 0) {
    comboDisplay.style.display = 'block';
    comboDisplay.textContent = 'BOOST!';
    comboDisplay.style.color = 'red';
    comboDisplay.style.borderColor = 'red';
    boostTimer--;
  } else if (comboMultiplier > 1) {
    comboDisplay.style.display = 'block';
    comboDisplay.textContent = `KOMBO x${comboMultiplier}`;
    comboDisplay.style.color = 'yellow';
    comboDisplay.style.borderColor = 'yellow';
  } else {
    comboDisplay.style.display = 'none';
  }

  // spawn new platforms
  if (gameStarted) {
    while (platforms.length && platforms[0].y > canvas.height) {
      platforms.shift();
      const last = platforms[platforms.length - 1];
      const plat = {
        x: gameAreaX + Math.random() * (gameAreaWidth - platformWidth),
        y: last.y - platformSpacing,
        width: platformWidth,
        height: platformHeight,
        id: nextPlatformId++
      };
        if (!game.settings.continuousPlay) {
          const interval = plat.id <= 200 ? 100 : 200;
          if (plat.id % interval === 0) {
            plat.x = gameAreaX;
            plat.width = gameAreaWidth;
            widePlatform = plat;
            nextBackground(plat);
          }
        }
      platforms.push(plat);
      if (plat.id % 20 === 0) {
        rings.push({ x: plat.x + plat.width / 2, y: plat.y - ringRadius, radius: ringRadius });
      }
    }
  }

  if (player.y > canvas.height) {
    gameOver = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bgY = backgroundY % canvas.height;
  if (prevBackgroundImg) {
    ctx.drawImage(prevBackgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(prevBackgroundImg, 0, bgY, canvas.width, canvas.height);
    if (transitionPlatform) {
      const transY = transitionPlatform.y;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, transY);
      ctx.clip();
      if (backgroundImg.complete) {
        ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
        ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);
      }
      const gradient = ctx.createLinearGradient(0, transY - transitionHeight, 0, transY);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, transY - transitionHeight, canvas.width, transitionHeight);
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
    }
    if (!transitionPlatform || transitionPlatform.y >= canvas.height) {
      prevBackgroundImg = null;
      transitionPlatform = null;
    }
  } else if (backgroundImg.complete) {
    ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#88f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (let plat of platforms) {
    if (stepImg.complete) {
      ctx.drawImage(stepImg, plat.x, plat.y, plat.width, plat.height);
    } else {
      ctx.fillStyle = '#555';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    }
    ctx.strokeStyle = '#000';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
  }

  for (let ring of rings) {
    ctx.strokeStyle = 'gold';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let star of stars) {
    ctx.globalAlpha = star.life / 60;
    drawStar(star.x, star.y, 5);
  }
  ctx.globalAlpha = 1;

  // draw game area border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeRect(gameAreaX, 0, gameAreaWidth, canvas.height);

  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  if (player.flipping) ctx.rotate(player.rotation);
  if (characterImg.complete) {
    ctx.drawImage(characterImg, -player.width / 2, -player.height / 2, player.width, player.height);
  } else {
    ctx.fillStyle = '#0a0';
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
  }
  // character sprite has no black outline
  ctx.restore();

  // score and combo are displayed using DOM elements
}

function drawStar(x, y, r) {
  ctx.fillStyle = '#ff0';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outer = (18 + i * 72) * Math.PI / 180;
    const inner = (54 + i * 72) * Math.PI / 180;
    ctx.lineTo(x + Math.cos(outer) * r, y - Math.sin(outer) * r);
    ctx.lineTo(x + Math.cos(inner) * r * 0.5, y - Math.sin(inner) * r * 0.5);
  }
  ctx.closePath();
  ctx.fill();
}

function showGameOverScreen() {
  const finalScore = document.getElementById('finalScore');

  finalScore.textContent = `Gratulacje! Twój wynik: ${score}`;
  updateScoreboard();
  gameOverDiv.style.display = 'flex';
  resetSkills();
}

saveScoreBtn.addEventListener('click', () => {
  const nicknameInput = document.getElementById('nickname');
  const scoreTable = document.getElementById('scoreTable');
  const nick = nicknameInput.value.trim() || 'Anon';
  const scores = load('scores', []);
  scores.push({ name: nick, score });
  scores.sort((a, b) => b.score - a.score);
  save('scores', scores);
  updateScoreboard();
  const blob = new Blob([scoreTable.textContent], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'scores.txt';
  a.click();
  saveScoreBtn.disabled = true;
});

newGameBtn.addEventListener('click', () => {
  gameOverDiv.style.display = 'none';
  menu.style.display = 'block';
  settingsMenu.style.display = 'none';
  gameContainer.style.display = 'none';
   wheelOverlay.style.display = 'none';
   boosterFrames.style.display = 'none';
  document.getElementById('nickname').value = '';
  saveScoreBtn.disabled = false;
  updateRingDisplay();
});

function loop(now) { // WALL-BOUNCE
  if (gameOver) {
    if (!gameOverDisplayed) {
      draw();
      showGameOverScreen();
      gameOverDisplayed = true;
    }
    return;
  }
  if (!paused) {
    update(now); // WALL-BOUNCE
  }
  draw();
  requestAnimationFrame(loop);
}

// WALL-BOUNCE: Wall bounces match normal jumps and require landing before bouncing again.
