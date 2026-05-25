<template>
  <div v-if="isOpen" class="search-overlay" @click.self="closeSearch">
    <div class="search-panel">
      <input
        ref="inputRef"
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="搜索文章..."
        autocomplete="off"
        @input="doSearch"
      />

      <div class="search-results">
        <div
          v-for="(result, index) in results"
          :key="index"
          class="search-result-item"
          @click="goToArticle(result.url)"
        >
          <div class="search-result-title" v-html="highlightText(result.title)"></div>
          <div class="search-result-snippet" v-html="highlightText(result.snippet)"></div>
          <div v-if="result.date" class="search-result-meta">{{ result.date }}</div>
        </div>

        <div v-if="keyword && results.length === 0" class="search-no-result">
          未找到相关文章
        </div>
      </div>

      <div class="search-close-hint">
        按 <kbd>Esc</kbd> 关闭
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const isOpen = ref(false);
const keyword = ref('');
const results = ref([]);
const searchData = ref(null);
const searchLoaded = ref(false);

const inputRef = ref(null);

/**
 * 加载搜索索引数据
 */
async function loadSearchData() {
  if (searchLoaded.value) {
    return;
  }

  searchLoaded.value = true;

  try {
    // 从当前页面URL推断根路径，兼容本地开发和线上部署
    const base = document.baseURI.replace(/\/[^\/]*$/, '/');
    const response = await fetch(base + 'search.json');
    if (response.ok) {
      searchData.value = await response.json();
    }
  } catch (err) {
    console.warn('[Search] Failed to load search data:', err);
  }
}

/**
 * 去除 HTML 标签
 */
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(str) {
  return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/**
 * 高亮文本中的关键词
 */
function highlightText(text) {
  if (!keyword.value || !text) {
    return text;
  }

  const escapedKeyword = escapeRegex(keyword.value);
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  return text.replace(regex, '<em>$1</em>');
}

/**
 * 执行搜索
 */
function doSearch() {
  if (!searchData.value || !keyword.value.trim()) {
    results.value = [];
    return;
  }

  const query = keyword.value.toLowerCase().trim();
  const matches = [];

  for (const item of searchData.value) {
    const title = (item.title || '').toLowerCase();
    const content = stripHtml(item.content || '').toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    const categories = (item.categories || []).join(' ').toLowerCase();

    if (
      title.includes(query) ||
      content.includes(query) ||
      tags.includes(query) ||
      categories.includes(query)
    ) {
      let snippet = stripHtml(item.content || '');
      const idx = snippet.toLowerCase().indexOf(query);

      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(snippet.length, idx + query.length + 80);
        snippet = (start > 0 ? '...' : '') + snippet.substring(start, end) + (end < snippet.length ? '...' : '');
      } else {
        snippet = snippet.substring(0, 120) + '...';
      }

      matches.push({
        title: item.title,
        url: item.url,
        snippet: snippet,
        date: item.date
      });
    }

    if (matches.length >= 10) {
      break;
    }
  }

  results.value = matches;
}

/**
 * 打开搜索面板
 */
function openSearch() {
  isOpen.value = true;
  loadSearchData();

  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
}

/**
 * 关闭搜索面板
 */
function closeSearch() {
  isOpen.value = false;
  keyword.value = '';
  results.value = [];
}

/**
 * 跳转到文章
 */
function goToArticle(url) {
  if (url) {
    window.location.href = url;
  }
}

/**
 * 处理键盘事件
 */
function handleKeydown(e) {
  if (e.key === 'Escape') {
    closeSearch();
  }
}

/**
 * 处理搜索按钮点击
 */
function handleSearchBtnClick(e) {
  const searchBtn = e.target.closest('.nav-search-btn');
  if (searchBtn) {
    e.preventDefault();
    e.stopImmediatePropagation();
    openSearch();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleSearchBtnClick, true);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', handleSearchBtnClick, true);
});
</script>

<style scoped>
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 14, 23, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding-top: 12vh;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.search-panel {
  width: 90%;
  max-width: 640px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.search-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 18px;
  font-family: 'Sora', sans-serif;
  background: #111827;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 12px;
  color: #e2e8f0;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.08);
}

.search-input::placeholder {
  color: #64748b;
}

.search-results {
  margin-top: 12px;
  overflow-y: auto;
  flex: 1;
}

.search-result-item {
  padding: 16px 20px;
  margin-bottom: 8px;
  background: #111827;
  border: 1px solid rgba(0, 240, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.search-result-item:hover {
  border-color: rgba(0, 240, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 240, 255, 0.06);
}

.search-result-title {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 6px;
}

.search-result-title :deep(em) {
  color: #00f0ff;
  font-style: normal;
}

.search-result-snippet {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.search-result-snippet :deep(em) {
  color: #00f0ff;
  font-style: normal;
  background: rgba(0, 240, 255, 0.08);
  padding: 0 2px;
  border-radius: 2px;
}

.search-result-meta {
  font-size: 12px;
  color: #475569;
  margin-top: 6px;
}

.search-no-result {
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
  font-size: 15px;
}

.search-close-hint {
  font-size: 12px;
  color: #475569;
  text-align: center;
  margin-top: 16px;
}

.search-close-hint kbd {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  color: #94a3b8;
}
</style>
