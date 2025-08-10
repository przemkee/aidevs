const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const menu = document.getElementById('menu');
const startBtn = document.getElementById('startBtn');
const difficultySelect = document.getElementById('difficulty');
const faceInput = document.getElementById('faceInput');

const difficulties = {
  easy: { platformWidth: 90, speed: 1.5 },
  medium: { platformWidth: 70, speed: 2.5 },
  hard: { platformWidth: 50, speed: 3.5 }
};

let faceImg = new Image();
faceInput.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      faceImg = new Image();
      faceImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

startBtn.addEventListener('click', () => {
  menu.style.display = 'none';
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const diff = difficulties[difficultySelect.value];
  initGame(diff);
  requestAnimationFrame(loop);
});

const gravity = 0.5;
let platformWidth = 90;
let speed = 2;

let player, platforms, keys, gameOver, gameStarted, score;
let gameOverDisplayed = false;
let gameAreaWidth, gameAreaX;
let platformSpacing, nextPlatformId, comboMultiplier, comboHits;
let stars;

function initGame(diff) {
  platformWidth = diff.platformWidth;
  speed = diff.speed;
  gameAreaWidth = Math.min(600, canvas.width);
  gameAreaX = (canvas.width - gameAreaWidth) / 2;
  player = {
    x: gameAreaX + gameAreaWidth / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 60,
    vx: 0,
    vy: 0,
    onGround: true,
    lastPlatformId: 0
  };
  platforms = [];
  const num = Math.ceil(canvas.height / 100);
  platformSpacing = (canvas.height - 20) / (num - 1);
  platforms.push({
    x: gameAreaX,
    y: canvas.height - 20,
    width: gameAreaWidth,
    height: 10,
    id: 0
  });
  for (let i = 1; i < num; i++) {
    platforms.push({
      x: gameAreaX + Math.random() * (gameAreaWidth - platformWidth),
      y: canvas.height - 20 - i * platformSpacing,
      width: platformWidth,
      height: 10,
      id: i
    });
  }
  nextPlatformId = num;
  comboMultiplier = 1;
  comboHits = 0;
  stars = [];
  keys = {};
  gameOver = false;
  gameStarted = false;
  score = 0;
  gameOverDisplayed = false;
}

document.addEventListener('keydown', e => {
  keys[e.code] = true;
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
});

function update() {
  if (keys['ArrowLeft']) player.vx = -4;
  else if (keys['ArrowRight']) player.vx = 4;
  else player.vx = 0;

  if (keys['Space'] && player.onGround) {
    let jumpPower = -20;
    if (comboMultiplier >= 4) {
      jumpPower *= comboMultiplier / 2;
    }
    player.vy = jumpPower;
    player.onGround = false;
    if (!gameStarted) gameStarted = true;
  }

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // boundaries
  if (player.x < gameAreaX) player.x = gameAreaX;
  if (player.x + player.width > gameAreaX + gameAreaWidth) {
    player.x = gameAreaX + gameAreaWidth - player.width;
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
      const highestId = platforms[platforms.length - 1].id;
      const isHighest = plat.id === highestId;
      if (isHighest) {
        if (jumped >= 3) {
          comboHits++;
          if (comboHits >= comboMultiplier) {
            comboMultiplier *= 2;
            comboHits = 0;
          }
          score += jumped * comboMultiplier;
        } else {
          score += jumped;
        }
      } else {
        score += jumped;
        comboMultiplier = 1;
        comboHits = 0;
      }
      player.lastPlatformId = plat.id;
    }
  }

  if (gameStarted) {
    let scroll = speed;
    if (player.y < canvas.height / 2) {
      const diffY = canvas.height / 2 - player.y;
      player.y = canvas.height / 2;
      scroll += diffY;
    }
    for (let plat of platforms) {
      plat.y += scroll;
    }
    for (let star of stars) {
      star.y += scroll;
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

  // spawn new platforms
  if (gameStarted) {
    while (platforms.length && platforms[0].y > canvas.height) {
      platforms.shift();
      const last = platforms[platforms.length - 1];
      platforms.push({
        x: gameAreaX + Math.random() * (gameAreaWidth - platformWidth),
        y: last.y - platformSpacing,
        width: platformWidth,
        height: 10,
        id: nextPlatformId++
      });
    }
  }

  if (player.y > canvas.height) {
    gameOver = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (comboMultiplier > 1) {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#ff0000');
    grad.addColorStop(0.17, '#ff7f00');
    grad.addColorStop(0.33, '#ffff00');
    grad.addColorStop(0.5, '#00ff00');
    grad.addColorStop(0.67, '#0000ff');
    grad.addColorStop(0.83, '#4b0082');
    grad.addColorStop(1, '#8b00ff');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = '#88f';
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#555';
  for (let plat of platforms) {
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
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

  // draw player body
  ctx.fillStyle = '#0a0';
  ctx.fillRect(player.x, player.y + 30, player.width, player.height - 30);

  if (faceImg && faceImg.complete) {
    ctx.drawImage(faceImg, player.x, player.y, player.width, 30);
  } else {
    ctx.fillStyle = '#faa';
    ctx.fillRect(player.x, player.y, player.width, 30);
  }

  ctx.fillStyle = '#000';
  ctx.font = '24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Score: ${score}`, canvas.width - 20, 30);
  if (comboMultiplier > 1) {
    ctx.fillText(`Combo x${comboMultiplier}!`, canvas.width - 20, 60);
  }
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
  const gameOverDiv = document.getElementById('gameOver');
  const finalScore = document.getElementById('finalScore');
  const scoreTable = document.getElementById('scoreTable');

  finalScore.textContent = `Gratulacje! Twój wynik: ${score}`;
  let scores;
  try {
    scores = JSON.parse(localStorage.getItem('scores')) || [];
  } catch (e) {
    scores = [];
  }
  scoreTable.textContent = scores
    .map((s, i) => `${i + 1}. ${s.name}: ${s.score}`)
    .join('\n');
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
  scoreTable.textContent = scores
    .map((s, i) => `${i + 1}. ${s.name}: ${s.score}`)
    .join('\n');
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
  canvas.style.display = 'none';
  document.getElementById('nickname').value = '';
  saveScoreBtn.disabled = false;
});

function loop() {
  if (gameOver) {
    if (!gameOverDisplayed) {
      draw();
      showGameOverScreen();
      gameOverDisplayed = true;
    }
    return;
  }
  update();
  draw();
  requestAnimationFrame(loop);
}
