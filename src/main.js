import { createApp } from 'vue';
import ParticleCanvas from './components/ParticleCanvas.vue';
import AiChat from './components/AiChat.vue';
import SearchPanel from './components/SearchPanel.vue';
import BackToTop from './components/BackToTop.vue';
import PptGenerator from './components/PptGenerator.vue';
import ImageGenerator from './components/ImageGenerator.vue';
import { useScrollReveal } from './composables/useScrollReveal.js';
import './styles/global.css';

// 全局错误兜底，防止任何 widget 错误导致页面白屏崩溃
window.onerror = function (msg, source, line, col, err) {
  console.error('[BlogWidget] Global error caught:', msg, source, line, col, err);
  return true; // 阻止浏览器默认行为（如刷新页面）
};
window.addEventListener('unhandledrejection', function (e) {
  console.error('[BlogWidget] Unhandled promise rejection:', e.reason);
  e.preventDefault();
});

function safeMount(Component, containerId) {
  try {
    const container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
    const app = createApp(Component);
    app.config.errorHandler = function (err, vm, info) {
      console.error('[BlogWidget] Vue error in ' + containerId + ' (' + info + '):', err);
    };
    app.mount(container);
  } catch (err) {
    console.error('[BlogWidget] Failed to mount ' + containerId + ':', err);
  }
}

function initBlogWidgets() {
  // 初始化粒子动画
  try {
    const headerEl = document.getElementById('header');
    if (headerEl) {
      const particleContainer = document.createElement('div');
      particleContainer.id = 'particle-canvas-container';
      headerEl.insertBefore(particleContainer, headerEl.children[1] || null);
      createApp(ParticleCanvas).mount(particleContainer);
    }
  } catch (err) {
    console.error('[BlogWidget] Failed to mount particle-canvas:', err);
  }

  // 初始化 AI 聊天组件
  safeMount(AiChat, 'ai-chat-app');

  // 初始化搜索面板
  safeMount(SearchPanel, 'search-panel-app');

  // 初始化回到顶部按钮
  safeMount(BackToTop, 'back-to-top-app');

  // 初始化 PPT 生成器
  safeMount(PptGenerator, 'ppt-generator-app');

  // 初始化图片生成器
  safeMount(ImageGenerator, 'image-generator-app');

  // 初始化滚动动效
  try {
    useScrollReveal();
  } catch (err) {
    console.error('[BlogWidget] Failed to init scroll reveal:', err);
  }
}

// 等待 DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogWidgets);
} else {
  initBlogWidgets();
}
