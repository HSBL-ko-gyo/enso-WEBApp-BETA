// 背景系
const canvas = document.getElementById('flame');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

// 背景のちらつきの強さを設定
const backgroundFlickerStrength = 0.9;
const brightnessVariationFactor = 0.1;
const backgroundAdaptationFrames = 30;
const minBrightnessVariation = 0.1; // 0.1 から 0.9 までの変動範囲
const maxBrightnessVariation = 0.9;

// フレームカウントを初期化
let frameCount = 0;

// 行数と列数を設定
const numberOfRows = 10;
const numberOfColumns = 10;

// 現在の背景の明るさを格納する変数
let currentBackgroundBrightness = 128;

// パーティクルの配列を初期化
const particles = [];

// フェードイン速度を制御する変数
const fadeInSpeed = 0.01;
const framesToReachFullAlpha = 60;

// フェードイン、表示、フェードアウトにかかるフレーム数を設定
const fadeInFrames = 60;
const displayFrames = 60;
const fadeOutFrames = 60;

// 炎のサイズを調整する変数
const flameSize = 2;

// パーティクルの上昇速度を調整する変数
const particleRiseSpeed = 0.3;

// パーティクルのサイズ減少速度を調整する変数
const particleSizeDecreaseSpeed = 0.1;

// パーティクルの横に広がる具合を制限する変数
const particleSpreadLimit = 1;

// カーソルの位置を格納する変数
let cursorPosition = { x: null, y: null };
let touchEndTime = 0;

// カーソルの位置を取得
canvas.addEventListener('mousemove', (event) => {
  cursorPosition.x = event.clientX;
  cursorPosition.y = event.clientY;
});

// タッチの位置を取得
canvas.addEventListener('touchmove', (event) => {
  event.preventDefault();
  cursorPosition.x = event.touches[0].clientX;
  cursorPosition.y = event.touches[0].clientY;
});

// タッチが終わったときに位置をリセット
canvas.addEventListener('touchend', (event) => {
  touchEndTime = Date.now();
});

// タッチ終了から一定時間経過したら、カーソル位置をリセット
setInterval(() => {
  if (touchEndTime && Date.now() - touchEndTime > 100) {
    cursorPosition.x = null;
    cursorPosition.y = null;
    touchEndTime = 0;
  }
}, 100);

// ランダムな色を生成する関数
function getRandomColor() {
  return `rgba(255, ${Math.floor(Math.random() * 128) + 128}, 0, 0.5)
`;
}

// Particle クラス
class Particle {
  constructor(x, y) {
    // 透明度を追加
    this.alpha = 0;
    this.framesToReachFullAlpha = framesToReachFullAlpha;
    this.x = canvas.width / 2 + Math.random() * 60 * flameSize - 30 * flameSize;
    this.y = canvas.height * 0.8;
    this.size = (Math.random() * 8 + 4) * flameSize;
    this.speedX = (Math.random() * 2 - 1) * flameSize;
    this.speedY = (Math.random() * 4 + 1) * flameSize;
    this.color = getRandomColor();
    this.shape = Math.floor(Math.random() * 3); // 0 to 2
    this.wind = 0;
    this.speedX = (Math.random() - 0.5) * particleSpreadLimit;

    // 加速度を追加
    this.accelX = 0;
    this.accelY = 0;

    // フェードアウト
    this.state = 'fadeIn';       // パーティクルの状態を表すプロパティ
    this.fadeInFrames = fadeInFrames;
    this.displayFrames = displayFrames;
    this.fadeOutFrames = fadeOutFrames;
  }

  // パーティクルを描画する関数
  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.globalAlpha = 1;

    // パーティクルの形状に応じて描画方法を変更
    switch (this.shape) {
      case 0: // Square
        ctx.fillRect(this.x, this.y, this.size, this.size);
        break;
      case 1: // Circle
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 2: // Distorted Rectangle
        ctx.fillRect(this.x + Math.random() * this.size / 4, this.y, this.size / 2 + Math.random() * this.size / 2, this.size + Math.random() * this.size / 2);
        break;
      case 3: // Distorted Ellipse
        ctx.ellipse(this.x, this.y, (this.size / 2) + Math.random() * this.size / 4, this.size + Math.random() * this.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  // パーティクルの状態を更新する関数
  update() {
    // 状態に応じて透明度を変更
    if (this.state === 'fadeIn') {
      this.alpha += 1 / this.fadeInFrames;
      if (this.alpha >= 1) {
        this.alpha = 1;
        this.state = 'display';
      }
    } else if (this.state === 'display') {
      this.displayFrames--;
      if (this.displayFrames <= 0) {
        this.state = 'fadeOut';
      }
    } else if (this.state === 'fadeOut') {
      this.alpha -= 1 / this.fadeOutFrames;
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.state = 'hidden';
      }
    }
    // カーソルやタッチの位置を避ける
    if (cursorPosition.x && cursorPosition.y) {
      const distanceX = this.x - cursorPosition.x;
      const distanceY = this.y - cursorPosition.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      if (distance < 100) {
        const avoidanceStrength = 2 * (100 - distance) / 100;
        this.x += (distanceX / distance) * avoidanceStrength;
        this.y += (distanceY / distance) * avoidanceStrength;
      }
    }

    this.x += this.speedX + this.wind;
    this.y -= this.speedY * particleRiseSpeed;
    this.size -= particleSizeDecreaseSpeed;
    this.speedY *= 0.995;
  }

  // パーティクルを描画する関数 (アルファ値を適用)
  draw() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha; // 透明度を適用
    if (this.shape === 0) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.shape === 1) {
      ctx.fillRect(this.x, this.y, this.size, this.size);
    } else {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2);
      ctx.lineTo(this.x + this.size, this.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = this.alpha; // 透明度を適用
  }

}


// パーティクルを追加する関数
function addParticle() {
  particles.push(new Particle());
}

// パーティクルの状態を更新する関数
function updateParticles() {
  particles.forEach((particle, index) => {
    particle.update();
    if (particle.size <= 0) {
      particles.splice(index, 1);
    }
  });
}

// パーティクルを描画する関数
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(particle => {
    particle.draw();
  });
}

// パーティクルを追加し、描画する関数
function addAndDrawParticles() {
  let count = 0;
  while (count < 8) {
    addParticle();
    count++;
  }
}

// パーティクルの風の方向を変更する関数
function changeWind(particle) {
  particle.wind += (Math.random() * 2 - 1) * 0.05;
}

// 背景を描画する関数
function calculateAverageFlameBrightness() {
  let totalBrightness = 0;
  let count = 0;

  particles.forEach(particle => {
    const colorValues = particle.color.match(/\d+/g).map(Number);
    totalBrightness += colorValues[1];
    count++;
  });

  return count ? totalBrightness / count : 128;
}

function drawBackground() {
  const cellWidth = canvas.width / numberOfColumns;
  const cellHeight = canvas.height / numberOfRows;

  for (let i = 0; i < numberOfRows; i++) {
    for (let j = 0; j < numberOfColumns; j++) {
      const brightness = (minBrightnessVariation + (maxBrightnessVariation - minBrightnessVariation) / 2) + (maxBrightnessVariation - minBrightnessVariation) / 2 * Math.random();
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
    }
  }
}


//*/

function loop() {

  //背景系
  drawBackground(); // ここで背景を描画
  updateParticles();
  drawParticles();
  addAndDrawParticles();
  particles.forEach(particle => {
    if (Math.random() < 0.05) {
      changeWind(particle);
    }
    particle.wind *= 0.99;
  });
  requestAnimationFrame(loop);
}


loop();