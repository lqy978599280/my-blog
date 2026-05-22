<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref(null);
let ctx = null;
let particles = [];
let animationId = null;
let resizeTimer = null;

const PARTICLE_COUNT = 60;
const MAX_DISTANCE = 120;

/**
 * 粒子类
 */
class Particle {
  constructor(width, height) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  update(width, height) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) {
      this.vx *= -1;
    }

    if (this.y < 0 || this.y > height) {
      this.vy *= -1;
    }
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
    context.fill();
  }
}

/**
 * 初始化粒子数组
 */
function initParticles(width, height) {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(width, height));
  }
}

/**
 * 绘制粒子之间的连线
 */
function drawConnections(context) {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DISTANCE) {
        const opacity = (1 - dist / MAX_DISTANCE) * 0.15;
        context.beginPath();
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);
        context.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
        context.lineWidth = 0.5;
        context.stroke();
      }
    }
  }
}

/**
 * 动画循环
 */
function animate() {
  if (!ctx || !canvasRef.value) {
    return;
  }

  const width = canvasRef.value.width;
  const height = canvasRef.value.height;

  ctx.clearRect(0, 0, width, height);

  for (const particle of particles) {
    particle.update(width, height);
    particle.draw(ctx);
  }

  drawConnections(ctx);

  animationId = requestAnimationFrame(animate);
}

/**
 * 调整画布大小
 */
function resizeCanvas() {
  if (!canvasRef.value) {
    return;
  }

  const parent = canvasRef.value.parentElement;
  if (!parent) {
    return;
  }

  canvasRef.value.width = parent.offsetWidth;
  canvasRef.value.height = parent.offsetHeight;
  initParticles(canvasRef.value.width, canvasRef.value.height);
}

/**
 * 防抖处理窗口大小变化
 */
function handleResize() {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }

  resizeTimer = setTimeout(() => {
    resizeCanvas();
  }, 200);
}

onMounted(() => {
  if (!canvasRef.value) {
    return;
  }

  ctx = canvasRef.value.getContext('2d');
  resizeCanvas();
  animate();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }

  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}
</style>
