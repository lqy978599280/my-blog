---
title: "实战：AI + 代码生成PPT——上传背景图，输入提示词，一键出稿"
date: 2026-05-29 10:00:00
tags:
  - PPT
  - PptxGenJS
  - AI
  - 小米大模型
  - Vue3
categories:
  - 技术实践
---

## 前言

之前我写过两篇关于用代码生成PPT的文章，分别是 [用代码生成PPT](/2026/05/25/create-ppt-from-template/) 和 [背景图模板转PPT](/2026/05/28/ppt-background-template-outline-to-ppt/)。但这两篇文章的方案都需要手动编写代码，对于非技术人员来说门槛太高。

于是我就想：**能不能做一个更智能的工具？** 用户只需要：
1. 上传一张背景图（比如公司模板截图）
2. 输入简单的提示词（比如"帮我生成一个转正答辩PPT"）
3. 点击生成，AI 自动排版、自动填充内容、自动输出 PPT

这篇文章就记录了我把这个想法落地的完整过程——在博客中集成一个 AI PPT 生成器模块。

---

## 方案设计

### 技术栈选择

| 组件 | 方案 | 理由 |
|------|------|------|
| AI 大模型 | 小米 mimo-v2.5 | 已在博客中集成，API 兼容 Anthropic 格式 |
| PPT 生成 | PptxGenJS | 前端直出，无需后端，已有依赖 |
| 前端框架 | Vue 3 + Vite | 复用现有博客架构，组件化开发 |
| 图片处理 | Canvas API | 浏览器原生，无需额外依赖 |

### 核心架构

整个流程分三步：

```
用户上传背景图 + 输入提示词
        ↓
AI 大模型生成布局 JSON
        ↓
PptxGenJS 渲染 PPT → 浏览器下载
```

关键设计决策：**让 AI 输出结构化 JSON，而不是直接生成 PPT 代码**。这样做的好处是：
- AI 只需要输出简单的数据格式，不需要了解 PptxGenJS 的 API
- JSON 数据可以做校验、容错、修正
- 渲染逻辑和 AI 逻辑解耦，各自独立演进

---

## 实战：核心代码实现

### 1. 图片处理：保留高质量原图

用户上传的图片有两个用途：
- **背景图**：需要高质量，不能压缩
- **UI 预览**：只需要小缩略图

所以处理逻辑是：**生成两份图片数据**

```javascript
function compressImage(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        // 高质量背景图（限制最大分辨率，避免PPT太大）
        var bgCanvas = document.createElement('canvas');
        var bgWidth = Math.min(img.width, 1920);
        var bgHeight = Math.min(img.height, 1080);
        bgCanvas.width = bgWidth;
        bgCanvas.height = bgHeight;
        bgCanvas.getContext('2d').drawImage(img, 0, 0, bgWidth, bgHeight);
        var fullQuality = bgCanvas.toDataURL('image/png'); // PNG无损

        // 缩略图（用于UI预览）
        var thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 200;
        thumbCanvas.height = 150;
        thumbCanvas.getContext('2d').drawImage(img, 0, 0, 200, 150);
        var thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.8);

        resolve({
          fullQuality: fullQuality.split(',')[1],
          thumbnail: thumbnail,
          name: file.name
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```

### 2. AI Prompt：让模型输出 JSON

这一步是最关键的——设计一个合适的 system prompt，让 AI 输出符合 PptxGenJS 要求的 JSON 格式。

经过多次调试，最终的 prompt 如下：

```javascript
var SYSTEM_PROMPT = [
  '你是一个PPT设计师。根据用户要求，直接输出一个JSON对象（不要markdown代码块，不要解释）。',
  '坐标单位：英寸。16:9画布=10x5.625。颜色6位hex无#号。',
  'JSON格式：{"title":"标题","theme":{"bgColor":"0F1629","cardColor":"1E293B","primaryColor":"3B82F6"},"slides":[{"background":"0F1629","elements":[{"type":"title","text":"...","x":0.5,"y":0.3,"w":9,"h":0.7,"fontSize":32,"color":"FFFFFF","bold":true},{"type":"bullet","items":["要点1","要点2"],"x":0.8,"y":2,"w":3.6,"h":2.5,"fontSize":14,"color":"CBD5E1"}]}]}',
  '元素类型：title(大标题),text(正文),bullet(列表items数组),shape(形状),card(卡片+左侧彩条)',
  '要求：第一页封面，最后一页总结，内容页加页码，卡片左侧加彩条。'
].join('\n');
```

### 3. JSON 解析：三层容错策略

AI 返回的内容可能不规范，需要做容错处理：

```javascript
function parseSlideJson(rawText) {
  // 策略1：直接解析
  try {
    return JSON.parse(rawText);
  } catch (e) { /* 继续 */ }

  // 策略2：提取markdown代码块中的JSON
  var fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (e) { /* 继续 */ }
  }

  // 策略3：查找第一个{到最后一个}之间的内容
  var firstBrace = rawText.indexOf('{');
  var lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
    } catch (e) { /* 继续 */ }
  }

  throw new Error('AI返回的格式无效');
}
```

### 4. PPT 渲染：JSON 转实际幻灯片

拿到 AI 生成的 JSON 后，用 PptxGenJS 渲染成 PPT：

```javascript
function generatePpt(slideData, backgroundImageBase64) {
  var pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  for (var i = 0; i < slideData.slides.length; i++) {
    var slide = pres.addSlide();

    // 如果有背景图，应用为背景；否则用纯色
    if (backgroundImageBase64) {
      slide.background = { data: 'image/png;base64,' + backgroundImageBase64 };
    } else {
      slide.background = { color: slideData.theme.bgColor };
    }

    // 遍历元素，按类型渲染
    for (var j = 0; j < slideData.slides[i].elements.length; j++) {
      var el = slideData.slides[i].elements[j];
      renderElement(slide, el);
    }
  }

  return pres.write({ outputType: 'blob' });
}
```

---

## 踩坑经验：几个关键问题

### 问题 1：模型 thinking 内容过长

**现象**：API 返回 `stop_reason: "max_tokens"`，没有实际的 JSON 内容。

**原因**：小米 mimo-v2.5 模型会先输出一段很长的 thinking（思考过程），然后才输出 JSON。当 thinking 太长时，4096 tokens 全被 thinking 占用了。

**解决**：
1. 简化 system prompt（从 65 行减到 5 行）
2. 增加 max_tokens 到 16384
3. 在响应解析中，从 thinking 内容里提取 JSON

### 问题 2：背景图被压缩变糊

**现象**：上传的高清背景图在 PPT 中变得模糊。

**原因**：初始设计中，图片被压缩到 500KB 以内用于 API 调用，质量降到了 20%。

**解决**：保留两份图片数据：
- 高质量版（PNG，最大 1920x1080）用于 PPT 背景
- 缩略图用于 UI 预览

### 问题 3：模型不支持图片理解

**现象**：想让 AI 分析模板图片的风格，但 mimo-v2.5-pro 不支持 vision。

**解决**：改为纯文字驱动——用户通过提示词描述风格需求，AI 生成布局后，背景图只是作为视觉装饰，不影响内容生成。

### 问题 4：Vue 组件注入时机

**现象**：新建的组件在页面上看不到。

**原因**：`hexo clean` 会清除 `public` 目录，需要重新执行完整的构建流程：`vite:build → hexo generate → inject-custom.js`。

**解决**：用 `pnpm build` 一键执行全部流程。

---

## 效果展示

### 上传背景图

用户可以上传任意图片作为 PPT 背景，支持 PNG、JPG、WebP 格式。

### 输入提示词

只需要输入简单的描述，比如：
- "帮我生成一个转正答辩PPT，5页"
- "做一个关于AI技术趋势的演示文稿"
- "创建一个项目汇报PPT，包含技术架构和成果展示"

### 生成结果

点击生成后，AI 会自动：
1. 分析提示词，规划页面结构
2. 设计每页的布局（标题、正文、列表、装饰）
3. 输出结构化 JSON
4. 渲染成 PPT 文件供下载

---

## 总结

这次实战的核心流程就一句话：

```
上传背景图 → 输入提示词 → AI生成JSON → 代码渲染PPT
```

关键技术点：

| 技术点 | 方案 | 难度 |
|--------|------|------|
| 图片处理 | Canvas API，保留高质量原图 | 低 |
| AI 调用 | 小米 mimo-v2.5，兼容 Anthropic 格式 | 中 |
| JSON 解析 | 三层容错策略（直接解析/代码块提取/首尾花括号） | 中 |
| PPT 渲染 | PptxGenJS 浏览器端直出 Blob | 低 |
| 组件集成 | Vue 3 独立 app 实例，动态挂载 | 低 |

**最大的教训**：AI 模型的输出不可控——thinking 过长、JSON 格式不规范、返回内容类型不一致。所以**容错处理**是这个方案的核心，不能假设 AI 一定会返回正确格式的数据。

---

## 参考资料

- [PptxGenJS 官方文档](https://gitbrent.github.io/PptxGenJS/)
- [小米 mimo 大模型 API](https://token-plan-cn.xiaomimimo.com)
- [Anthropic Messages API 格式](https://docs.anthropic.com/claude/reference/messages-api)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
