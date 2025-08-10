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
  const diff = difficulties[difficultySelect.value];
  initGame(diff);
  requestAnimationFrame(loop);
});

const gravity = 0.5;
let platformWidth = 90;
let speed = 2;

let player, platforms, keys, gameOver;

function initGame(diff) {
  platformWidth = diff.platformWidth;
  speed = diff.speed;
  player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 60,
    vx: 0,
    vy: 0,
    onGround: false
  };
  platforms = [];
  const num = 6;
  for (let i = 0; i < num; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: canvas.height - i * 100,
      width: platformWidth,
      height: 10
    });
  }
  keys = {};
  gameOver = false;
}

document.addEventListener('keydown', e => {
  keys[e.code] = true;
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
});

function update() {
  if (keys['ArrowLeft']) player.vx = -3;
  else if (keys['ArrowRight']) player.vx = 3;
  else player.vx = 0;

  if (keys['Space'] && player.onGround) {
    player.vy = -10;
    player.onGround = false;
  }

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // boundaries
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

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
    }
    plat.y += speed;
  }

  // spawn new platforms
  while (platforms.length && platforms[0].y > canvas.height) {
    platforms.shift();
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: -10,
      width: platformWidth,
      height: 10
    });
  }

  if (player.y > canvas.height) {
    gameOver = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#88f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#555';
  for (let plat of platforms) {
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  }

  // draw player body
  ctx.fillStyle = '#0a0';
  ctx.fillRect(player.x, player.y + 30, player.width, player.height - 30);

  if (faceImg && faceImg.complete) {
    ctx.drawImage(faceImg, player.x, player.y, player.width, 30);
  } else {
    ctx.fillStyle = '#faa';
    ctx.fillRect(player.x, player.y, player.width, 30);
  }
}

function loop() {
  if (gameOver) {
    alert('Koniec gry!');
    document.location.reload();
    return;
  }
  update();
  draw();
  requestAnimationFrame(loop);
}
