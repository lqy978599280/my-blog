<template>
  <div class="img-generator-widget">
    <!-- 悬浮触发按钮 -->
    <button class="img-btn" @click="togglePanel" :class="{ active: isOpen }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <span class="tooltip">AI图片生成</span>
    </button>

    <!-- 模态面板 -->
    <div v-if="isOpen" class="img-overlay" @click.self="closePanel">
      <div class="img-panel">
        <!-- 头部 -->
        <div class="img-header">
          <div class="img-header-title">
            <span class="status-dot"></span>
            AI 图片生成器
          </div>
          <button class="close-btn" @click="closePanel">&times;</button>
        </div>

        <!-- 模式切换标签 -->
        <div class="mode-tabs">
          <button
            class="mode-tab"
            :class="{ active: mode === 'text' }"
            @click="switchMode('text')"
          >
            文生图
          </button>
          <button
            class="mode-tab"
            :class="{ active: mode === 'image' }"
            @click="switchMode('image')"
          >
            图生图
          </button>
        </div>

        <!-- 输入区域 -->
        <div v-if="!isGenerating && !generatedImage && !error" class="input-area">
          <!-- 图生图模式：上传区域 -->
          <div v-if="mode === 'image'" class="upload-section">
            <div
              class="upload-zone"
              :class="{ dragover: isDragOver, 'has-image': referenceImage }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                @change="handleFileSelect"
                style="display: none"
              />

              <div v-if="!referenceImage" class="upload-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="upload-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p class="upload-text">拖拽或点击上传参考图片</p>
                <p class="upload-hint">支持 PNG / JPG / WebP，图片将作为风格参考</p>
              </div>

              <div v-else class="upload-preview">
                <img :src="referenceImage.thumbnail" alt="参考图预览" />
                <div class="preview-info">
                  <span class="preview-name">{{ referenceImage.name }}</span>
                </div>
                <button class="remove-btn" @click.stop="removeReference">&times;</button>
              </div>
            </div>
          </div>

          <!-- 提示词 -->
          <div class="form-group">
            <label class="form-label">
              提示词 <span class="required">*</span>
            </label>
            <textarea
              v-model="promptText"
              class="form-textarea"
              :placeholder="mode === 'text' ? '描述你想要的图片，例如：一座漂浮在峡谷上方的发光城市，电影级写实风格' : '描述基于参考图的修改方向，例如：将场景转换为赛博朋克雨夜风格，保留原始构图'"
              rows="4"
            ></textarea>
          </div>

          <!-- 尺寸选择 -->
          <div class="form-group">
            <label class="form-label">图片尺寸</label>
            <select v-model="selectedSize" class="form-select">
              <option v-for="opt in sizeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- 生成按钮 -->
          <div class="input-actions">
            <button
              class="btn-generate"
              @click="handleGenerate"
              :disabled="!canGenerate"
            >
              <span v-if="isGenerating" class="spinner"></span>
              {{ isGenerating ? '生成中...' : '生成图片' }}
            </button>
          </div>
        </div>

        <!-- 生成中 -->
        <div v-if="isGenerating" class="generating-state">
          <div class="generating-animation">
            <div class="pulse-ring"></div>
            <div class="pulse-ring delay"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="gen-icon">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <p class="generating-status">{{ generationStatus }}</p>
          <p class="generating-hint">AI 正在为您创作图片，通常需要 10-30 秒...</p>
        </div>

        <!-- 生成成功 -->
        <div v-if="generatedImage && !isGenerating && !error" class="success-state">
          <div class="image-preview-wrapper">
            <img :src="generatedImage.url" alt="AI生成的图片" class="image-preview" />
          </div>
          <p class="success-title">图片生成成功！</p>
          <p class="success-info">{{ selectedSize }} · {{ mode === 'text' ? '文生图' : '图生图' }}</p>
          <div class="success-actions">
            <button class="btn-download" @click="handleDownload">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              下载图片
            </button>
            <button class="btn-regenerate" @click="handleRegenerate">重新生成</button>
          </div>
        </div>

        <!-- 生成失败 -->
        <div v-if="error && !isGenerating" class="error-state">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <p class="error-title">生成失败</p>
          <p class="error-message">{{ error }}</p>
          <div class="error-actions">
            <button class="btn-retry" @click="handleGenerate">重试</button>
            <button class="btn-back-edit" @click="handleBackToEdit">返回修改</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useImageGenerator } from '../composables/useImageGenerator.js';

var imageUtil = useImageGenerator();
var sizeOptions = imageUtil.SIZE_OPTIONS;

var isOpen = ref(false);
var mode = ref('text');
var promptText = ref('');
var selectedSize = ref('1024x1024');
var isGenerating = ref(false);
var generationStatus = ref('');
var generatedImage = ref(null);
var error = ref(null);

var isDragOver = ref(false);
var fileInput = ref(null);
var referenceImage = ref(null);

var canGenerate = computed(function () {
  if (!promptText.value.trim() || isGenerating.value) {
    return false;
  }
  if (mode.value === 'image' && !referenceImage.value) {
    return false;
  }
  return true;
});

function togglePanel() {
  isOpen.value = !isOpen.value;
}

function closePanel() {
  isOpen.value = false;
}

function switchMode(newMode) {
  mode.value = newMode;
  error.value = null;
}

function triggerFileInput() {
  if (!referenceImage.value && fileInput.value) {
    fileInput.value.click();
  }
}

function handleDrop(e) {
  isDragOver.value = false;
  var files = e.dataTransfer.files;
  if (files.length > 0) {
    processReferenceFile(files[0]);
  }
}

function handleFileSelect(e) {
  var files = e.target.files;
  if (files.length > 0) {
    processReferenceFile(files[0]);
  }
}

function processReferenceFile(file) {
  var validTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('请上传 PNG、JPG 或 WebP 格式的图片');
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    referenceImage.value = {
      dataUri: e.target.result,
      name: file.name,
      thumbnail: e.target.result
    };
  };
  reader.readAsDataURL(file);
}

function removeReference() {
  referenceImage.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function handleGenerate() {
  if (!canGenerate.value) {
    return;
  }

  isGenerating.value = true;
  error.value = null;
  generatedImage.value = null;

  var apiCall;

  if (mode.value === 'text') {
    apiCall = imageUtil.callTextToImageApi(
      promptText.value,
      selectedSize.value,
      function (status) {
        generationStatus.value = status;
      }
    );
  } else {
    apiCall = imageUtil.callImageToImageApi(
      promptText.value,
      selectedSize.value,
      referenceImage.value.dataUri,
      function (status) {
        generationStatus.value = status;
      }
    );
  }

  apiCall.then(function (result) {
    generatedImage.value = result;
    isGenerating.value = false;
    generationStatus.value = '';
  }).catch(function (err) {
    console.error('[Image Generator] Generation failed:', err);
    error.value = err.message || '生成失败，请重试';
    isGenerating.value = false;
    generationStatus.value = '';
  });
}

function handleDownload() {
  if (generatedImage.value && generatedImage.value.url) {
    imageUtil.downloadImageViaBlob(generatedImage.value.url, 'ai-generated-image.png');
  }
}

function handleRegenerate() {
  generatedImage.value = null;
  error.value = null;
  handleGenerate();
}

function handleBackToEdit() {
  generatedImage.value = null;
  error.value = null;
}

// ESC关闭
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && isOpen.value) {
    closePanel();
  }
});
</script>

<style scoped>
/* 悬浮按钮 */
.img-btn {
  position: fixed;
  bottom: 168px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
  transition: all 0.3s ease;
  z-index: 9995;
  animation: imgPulse 3s ease infinite;
}

.img-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(168, 85, 247, 0.4);
}

.img-btn.active {
  animation: none;
}

.img-btn svg {
  width: 24px;
  height: 24px;
}

.img-btn .tooltip {
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

.img-btn:hover .tooltip {
  opacity: 1;
}

@keyframes imgPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3); }
  50% { box-shadow: 0 4px 30px rgba(168, 85, 247, 0.5); }
}

/* 模态面板 */
.img-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.img-panel {
  width: 520px;
  max-height: 85vh;
  background: #0d1117;
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* 头部 */
.img-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(168, 85, 247, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.img-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Sora', sans-serif;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #a855f7;
  border-radius: 50%;
  animation: chatPulse 2s ease infinite;
}

@keyframes chatPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #e2e8f0;
}

/* 模式切换标签 */
.mode-tabs {
  display: flex;
  padding: 12px 20px;
  gap: 8px;
}

.mode-tab {
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.15);
  background: #1e293b;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Sora', sans-serif;
}

.mode-tab.active {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: white;
  border-color: transparent;
}

.mode-tab:hover:not(.active) {
  color: #e2e8f0;
  border-color: rgba(168, 85, 247, 0.3);
}

/* 输入区域 */
.input-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 上传区域 */
.upload-section {
  margin-bottom: 16px;
}

.upload-zone {
  border: 2px dashed rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 24px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(168, 85, 247, 0.02);
}

.upload-zone:hover, .upload-zone.dragover {
  border-color: rgba(168, 85, 247, 0.6);
  background: rgba(168, 85, 247, 0.05);
}

.upload-zone.has-image {
  padding: 16px;
  cursor: default;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  width: 40px;
  height: 40px;
  color: #a855f7;
  opacity: 0.6;
}

.upload-text {
  font-size: 14px;
  color: #e2e8f0;
  margin: 0;
  font-family: 'Sora', sans-serif;
}

.upload-hint {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.upload-preview {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-preview img {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.15);
}

.preview-info {
  flex: 1;
  text-align: left;
}

.preview-name {
  display: block;
  font-size: 13px;
  color: #e2e8f0;
  word-break: break-all;
}

.remove-btn {
  background: rgba(239, 68, 68, 0.2);
  border: none;
  color: #ef4444;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.4);
}

/* 表单 */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #e2e8f0;
  margin-bottom: 6px;
  font-family: 'Sora', sans-serif;
}

.required {
  color: #ef4444;
}

.form-textarea {
  width: 100%;
  background: #111827;
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  color: #e2e8f0;
  font-size: 13px;
  font-family: 'Sora', sans-serif;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.4);
}

.form-textarea::placeholder {
  color: #4a5568;
}

.form-select {
  width: 100%;
  background: #111827;
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 8px;
  padding: 8px 12px;
  color: #e2e8f0;
  font-size: 13px;
  font-family: 'Sora', sans-serif;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.form-select:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.4);
}

/* 生成按钮 */
.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(168, 85, 247, 0.08);
}

.btn-generate {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border: none;
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-generate:hover {
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 生成中状态 */
.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  flex: 1;
}

.generating-animation {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(168, 85, 247, 0.3);
  animation: pulseExpand 2s ease-out infinite;
}

.pulse-ring.delay {
  animation-delay: 0.5s;
}

@keyframes pulseExpand {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.gen-icon {
  width: 32px;
  height: 32px;
  color: #a855f7;
  z-index: 1;
}

.generating-status {
  font-size: 15px;
  color: #e2e8f0;
  margin: 16px 0 8px;
  font-family: 'Sora', sans-serif;
}

.generating-hint {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* 生成成功 */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.image-preview-wrapper {
  width: 100%;
  max-height: 300px;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.15);
}

.success-title {
  font-size: 18px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 8px;
  font-family: 'Sora', sans-serif;
}

.success-info {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 20px;
}

.success-actions {
  display: flex;
  gap: 12px;
}

.btn-download {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-download:hover {
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.btn-download svg {
  width: 18px;
  height: 18px;
}

.btn-regenerate {
  background: #1e293b;
  border: 1px solid rgba(168, 85, 247, 0.15);
  color: #e2e8f0;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  transition: all 0.2s;
}

.btn-regenerate:hover {
  background: #334155;
  border-color: rgba(168, 85, 247, 0.3);
}

/* 生成失败 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  flex: 1;
}

.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.error-icon svg {
  width: 32px;
  height: 32px;
  color: #ef4444;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 8px;
  font-family: 'Sora', sans-serif;
}

.error-message {
  font-size: 13px;
  color: #ef4444;
  margin: 0 0 24px;
  text-align: center;
  max-width: 300px;
}

.error-actions {
  display: flex;
  gap: 12px;
}

.btn-retry {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border: none;
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  transition: all 0.2s;
}

.btn-retry:hover {
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
}

.btn-back-edit {
  background: #1e293b;
  border: 1px solid rgba(168, 85, 247, 0.15);
  color: #e2e8f0;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  transition: all 0.2s;
}

.btn-back-edit:hover {
  background: #334155;
}

/* 加载动画 */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 滚动条 */
.input-area::-webkit-scrollbar,
.success-state::-webkit-scrollbar {
  width: 4px;
}

.input-area::-webkit-scrollbar-track,
.success-state::-webkit-scrollbar-track {
  background: transparent;
}

.input-area::-webkit-scrollbar-thumb,
.success-state::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .img-btn {
    width: 48px;
    height: 48px;
    bottom: 144px;
    right: 16px;
  }

  .img-btn svg {
    width: 20px;
    height: 20px;
  }

  .img-panel {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 48px);
  }

  .mode-tab {
    padding: 6px 12px;
    font-size: 12px;
  }

  .image-preview-wrapper {
    max-height: 200px;
  }

  .image-preview {
    max-height: 200px;
  }
}
</style>
