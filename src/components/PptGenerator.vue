<template>
  <div class="ppt-generator-widget">
    <!-- 悬浮触发按钮 -->
    <button class="ppt-btn" @click="togglePanel" :class="{ active: isOpen }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
      <span class="tooltip">PPT生成器</span>
    </button>

    <!-- 模态面板 -->
    <div v-if="isOpen" class="ppt-overlay" @click.self="closePanel">
      <div class="ppt-panel">
        <!-- 头部 -->
        <div class="ppt-header">
          <div class="ppt-header-title">
            <span class="status-dot"></span>
            AI PPT 生成器
          </div>
          <button class="close-btn" @click="closePanel">&times;</button>
        </div>

        <!-- 步骤指示器 -->
        <div class="step-indicator">
          <div class="step" :class="{ active: currentStep === 1, done: currentStep > 1 }">
            <span class="step-num">1</span>
            <span class="step-label">上传模板</span>
          </div>
          <div class="step-line" :class="{ done: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep === 2, done: currentStep > 2 }">
            <span class="step-num">2</span>
            <span class="step-label">输入内容</span>
          </div>
          <div class="step-line" :class="{ done: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep === 3 }">
            <span class="step-num">3</span>
            <span class="step-label">生成下载</span>
          </div>
        </div>

        <!-- Step 1: 上传模板 -->
        <div v-if="currentStep === 1" class="step-content">
          <div
            class="upload-zone"
            :class="{ dragover: isDragOver, 'has-image': templateImage }"
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

            <div v-if="!templateImage" class="upload-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="upload-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p class="upload-text">拖拽或点击上传背景图片</p>
              <p class="upload-hint">支持 PNG / JPG / WebP，图片将作为每页PPT的背景</p>
            </div>

            <div v-else class="upload-preview">
              <img :src="templateImage.thumbnail" alt="模板预览" />
              <div class="preview-info">
                <span class="preview-name">{{ templateImage.name }}</span>
                <span class="preview-size">{{ imageSize }}</span>
              </div>
              <button class="remove-btn" @click.stop="removeImage">&times;</button>
            </div>
          </div>

          <div class="step-actions">
            <button class="btn-skip" @click="skipUpload">跳过，直接输入内容</button>
            <button class="btn-next" @click="goToStep(2)" :disabled="!templateImage">
              下一步
            </button>
          </div>
        </div>

        <!-- Step 2: 输入提示词和文案 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="form-group">
            <label class="form-label">提示词 <span class="required">*</span></label>
            <textarea
              v-model="promptText"
              class="form-textarea"
              placeholder="描述你想要的PPT内容，例如：创建一个关于AI技术趋势的5页演示文稿"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">文案内容 <span class="optional">可选</span></label>
            <textarea
              v-model="contentText"
              class="form-textarea"
              placeholder="补充具体文案、要点或数据，让AI生成更精准的内容"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">页数</label>
              <select v-model="slideCount" class="form-select">
                <option :value="3">3 页</option>
                <option :value="5">5 页</option>
                <option :value="7">7 页</option>
                <option :value="10">10 页</option>
              </select>
            </div>
            <div class="form-group half">
              <label class="form-label">风格</label>
              <select v-model="stylePreset" class="form-select">
                <option value="dark-tech">深色科技</option>
                <option value="minimal-light">简约浅色</option>
                <option value="corporate-blue">商务蓝</option>
              </select>
            </div>
          </div>

          <div class="step-actions">
            <button class="btn-back" @click="goToStep(1)">上一步</button>
            <button class="btn-generate" @click="handleGenerate" :disabled="!promptText.trim() || isGenerating">
              <span v-if="isGenerating" class="spinner"></span>
              {{ isGenerating ? '生成中...' : '生成 PPT' }}
            </button>
          </div>
        </div>

        <!-- Step 3: 生成结果 -->
        <div v-if="currentStep === 3" class="step-content">
          <!-- 生成中 -->
          <div v-if="isGenerating" class="generating-state">
            <div class="generating-animation">
              <div class="pulse-ring"></div>
              <div class="pulse-ring delay"></div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="gen-icon">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <p class="generating-status">{{ generationStatus }}</p>
            <p class="generating-hint">AI正在为您设计演示文稿，请稍候...</p>
          </div>

          <!-- 生成成功 -->
          <div v-else-if="generatedBlob && !error" class="success-state">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <p class="success-title">PPT 生成成功！</p>
            <p class="success-info">共 {{ slideCount }} 页幻灯片</p>
            <button class="btn-download" @click="handleDownload">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              下载 PPT 文件
            </button>
          </div>

          <!-- 生成失败 -->
          <div v-else-if="error" class="error-state">
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
              <button class="btn-back-step" @click="goToStep(2)">返回修改</button>
            </div>
          </div>

          <!-- 底部操作 -->
          <div v-if="!isGenerating" class="step-actions">
            <button class="btn-restart" @click="handleRestart">重新开始</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useImageCompress } from '../composables/useImageCompress.js';
import { usePptGenerator } from '../composables/usePptGenerator.js';

var compressUtil = useImageCompress();
var pptUtil = usePptGenerator();

var isOpen = ref(false);
var currentStep = ref(1);
var isDragOver = ref(false);
var fileInput = ref(null);

// 上传相关
var templateImage = ref(null);
var imageSize = ref('');

// 输入相关
var promptText = ref('');
var contentText = ref('');
var slideCount = ref(5);
var stylePreset = ref('dark-tech');

// 生成相关
var isGenerating = ref(false);
var generationStatus = ref('');
var generatedBlob = ref(null);
var error = ref(null);

function togglePanel() {
  isOpen.value = !isOpen.value;
}

function closePanel() {
  isOpen.value = false;
}

function goToStep(step) {
  currentStep.value = step;
  error.value = null;
}

function triggerFileInput() {
  if (!templateImage.value && fileInput.value) {
    fileInput.value.click();
  }
}

function handleDrop(e) {
  isDragOver.value = false;
  var files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function handleFileSelect(e) {
  var files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function processFile(file) {
  if (!compressUtil.isValidImage(file)) {
    alert('请上传 PNG、JPG 或 WebP 格式的图片');
    return;
  }

  compressUtil.compressImage(file).then(function (result) {
    templateImage.value = result;
    imageSize.value = compressUtil.formatSize(Math.round(result.fullQuality.length * 0.75));
  }).catch(function (err) {
    console.error('[PPT Generator] Image compress failed:', err);
    alert('图片处理失败，请重试');
  });
}

function removeImage() {
  templateImage.value = null;
  imageSize.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function skipUpload() {
  goToStep(2);
}

function handleGenerate() {
  if (!promptText.value.trim() || isGenerating.value) return;

  isGenerating.value = true;
  error.value = null;
  generatedBlob.value = null;
  currentStep.value = 3;

  // 构建风格提示
  var styleHint = pptUtil.getStyleHint(stylePreset.value);
  var fullPrompt = promptText.value + '\n\nStyle guidance: ' + styleHint;

  pptUtil.callAiApi(
    fullPrompt,
    contentText.value,
    !!templateImage.value,
    slideCount.value,
    stylePreset.value,
    function (status) { generationStatus.value = status; }
  )
  .then(function (rawText) {
    generationStatus.value = '正在解析布局...';
    var slideData = pptUtil.parseSlideJson(rawText);
    slideData = pptUtil.validateSlideJson(slideData);

    generationStatus.value = '正在构建PPT...';
    return pptUtil.generatePpt(
      slideData,
      templateImage.value ? templateImage.value.fullQuality : null,
      function (status) { generationStatus.value = status; }
    );
  })
  .then(function (blob) {
    generatedBlob.value = blob;
    isGenerating.value = false;
    generationStatus.value = '';
  })
  .catch(function (err) {
    console.error('[PPT Generator] Generation failed:', err);
    error.value = err.message || '生成失败，请重试';
    isGenerating.value = false;
    generationStatus.value = '';
  });
}

function handleDownload() {
  if (generatedBlob.value) {
    pptUtil.downloadPpt(generatedBlob.value, 'ai-generated.pptx');
  }
}

function handleRestart() {
  currentStep.value = 1;
  templateImage.value = null;
  imageSize.value = '';
  promptText.value = '';
  contentText.value = '';
  slideCount.value = 5;
  stylePreset.value = 'dark-tech';
  isGenerating.value = false;
  generationStatus.value = '';
  generatedBlob.value = null;
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
.ppt-btn {
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 9996;
  animation: pptPulse 3s ease infinite;
}

.ppt-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(0, 240, 255, 0.4);
}

.ppt-btn.active {
  animation: none;
}

.ppt-btn svg {
  width: 24px;
  height: 24px;
}

.ppt-btn .tooltip {
  position: absolute;
  left: 70px;
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

.ppt-btn:hover .tooltip {
  opacity: 1;
}

@keyframes pptPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3); }
  50% { box-shadow: 0 4px 30px rgba(0, 240, 255, 0.5); }
}

/* 模态面板 */
.ppt-overlay {
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

.ppt-panel {
  width: 480px;
  max-height: 85vh;
  background: #0d1117;
  border: 1px solid rgba(0, 240, 255, 0.15);
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
.ppt-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ppt-header-title {
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
  background: #00f0ff;
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

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  gap: 0;
}

.step {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.step.active, .step.done {
  opacity: 1;
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1e293b;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.step.active .step-num {
  background: linear-gradient(135deg, #00f0ff, #0080ff);
  color: white;
}

.step.done .step-num {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #64748b;
  font-family: 'Sora', sans-serif;
}

.step.active .step-label {
  color: #e2e8f0;
}

.step-line {
  width: 40px;
  height: 2px;
  background: #1e293b;
  margin: 0 8px;
  transition: background 0.3s;
}

.step-line.done {
  background: #10b981;
}

/* 步骤内容 */
.step-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 300px;
}

/* 上传区域 */
.upload-zone {
  border: 2px dashed rgba(0, 240, 255, 0.3);
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 240, 255, 0.02);
}

.upload-zone:hover, .upload-zone.dragover {
  border-color: rgba(0, 240, 255, 0.6);
  background: rgba(0, 240, 255, 0.05);
}

.upload-zone.has-image {
  padding: 16px;
  cursor: default;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #00f0ff;
  opacity: 0.6;
}

.upload-text {
  font-size: 15px;
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
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.preview-info {
  flex: 1;
  text-align: left;
}

.preview-name {
  display: block;
  font-size: 13px;
  color: #e2e8f0;
  margin-bottom: 4px;
  word-break: break-all;
}

.preview-size {
  font-size: 12px;
  color: #64748b;
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

.form-group.half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 12px;
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

.optional {
  color: #64748b;
  font-size: 11px;
}

.form-textarea {
  width: 100%;
  background: #111827;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  color: #e2e8f0;
  font-size: 13px;
  font-family: 'Sora', sans-serif;
  resize: vertical;
  min-height: 60px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: rgba(0, 240, 255, 0.4);
}

.form-textarea::placeholder {
  color: #4a5568;
}

.form-select {
  width: 100%;
  background: #111827;
  border: 1px solid rgba(0, 240, 255, 0.15);
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
  border-color: rgba(0, 240, 255, 0.4);
}

/* 按钮 */
.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.08);
}

.btn-skip {
  background: none;
  border: none;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 16px;
  font-family: 'Sora', sans-serif;
  transition: color 0.2s;
}

.btn-skip:hover {
  color: #e2e8f0;
}

.btn-back, .btn-back-step {
  background: #1e293b;
  border: 1px solid rgba(0, 240, 255, 0.15);
  color: #e2e8f0;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  transition: all 0.2s;
}

.btn-back:hover, .btn-back-step:hover {
  background: #334155;
}

.btn-next, .btn-generate, .btn-retry {
  background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);
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

.btn-next:hover, .btn-generate:hover, .btn-retry:hover {
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
}

.btn-next:disabled, .btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-restart {
  background: none;
  border: 1px solid rgba(0, 240, 255, 0.15);
  color: #64748b;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  transition: all 0.2s;
  margin-right: auto;
}

.btn-restart:hover {
  color: #e2e8f0;
  border-color: rgba(0, 240, 255, 0.3);
}

/* 生成中状态 */
.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
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
  border: 2px solid rgba(0, 240, 255, 0.3);
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
  color: #00f0ff;
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
  padding: 32px 0;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.success-icon svg {
  width: 32px;
  height: 32px;
  color: #10b981;
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
  margin: 0 0 24px;
}

.btn-download {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 15px;
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

/* 生成失败 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
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
.step-content::-webkit-scrollbar {
  width: 4px;
}

.step-content::-webkit-scrollbar-track {
  background: transparent;
}

.step-content::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .ppt-btn {
    width: 44px;
    height: 44px;
    bottom: 16px;
    left: 16px;
  }

  .ppt-btn svg {
    width: 20px;
    height: 20px;
  }

  .ppt-panel {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 48px);
  }

  .step-label {
    display: none;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
