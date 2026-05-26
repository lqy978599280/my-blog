<template>
  <div class="ai-chat-widget">
    <!-- 聊天窗口 -->
    <div v-if="isOpen" class="chat-window" @click.stop>
      <div class="chat-header">
        <div class="chat-header-title">
          <span class="status-dot"></span>
          AI探索助手
        </div>
        <button class="chat-close" @click="closeChat">&times;</button>
      </div>

      <div ref="messagesContainer" class="chat-messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['chat-msg', msg.role]"
          v-html="msg.role === 'assistant' ? renderMarkdown(msg.content) : escapeHtml(msg.content)"
        ></div>

        <!-- 打字指示器 -->
        <div v-if="isLoading" class="chat-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="chat-error">
          {{ error }}
          <button @click="retryLastMessage">重试</button>
        </div>
      </div>

      <!-- 预设问题 -->
      <div v-if="showPresets" class="chat-presets">
        <button
          v-for="preset in presets"
          :key="preset.question"
          class="preset-btn"
          @click="sendPreset(preset.question)"
        >
          {{ preset.label }}
        </button>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <textarea
          ref="inputRef"
          v-model="inputText"
          class="chat-input"
          placeholder="输入你的问题..."
          rows="1"
          @input="autoResize"
          @keydown.enter.exact.prevent="sendMessage"
        ></textarea>
        <button
          class="chat-send"
          :disabled="!inputText.trim() || isLoading"
          @click="sendMessage"
        >
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 悬浮按钮 -->
    <button class="chat-btn" @click="toggleChat">
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
      <span class="tooltip">AI助手</span>
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';

const API_ENDPOINT = 'https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages';
const API_KEY = 'tp-ck566wwq6qo6295enlcmm5ud565ej0dcaiw7i5qmw3upl3gp';
const MODEL = 'mimo-v2.5-pro';

const isOpen = ref(false);
const isLoading = ref(false);
const error = ref(null);
const inputText = ref('');
const messages = reactive([]);
const aiContext = ref(null);
const showPresets = ref(true);
const lastUserMessage = ref(null);

const messagesContainer = ref(null);
const inputRef = ref(null);

const presets = [
  { label: '推荐文章', question: '推荐一篇博客文章' },
  { label: '博客介绍', question: '介绍一下这个博客的主要内容' },
  { label: 'AI技术', question: '解释一下AI技术的基本概念' },
  { label: '学习建议', question: '有什么学习建议吗？' }
];

/**
 * 加载博客上下文
 */
async function loadContext() {
  if (aiContext.value) {
    return;
  }

  try {
    const response = await fetch('/my-blog/ai-context.json');
    if (response.ok) {
      aiContext.value = await response.json();
    }
  } catch (err) {
    console.warn('[AI Chat] Failed to load context:', err);
  }
}

/**
 * 切换聊天窗口显示
 */
function toggleChat() {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    loadContext();
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus();
      }
    });
  }
}

/**
 * 关闭聊天窗口
 */
function closeChat() {
  isOpen.value = false;
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 简单的 Markdown 渲染
 */
function renderMarkdown(text) {
  let html = escapeHtml(text);

  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code}</code></pre>`;
  });

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 粗体
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 斜体
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 换行
  html = html.replace(/\n/g, '<br>');

  return html;
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

/**
 * 获取系统提示词
 */
function getSystemPrompt() {
  let prompt = '你是AI探索笔记博客的智能助手。你可以回答关于AI技术、编程学习、博客内容等问题。请用友好、专业的语气回答。';

  if (aiContext.value && aiContext.value.length > 0) {
    prompt += '\n\n以下是博客文章摘要：\n';

    for (const post of aiContext.value) {
      prompt += `\n标题：${post.title}`;

      if (post.categories && post.categories.length > 0) {
        prompt += `\n分类：${post.categories.join(', ')}`;
      }

      if (post.tags && post.tags.length > 0) {
        prompt += `\n标签：${post.tags.join(', ')}`;
      }

      prompt += `\n摘要：${post.summary}\n`;
    }
  }

  return prompt;
}

/**
 * 调用 AI API
 */
async function callAPI(question) {
  isLoading.value = true;
  error.value = null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: getSystemPrompt(),
        messages: [{ role: 'user', content: question }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (data.content && data.content[0] && data.content[0].text) {
      messages.push({
        role: 'assistant',
        content: data.content[0].text
      });
      scrollToBottom();
    } else {
      throw new Error('未能获取到有效响应');
    }
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      error.value = '请求超时，请重试';
    } else {
      error.value = err.message || '网络错误';
    }
  } finally {
    isLoading.value = false;
  }
}

/**
 * 发送消息
 */
function sendMessage() {
  const question = inputText.value.trim();

  if (!question || isLoading.value) {
    return;
  }

  messages.push({
    role: 'user',
    content: question
  });

  lastUserMessage.value = question;
  inputText.value = '';
  showPresets.value = false;
  scrollToBottom();

  callAPI(question);
}

/**
 * 发送预设问题
 */
function sendPreset(question) {
  inputText.value = question;
  sendMessage();
}

/**
 * 重试上一条消息
 */
function retryLastMessage() {
  if (lastUserMessage.value) {
    error.value = null;
    callAPI(lastUserMessage.value);
  }
}

/**
 * 自动调整输入框高度
 */
function autoResize() {
  if (!inputRef.value) {
    return;
  }

  inputRef.value.style.height = 'auto';
  inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 100) + 'px';
}

/**
 * 处理键盘事件
 */
function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    closeChat();
  }
}

/**
 * 处理点击外部关闭
 */
function handleClickOutside(e) {
  if (isOpen.value) {
    const widget = document.querySelector('.ai-chat-widget');
    if (widget && !widget.contains(e.target)) {
      closeChat();
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.ai-chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9998;
  font-family: 'Sora', sans-serif;
}

.chat-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  animation: chatPulse 3s ease infinite;
}

.chat-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(0, 240, 255, 0.4);
}

.chat-btn svg {
  width: 28px;
  height: 28px;
  fill: white;
}

.chat-btn .tooltip {
  position: absolute;
  right: 70px;
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
}

.chat-btn:hover .tooltip {
  opacity: 1;
}

@keyframes chatPulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
  }
  50% {
    box-shadow: 0 4px 30px rgba(0, 240, 255, 0.5);
  }
}

.chat-window {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 380px;
  height: 520px;
  background: #0d1117;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: chatWindowOpen 0.3s ease;
}

@keyframes chatWindowOpen {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chat-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #00f0ff;
  border-radius: 50%;
  animation: chatPulse 2s ease infinite;
}

.chat-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  transition: color 0.2s;
}

.chat-close:hover {
  color: #e2e8f0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 2px;
}

.chat-msg {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.chat-msg.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-msg.assistant {
  align-self: flex-start;
  background: #1e293b;
  color: #e2e8f0;
  border-bottom-left-radius: 4px;
}

.chat-msg.assistant :deep(code) {
  background: #0d1117;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.chat-msg.assistant :deep(pre) {
  background: #0d1117;
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
  overflow-x: auto;
}

.chat-msg.assistant :deep(pre code) {
  background: none;
  padding: 0;
}

.chat-typing {
  align-self: flex-start;
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.chat-typing span {
  width: 8px;
  height: 8px;
  background: #64748b;
  border-radius: 50%;
  animation: typingDot 1.4s ease infinite;
}

.chat-typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.chat-typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.chat-error {
  align-self: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}

.chat-error button {
  background: rgba(239, 68, 68, 0.2);
  border: none;
  color: #fca5a5;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 8px;
  font-size: 12px;
}

.chat-presets {
  padding: 8px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preset-btn {
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.15);
  color: #00f0ff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Sora', sans-serif;
}

.preset-btn:hover {
  background: rgba(0, 240, 255, 0.15);
  border-color: rgba(0, 240, 255, 0.3);
}

.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  background: #111827;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 12px;
  padding: 10px 14px;
  color: #e2e8f0;
  font-size: 14px;
  font-family: 'Sora', sans-serif;
  resize: none;
  max-height: 100px;
  outline: none;
  transition: border-color 0.3s;
}

.chat-input:focus {
  border-color: rgba(0, 240, 255, 0.4);
}

.chat-input::placeholder {
  color: #64748b;
}

.chat-send {
  background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-send:hover {
  transform: scale(1.05);
}

.chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.chat-send svg {
  width: 18px;
  height: 18px;
  fill: white;
}

@media (max-width: 767px) {
  .ai-chat-widget {
    bottom: 16px;
    right: 16px;
  }

  .chat-btn {
    width: 48px;
    height: 48px;
  }

  .chat-btn svg {
    width: 24px;
    height: 24px;
  }

  .chat-window {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    bottom: 70px;
    right: -8px;
  }
}
</style>
