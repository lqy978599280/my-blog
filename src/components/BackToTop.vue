<template>
  <div class="back-to-top-widget">
    <Transition name="fade">
      <button
        v-show="isVisible"
        class="back-to-top-btn"
        @click="scrollToTop"
        aria-label="回到顶部"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        <span class="tooltip">回到顶部</span>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);
const SCROLL_THRESHOLD = 300;

function checkScroll() {
  isVisible.value = window.scrollY > SCROLL_THRESHOLD;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});
</script>

<style scoped>
.back-to-top-widget {
  position: fixed;
  bottom: 96px;
  right: 24px;
  z-index: 9997;
  font-family: 'Sora', sans-serif;
}

.back-to-top-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(0, 240, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
}

.back-to-top-btn:hover {
  background: rgba(0, 240, 255, 0.15);
  border-color: rgba(0, 240, 255, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 6px 30px rgba(0, 240, 255, 0.2);
}

.back-to-top-btn:active {
  transform: translateY(-1px);
}

.back-to-top-btn svg {
  width: 28px;
  height: 28px;
  color: #00f0ff;
}

.back-to-top-btn .tooltip {
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  background: #1e293b;
  color: #e2e8f0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.back-to-top-btn:hover .tooltip {
  opacity: 1;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 移动端适配 */
@media (max-width: 767px) {
  .back-to-top-widget {
    bottom: 80px;
    right: 16px;
  }

  .back-to-top-btn {
    width: 48px;
    height: 48px;
  }

  .back-to-top-btn svg {
    width: 24px;
    height: 24px;
  }
}
</style>
