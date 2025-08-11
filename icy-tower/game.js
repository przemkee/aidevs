const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// WALL-BOUNCE: global configuration
const config = {
  wallBounceEnabledDefault: true,
  chargeMaxLevel: 5,
  baseJumpVelocity: 520,
  baseWallBounceSpeed: 380,
  wallSlideMaxDownSpeed: 120,
  ui: {
    barWidth: 18,
    barHeight: 180,
    barRightPadding: 12,
    barTopPadding: 24,
    colorBg: 'rgba(20,20,20,0.6)',
    colorSegEmpty: 'rgba(80,80,80,0.7)',
    colorSegFull: '#ff6a00',
    colorSegGlow: 'rgba(255,110,0,0.35)',
    labelColor: '#ffffff',
    font: '12px monospace'
  }
};

const savedSetting = localStorage.getItem('wallBounceEnabled'); // WALL-BOUNCE
const game = { // WALL-BOUNCE
  settings: {
    wallBounceEnabled: savedSetting !== null ? JSON.parse(savedSetting) : config.wallBounceEnabledDefault,
    speedMultiplier: 1
  }
};

const menu = document.getElementById('mainMenu'); // WALL-BOUNCE start menu renamed
const startBtn = document.getElementById('startBtn');
const difficultySelect = document.getElementById('difficulty');
const gameContainer = document.getElementById('gameContainer');
const scoreDisplay = document.getElementById('currentScore');
const comboDisplay = document.getElementById('comboDisplay');
const scoreTable = document.getElementById('scoreTable');
const optionsMenu = document.getElementById('menu');

// WALL-BOUNCE: option controls
const toggleWallBounce = document.getElementById('toggleWallBounce');
const speedMinus = document.getElementById('speedMinus');
const speedPlus = document.getElementById('speedPlus');
const speedValue = document.getElementById('speedValue');
toggleWallBounce.checked = game.settings.wallBounceEnabled;
function updateSpeedLabel() { speedValue.textContent = game.settings.speedMultiplier.toFixed(1) + 'x'; }
updateSpeedLabel();
toggleWallBounce.addEventListener('change', () => {
  game.settings.wallBounceEnabled = toggleWallBounce.checked;
  localStorage.setItem('wallBounceEnabled', game.settings.wallBounceEnabled);
  console.log('Wall bounce ' + (game.settings.wallBounceEnabled ? 'enabled' : 'disabled') + ', charge=' + (player ? player.chargeLevel : 0)); // WALL-BOUNCE
});
speedMinus.addEventListener('click', () => {
  game.settings.speedMultiplier = Math.max(0.5, game.settings.speedMultiplier - 0.5);
  updateSpeedLabel();
  console.log('Speed x' + game.settings.speedMultiplier.toFixed(1)); // WALL-BOUNCE
});
speedPlus.addEventListener('click', () => {
  game.settings.speedMultiplier = Math.min(3, game.settings.speedMultiplier + 0.5);
  updateSpeedLabel();
  console.log('Speed x' + game.settings.speedMultiplier.toFixed(1)); // WALL-BOUNCE
});

const backgroundImg = new Image();
backgroundImg.src = 'assets/Background.jpg';
const stepImg = new Image();
stepImg.src = 'assets/step.jpg';
const characterImg = new Image();
characterImg.src = 'assets/character.jpg';

const difficulties = {
  easy: { platformWidth: 90, speed: 1.5 },
  medium: { platformWidth: 70, speed: 2.5 },
  hard: { platformWidth: 50, speed: 3.5 }
};

const platformHeight = 20;
const borderWidth = 2;
const ringRadius = 15;

function updateScoreboard() {
  let scores;
  try {
    scores = JSON.parse(localStorage.getItem('scores')) || [];
  } catch (e) {
    scores = [];
  }
  scoreTable.textContent = scores
    .map((s, i) => `${i + 1}. ${s.name}: ${s.score}`)
    .join('\n');
}

updateScoreboard();

function startGame() {
  menu.style.display = 'none';
  optionsMenu.style.display = 'none';
  gameContainer.style.display = 'block';
  canvas.width = 600;
  canvas.height = window.innerHeight;
  const diff = difficulties[difficultySelect.value];
  initGame(diff);
  requestAnimationFrame(loop);
}

startBtn.addEventListener('click', startGame);

document.addEventListener('keydown', e => {
  if (menu.style.display !== 'none' && e.code === 'Space') {
    startGame();
  }
});

const gravity = 0.5;
let platformWidth = 90;
let speed = 2;

let player, platforms, keys, gameOver, gameStarted, score;
let gameOverDisplayed = false;
let gameAreaWidth, gameAreaX;
let platformSpacing, nextPlatformId, comboMultiplier, comboHits;
let stars, rings;
let longJumpReady;
let boostTimer;
let prevKeys = {}; // WALL-BOUNCE

function initGame(diff) {
  platformWidth = diff.platformWidth;
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
    chargeLevel: 0, // WALL-BOUNCE
    wallContactDir: 0 // WALL-BOUNCE
  };
  // WALL-BOUNCE methods
  player.tryWallBounce = function() {
    if (this.wallContactDir === 0) return false;
    const L = this.chargeLevel;
    const speedMul = Math.pow(1.5, L);
    const heightMul = Math.pow(1.5, L);
    const frame = 1 / 60;
    this.vx = -this.wallContactDir * config.baseWallBounceSpeed * speedMul * frame * game.settings.speedMultiplier;
    this.vy = -config.baseJumpVelocity * heightMul * frame * game.settings.speedMultiplier;
    if (this.chargeLevel < config.chargeMaxLevel) {
      this.chargeLevel++;
    }
    console.log('Charge increased, level', this.chargeLevel); // WALL-BOUNCE
    return true;
  };
  console.log('Wall bounce ' + (game.settings.wallBounceEnabled ? 'enabled' : 'disabled') + ', charge=' + player.chargeLevel); // WALL-BOUNCE
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
  prevKeys = {}; // WALL-BOUNCE
  gameOver = false;
  gameStarted = false;
  score = 0;
  boostTimer = 0;
  scoreDisplay.style.color = '#fff';
  gameOverDisplayed = false;
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
  const jumpJustPressed = keys['Space'] && !prevKeys['Space']; // WALL-BOUNCE
  prevKeys['Space'] = keys['Space']; // WALL-BOUNCE

  player.isCombo = comboMultiplier > 1; // WALL-BOUNCE

  if (left) player.vx = -4 * game.settings.speedMultiplier;
  else if (right) player.vx = 4 * game.settings.speedMultiplier;
  else player.vx = 0;

  let wallBounced = false; // WALL-BOUNCE
  if (jumpJustPressed && player.wallContactDir !== 0 && player.isCombo && game.settings.wallBounceEnabled) {
    wallBounced = player.tryWallBounce(); // WALL-BOUNCE
  }

  if (jumpJustPressed && player.onGround && !wallBounced) {
    let heightBoost = 1;
    if (longJumpReady && comboMultiplier >= 4) {
      heightBoost = comboMultiplier / 2;
      longJumpReady = false;
    }
    player.vy = -20 * heightBoost * game.settings.speedMultiplier;
    player.onGround = false;
    if (!gameStarted) gameStarted = true;
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

  // boundaries and wall contact // WALL-BOUNCE
  player.wallContactDir = 0; // WALL-BOUNCE
  if (player.x < gameAreaX) {
    player.x = gameAreaX;
    player.wallContactDir = -1; // WALL-BOUNCE
  }
  if (player.x + player.width > gameAreaX + gameAreaWidth) {
    player.x = gameAreaX + gameAreaWidth - player.width;
    player.wallContactDir = 1; // WALL-BOUNCE
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
      const jumped = plat.id - player.lastPlatformId;
      const skipped = jumped - 1; // number of platforms skipped in this jump
      if (skipped >= 3) {
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
        score += jumped * comboMultiplier;

        // increase combo after required number of long jumps
        if (comboHits >= comboMultiplier) {
          comboMultiplier += 2;
          comboHits = 0;
          if (comboMultiplier >= 4) {
            longJumpReady = true;
          }
        }
      } else {
        score += jumped;
        comboMultiplier = 1;
        comboHits = 0;
        longJumpReady = false;
      }
      player.lastPlatformId = plat.id;
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
      score += 1000;
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
  if (backgroundImg.complete) {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
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

  if (characterImg.complete) {
    ctx.drawImage(characterImg, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = '#0a0';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
  ctx.strokeStyle = '#000';
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(player.x, player.y, player.width, player.height);

  drawWallBar(); // WALL-BOUNCE

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

function drawWallBar() { // WALL-BOUNCE
  if (!game.settings.wallBounceEnabled) return;
  const ui = config.ui;
  const x = canvas.width - ui.barRightPadding - ui.barWidth;
  const y = ui.barTopPadding;
  ctx.fillStyle = ui.colorBg;
  ctx.fillRect(x - 4, y - 4, ui.barWidth + 8, ui.barHeight + 8);
  const segHeight = ui.barHeight / config.chargeMaxLevel;
  for (let i = 0; i < config.chargeMaxLevel; i++) {
    const segY = y + ui.barHeight - (i + 1) * segHeight;
    ctx.fillStyle = i < player.chargeLevel ? ui.colorSegFull : ui.colorSegEmpty;
    ctx.fillRect(x, segY, ui.barWidth, segHeight - 2);
    if (i < player.chargeLevel) {
      ctx.fillStyle = ui.colorSegGlow;
      ctx.fillRect(x, segY, ui.barWidth, segHeight - 2);
    }
  }
  ctx.fillStyle = ui.labelColor;
  ctx.font = ui.font;
  ctx.fillText('WALL', x - 4, y - 6);
} // WALL-BOUNCE

function showGameOverScreen() {
  const gameOverDiv = document.getElementById('gameOver');
  const finalScore = document.getElementById('finalScore');

  finalScore.textContent = `Gratulacje! Twój wynik: ${score}`;
  updateScoreboard();
  gameOverDiv.style.display = 'flex';
}

const saveScoreBtn = document.getElementById('saveScoreBtn');
saveScoreBtn.addEventListener('click', () => {
  const nicknameInput = document.getElementById('nickname');
  const scoreTable = document.getElementById('scoreTable');
  const nick = nicknameInput.value.trim() || 'Anon';
  let scores;
  try {
    scores = JSON.parse(localStorage.getItem('scores')) || [];
  } catch (e) {
    scores = [];
  }
  scores.push({ name: nick, score });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('scores', JSON.stringify(scores));
  updateScoreboard();
  const blob = new Blob([scoreTable.textContent], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'scores.txt';
  a.click();
  saveScoreBtn.disabled = true;
});

const newGameBtn = document.getElementById('newGameBtn');
newGameBtn.addEventListener('click', () => {
  const gameOverDiv = document.getElementById('gameOver');
  gameOverDiv.style.display = 'none';
  menu.style.display = 'block';
  optionsMenu.style.display = 'block';
  gameContainer.style.display = 'none';
  document.getElementById('nickname').value = '';
  saveScoreBtn.disabled = false;
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
  update(now); // WALL-BOUNCE
  draw();
  requestAnimationFrame(loop);
}

// WALL-BOUNCE: Test by jumping between two close walls to chain bounces and watch the charge bar refill.
