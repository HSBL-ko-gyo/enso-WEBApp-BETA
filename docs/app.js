const canvas = document.getElementById('flame');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const particles = [];


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
  cursorPosition.x = null;
  cursorPosition.y = null;
});

// タッチがキャンセルされたときに位置をリセット
canvas.addEventListener('touchcancel', (event) => {
  cursorPosition.x = null;
  cursorPosition.y = null;
});

function getRandomColor() {
  return `rgba(255, ${Math.floor(Math.random() * 128) + 128}, 0, 0.5)`;
}

class Particle {
  constructor(x, y) {
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
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();

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


  update() {
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

  draw() {
    ctx.fillStyle = this.color;
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
  }
}

function addParticle() {
  particles.push(new Particle());
}

function updateParticles() {
  particles.forEach((particle, index) => {
    particle.update();
    if (particle.size <= 0) {
      particles.splice(index, 1);
    }
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(particle => {
    particle.draw();
  });
}

function addAndDrawParticles() {
  let count = 0;
  while (count < 8) {
    addParticle();
    count++;
  }
}

function changeWind(particle) {
  particle.wind += (Math.random() * 2 - 1) * 0.05;
}

function loop() {
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
