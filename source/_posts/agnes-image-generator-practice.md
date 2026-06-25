---
title: "实战：接入Agnes Image 2.1 Flash，给博客加上AI图片生成能力"
date: 2026-06-25 15:00:00
tags:
  - AI
  - 图片生成
  - Agnes AI
  - Vue3
categories:
  - AI实战
---

## 前言

之前我的博客已经集成了两个 AI 功能——聊天助手和 PPT 生成器。最近我发现了一个免费的 AI 图片生成服务：**Agnes AI**，它提供了 Agnes Image 2.1 Flash 模型，支持文生图和图生图，而且**完全免费使用**。

于是我就想：**能不能把这个模型也接入博客？** 这样博客就有了完整的 AI 三件套——聊天、PPT、图片生成。

这篇文章记录了从 API 调研到组件上线的完整过程。

---

## Agnes Image 2.1 Flash 模型介绍

### 模型能力

Agnes Image 2.1 Flash 是 Sapiens AI 推出的图像生成模型，支持文生图和图生图两种工作流。相比之前的版本，它在高信息密度图像生成方面做了优化，适合复杂视觉细节和丰富构图的场景。

| 能力 | 说明 |
|------|------|
| 文生图 | 根据自然语言提示词生成高质量图片 |
| 图生图 | 根据提示词对已有图片进行风格转换、局部优化、场景重塑 |
| 灵活尺寸 | 支持 1024x1024、1024x1792、1792x1024 |
| 多种返回格式 | 支持 URL 和 Base64 两种输出方式 |

### API 信息

| 项目 | 说明 |
|------|------|
| API Endpoint | `https://apihub.agnes-ai.com/v1/images/generations` |
| 请求方法 | POST |
| 认证方式 | Bearer Token |
| 模型名 | `agnes-image-2.1-flash` |
| 价格 | 免费 |

---

## 方案设计

### 技术选型

| 组件 | 方案 | 理由 |
|------|------|------|
| AI 模型 | Agnes Image 2.1 Flash | 完全免费，API 兼容 OpenAI 格式 |
| 前端框架 | Vue 3 + Vite | 复用现有博客架构 |
| 图片下载 | fetch + Blob + ObjectURL | 解决跨域下载问题 |

### 核心流程

```
用户输入提示词（+ 可选参考图）
        ↓
调用 Agnes Image API
        ↓
返回图片 URL → 前端展示 + 下载
```

### 关键设计决策

**1. 使用 URL 模式而非 Base64**

API 支持两种返回格式：URL 和 Base64。选择 URL 模式的原因是：
- 响应体积小（Base64 会让 JSON 体积膨胀约 33%）
- 图片可直接用 `<img>` 标签加载
- 下载时通过 fetch blob 转换，兼容性更好

**2. `response_format` 必须放在 `extra_body` 中**

这是 Agnes API 的一个重要注意事项：`response_format` 不能放在请求体顶层，否则会返回 400 错误。正确的做法是放在 `extra_body` 对象中。

---

## 实战：核心代码实现

### 1. Composable：API 调用逻辑

创建 `src/composables/useImageGenerator.js`，遵循项目中非响应式 composable 的模式——导出纯函数集，状态由组件管理。

```javascript
var API_ENDPOINT = 'https://apihub.agnes-ai.com/v1/images/generations';
var API_KEY = 'sk-xxx'; // 你的 API Key
var MODEL = 'agnes-image-2.1-flash';

function callTextToImageApi(prompt, size, onStatus) {
  var controller = new AbortController();
  var timeoutId = setTimeout(function () {
    controller.abort();
  }, 180000); // 180秒超时

  if (onStatus) {
    onStatus('正在生成图片...');
  }

  var requestBody = {
    model: MODEL,
    prompt: prompt,
    size: size,
    extra_body: {
      response_format: 'url' // 注意：不能放在顶层
    }
  };

  return fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY
    },
    body: JSON.stringify(requestBody),
    signal: controller.signal
  })
  .then(function (response) {
    clearTimeout(timeoutId);
    if (!response.ok) {
      return response.json().then(function (errData) {
        throw new Error(errData.message || 'API请求失败: ' + response.status);
      });
    }
    return response.json();
  })
  .then(function (data) {
    if (!data || !data.data || !data.data[0]) {
      throw new Error('无效的API响应');
    }
    return data.data[0]; // { url: "..." }
  })
  .catch(function (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('请求超时（180秒），请重试');
    }
    throw err;
  });
}
```

图生图的调用方式类似，区别在于 `extra_body` 中多了 `image` 数组：

```javascript
var requestBody = {
  model: MODEL,
  prompt: prompt,
  size: size,
  extra_body: {
    response_format: 'url',
    image: [imageInput] // 图片 URL 或 Data URI Base64
  }
};
```

### 2. 图片下载：Blob 方案解决跨域问题

直接用 `<a download>` 下载跨域图片会失败。解决方案是先 fetch 获取 Blob，再创建 ObjectURL 下载：

```javascript
function downloadImageViaBlob(imageUrl, filename) {
  return fetch(imageUrl, { mode: 'cors' })
    .then(function (response) {
      return response.blob();
    })
    .then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename || 'ai-generated-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(function () {
      // 跨域失败时 fallback 到新标签页打开
      window.open(imageUrl, '_blank');
    });
}
```

### 3. Vue 组件：模式切换面板

组件采用模式切换（文生图/图生图）而非步骤式的交互，因为图片生成的流程比 PPT 简单得多——不需要上传模板、选择页数等复杂配置。

核心状态设计：

```javascript
var isOpen = ref(false);
var mode = ref('text');          // 'text' 或 'image'
var promptText = ref('');
var selectedSize = ref('1024x1024');
var isGenerating = ref(false);
var generatedImage = ref(null);  // { url: '...' }
var error = ref(null);
var referenceImage = ref(null);  // 图生图的参考图
```

图生图模式下的文件上传，用 FileReader 转为 Data URI：

```javascript
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
```

### 4. 悬浮按钮位置协调

博客右下角已经有两个悬浮按钮了，需要合理安排位置：

| 按钮 | 位置 | z-index |
|------|------|---------|
| AiChat | `bottom: 24px, right: 24px` | 9998 |
| BackToTop | `bottom: 96px, right: 24px` | 9997 |
| **ImageGenerator** | **`bottom: 168px, right: 24px`** | **9995** |
| PptGenerator | `bottom: 24px, left: 24px` | 9996 |

三个右下角按钮形成垂直排列，间距均为 72px（按钮 56px + 间距 16px）。

为了让用户在视觉上区分不同功能，图片生成器使用**紫色渐变**（#a855f7 → #6366f1），而不是和其他组件一样的青蓝渐变。

---

## 踩坑经验

### 问题 1：API Endpoint 找不到

**现象**：一开始我尝试了 `api.agnes-ai.com` 的各种路径（`/v1/models`、`/v1/images/generations` 等），全部返回 `route not found`。

**原因**：Agnes AI 的实际 API 地址是 `apihub.agnes-ai.com`，而不是 `api.agnes-ai.com`。两个域名都能解析，但只有 `apihub` 是正确的 API 网关。

**解决**：使用 `apihub.agnes-ai.com` 作为 Base URL。

### 问题 2：response_format 放在顶层导致 400 错误

**现象**：按照 OpenAI 的标准格式把 `response_format` 放在请求体顶层，API 返回 400 错误。

**原因**：Agnes API 要求 `response_format` 放在 `extra_body` 对象中，而不是请求体顶层。

**解决**：
```javascript
// 错误
{
  "model": "agnes-image-2.1-flash",
  "prompt": "A futuristic city",
  "size": "1024x1024",
  "response_format": "url" // ← 不要放这里
}

// 正确
{
  "model": "agnes-image-2.1-flash",
  "prompt": "A futuristic city",
  "size": "1024x1024",
  "extra_body": {
    "response_format": "url" // ← 放这里
  }
}
```

### 问题 3：图片下载跨域问题

**现象**：生成的图片 URL 直接用 `<a download>` 下载时，浏览器会打开新标签页而不是下载。

**原因**：跨域图片的 `<a download>` 属性被浏览器忽略。

**解决**：先用 fetch 获取图片 Blob，再创建 ObjectURL 进行下载。fetch 失败时 fallback 到 `window.open()` 新标签页打开。

---

## 效果展示

### 文生图模式

输入提示词，选择尺寸，点击生成：

> "一座漂浮在峡谷上方的发光城市，日出时分，电影级写实风格，广角构图"

### 图生图模式

上传参考图 + 输入修改描述：

> "将场景转换为赛博朋克雨夜风格，添加霓虹灯和潮湿路面反射，保留原始构图"

---

## 总结

这次实战的核心流程就一句话：

```
输入提示词 → 调用 Agnes Image API → 展示图片 → 下载
```

关键技术点：

| 技术点 | 方案 | 难度 |
|--------|------|------|
| API 调用 | fetch + AbortController，180秒超时 | 低 |
| 跨域下载 | fetch blob → ObjectURL → `<a>` click | 低 |
| 图生图上传 | FileReader.readAsDataURL 转 Data URI | 低 |
| 位置协调 | 右下角垂直排列，紫色渐变区分 | 低 |
| 参数格式 | `response_format` 必须放 `extra_body` | 中 |

**最大的收获**：Agnes AI 的 API 整体兼容 OpenAI 格式，文档清晰，响应速度快。对于需要在前端集成 AI 图片生成功能的场景，这是一个不错的免费选择。

---

## 参考资料

- [Agnes AI 官网](https://agnes-ai.com)
- [Agnes Image 2.1 Flash API 文档](https://agnes-ai.com/docs)
- [Fetch API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
- [URL.createObjectURL() - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
