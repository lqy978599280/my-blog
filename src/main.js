import { createApp } from 'vue';
import ParticleCanvas from './components/ParticleCanvas.vue';
import AiChat from './components/AiChat.vue';
import SearchPanel from './components/SearchPanel.vue';
import { useScrollReveal } from './composables/useScrollReveal.js';
import './styles/global.css';

/**
 * 初始化博客自定义组件
 * 在 Hexo 生成的静态页面中挂载 Vue3 组件
 */
function initBlogWidgets() {
  // 初始化粒子动画
  const headerEl = document.getElementById('header');
  if (headerEl) {
    const particleContainer = document.createElement('div');
    particleContainer.id = 'particle-canvas-container';
    headerEl.insertBefore(particleContainer, headerEl.children[1] || null);
    createApp(ParticleCanvas).mount(particleContainer);
  }

  // 初始化 AI 聊天组件
  const chatContainer = document.createElement('div');
  chatContainer.id = 'ai-chat-app';
  document.body.appendChild(chatContainer);
  createApp(AiChat).mount(chatContainer);

  // 初始化搜索面板
  const searchContainer = document.createElement('div');
  searchContainer.id = 'search-panel-app';
  document.body.appendChild(searchContainer);
  createApp(SearchPanel).mount(searchContainer);

  // 初始化滚动动效
  useScrollReveal();
}

// 等待 DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogWidgets);
} else {
  initBlogWidgets();
}
