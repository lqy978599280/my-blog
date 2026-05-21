---
title: AI 实战：给博客装上智能助手——小米大模型集成全记录
date: 2026-05-21 10:00:00
tags:
  - AI
  - 小米大模型
  - Hexo
  - 实战
  - OpenSpec
categories:
  - AI实战
---

## 前言

前几天，我在浏览自己的博客时突然想到一个问题：**读者来了之后，除了看文章，还能做什么？**

目前的博客是纯静态的，读者只能被动阅读。如果能有一个 AI 助手，让读者主动提问、获取个性化推荐，那体验岂不是更好？

说干就干。这篇文章记录了我用 **小米大模型 mimo-v2.5-pro**，给博客集成 AI 智能助手的完整过程——从需求分析、技术选型、OpenSpec 规划、代码实现到最终部署的每一步。

---

## 功能预览

先看看最终效果：

功能特性：
- 右下角悬浮聊天按钮，带呼吸动画
- 点击打开聊天窗口，支持 Escape 键关闭
- 基于博客文章的上下文问答
- 4 个预设问题引导互动
- Markdown 渲染和代码高亮
- 移动端响应式适配
- 30 秒超时处理和错误重试

---

## 技术选型

### 为什么选择小米大模型？

在选择 AI 模型时，我考虑了以下因素：

| 因素 | 说明 |
|------|------|
| **中文能力** | 博客是中文内容，需要强大的中文理解能力 |
| **API 兼容性** | 最好兼容主流 SDK 格式，降低开发成本 |
| **成本** | 个人博客，需要考虑 API 调用成本 |
| **稳定性** | 国内服务，网络延迟低，访问稳定 |

小米的 mimo-v2.5-pro 模型完全满足这些需求：
- 中文理解能力强，适合中文博客场景
- 兼容 Anthropic SDK 格式，可以直接用 fetch 调用
- 提供免费额度，适合个人项目
- 国内服务，访问速度快

### 为什么用 OpenSpec 规划？

上次用 OpenSpec 给博客添加搜索功能的体验非常好，这次继续用它来规划 AI 助手功能。

OpenSpec 的优势：
- **结构化规划**：把模糊的想法变成清晰的需求和任务
- **AI 协作**：Spec 文件让 AI 理解系统全貌，不会"自作主张"
- **可追溯**：变更记录保存在 Git 里，方便回顾

---

## OpenSpec 规划

### 第一步：创建变更

```bash
$ openspec new change integrate-ai-assistant

✔ Created change 'integrate-ai-assistant' at openspec/changes/integrate-ai-assistant/
```

### 第二步：编写 Proposal

用 `openspec instructions` 获取编写指导：

```bash
$ openspec instructions proposal --change integrate-ai-assistant
```

按照指导，我编写了 proposal.md：

```markdown
## Why

当前博客是纯静态网站，访客只能被动阅读内容，缺乏互动性。
集成AI智能助手可以让访客主动提问，获得个性化的回答和内容推荐，
提升用户体验和参与度。

## What Changes

- 在博客右下角添加可折叠的AI聊天窗口
- 支持访客输入问题，AI根据博客内容进行回答
- 集成小米mimo-v2.5-pro模型API
- 聊天窗口支持Markdown渲染，代码高亮

## Capabilities

### New Capabilities
- `ai-chat-widget`: AI聊天窗口组件
- `ai-content-context`: 博客内容上下文管理
```

### 第三步：编写 Spec

为两个新能力编写详细的规格说明：

**ai-chat-widget** - 聊天窗口组件规格：

```markdown
### Requirement: Chat button visibility
博客页面右下角 SHALL 显示一个悬浮聊天按钮，使用AI/机器人图标。

#### Scenario: Page load
- WHEN 用户访问博客任意页面
- THEN 右下角显示半透明的聊天按钮，带轻微呼吸动画

### Requirement: Chat window open/close
点击聊天按钮 SHALL 打开聊天窗口，再次点击或点击关闭按钮 SHALL 关闭聊天窗口。

#### Scenario: Open chat window
- WHEN 用户点击聊天按钮
- THEN 从按钮位置展开聊天窗口，窗口标题显示"AI探索助手"
```

**ai-content-context** - 内容上下文规格：

```markdown
### Requirement: Article summary extraction
构建时 SHALL 提取每篇文章的前500字作为摘要，存入JSON文件供AI参考。

#### Scenario: Build time extraction
- WHEN 执行 pnpm build 生成静态文件
- THEN 自动生成 ai-context.json 文件

### Requirement: Context injection to AI
发送给AI的请求 SHALL 包含博客内容摘要作为上下文。

#### Scenario: API request context
- WHEN 用户发送问题
- THEN 请求的system prompt包含博客摘要信息
```

### 第四步：编写 Design

技术设计文档，说明"怎么做"：

```markdown
## Decisions

### 1. 注入方式：复用inject-custom.js
选择理由：项目已建立"构建后注入"模式，避免修改主题模板。

### 2. API调用：原生fetch
选择理由：静态博客无需引入完整SDK，保持轻量。

### 3. 上下文策略：文章摘要注入
选择理由：构建时提取摘要，存入JSON供AI参考，避免传入全文导致token消耗过大。
```

### 第五步：生成任务清单

```markdown
## 1. 上下文提取功能
- [ ] 1.1 创建Hexo插件脚本，构建时提取文章摘要
- [ ] 1.2 实现文章摘要提取逻辑
- [ ] 1.3 过滤draft文章
- [ ] 1.4 生成ai-context.json文件

## 2. 聊天窗口UI组件
- [ ] 2.1 设计聊天窗口HTML结构
- [ ] 2.2 实现聊天窗口CSS样式
- [ ] 2.3 实现聊天按钮的显示和动画
- [ ] 2.4 实现聊天窗口的打开/关闭交互
- [ ] 2.5 实现Escape键关闭窗口

## 3. 消息交互功能
- [ ] 3.1 实现消息输入框和发送按钮
- [ ] 3.2 实现Enter发送、Shift+Enter换行
- [ ] 3.3 实现空消息验证
- [ ] 3.4 实现消息列表渲染
- [ ] 3.5 实现加载动画

## 4. API集成
- [ ] 4.1 实现小米API调用函数
- [ ] 4.2 构造system prompt
- [ ] 4.3 实现超时处理
- [ ] 4.4 实现错误处理和重试机制
- [ ] 4.5 加载ai-context.json文件

## 5. 内容渲染
- [ ] 5.1 集成Markdown渲染
- [ ] 5.2 实现代码块语法高亮

## 6. 预设问题
- [ ] 6.1 设计预设问题列表
- [ ] 6.2 实现预设问题按钮

## 7. 注入集成
- [ ] 7.1 将聊天功能代码添加到inject-custom.js
- [ ] 7.2 确保按需加载
- [ ] 7.3 测试pnpm build

## 8. 测试验证
- [ ] 8.1 本地测试聊天窗口显示和交互
- [ ] 8.2 测试API调用和响应渲染
- [ ] 8.3 测试移动端响应式布局
- [ ] 8.4 测试构建流程完整性
```

---

## 代码实现

有了清晰的任务清单，实现过程变得非常顺畅。我使用 Claude Code 来执行这些任务。

### 1. 上下文提取插件

创建 `scripts/generate-ai-context.js`，这是一个 Hexo 插件，构建时自动提取文章摘要：

```javascript
var fs = require('fs');
var path = require('path');

// Hexo plugin: generate ai-context.json at build time
hexo.extend.generator.register('ai-context', function(locals) {
  var posts = locals.posts.filter(function(post) {
    return !post.draft;
  }).map(function(post) {
    // 提取前500字作为摘要
    var content = post.content || '';
    var plainText = content.replace(/<[^>]+>/g, '');
    plainText = plainText.replace(/\s+/g, ' ').trim();
    if (plainText.length > 500) {
      plainText = plainText.substring(0, 500) + '...';
    }

    return {
      title: post.title,
      categories: post.categories ? post.categories.map(function(cat) { return cat.name; }) : [],
      tags: post.tags ? post.tags.map(function(tag) { return tag.name; }) : [],
      summary: plainText,
      url: post.path,
      date: post.date ? post.date.format('YYYY-MM-DD') : ''
    };
  });

  return {
    path: 'ai-context.json',
    data: JSON.stringify(posts, null, 2)
  };
});
```

### 2. 聊天窗口 UI

在 `scripts/inject-custom.js` 中添加聊天窗口的 HTML、CSS 和 JavaScript。

**HTML 结构**：

```html
<div id="ai-chat-widget">
  <div id="ai-chat-window">
    <div id="ai-chat-header">
      <div id="ai-chat-header-title">AI探索助手</div>
      <button id="ai-chat-close">&times;</button>
    </div>
    <div id="ai-chat-messages"></div>
    <div id="ai-chat-presets">
      <button class="chat-preset-btn" data-q="推荐一篇博客文章">推荐文章</button>
      <button class="chat-preset-btn" data-q="介绍一下这个博客的主要内容">博客介绍</button>
      <button class="chat-preset-btn" data-q="解释一下AI技术的基本概念">AI技术</button>
      <button class="chat-preset-btn" data-q="有什么学习建议吗？">学习建议</button>
    </div>
    <div id="ai-chat-input-area">
      <textarea id="ai-chat-input" placeholder="输入你的问题..." rows="1"></textarea>
      <button id="ai-chat-send" disabled>
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  </div>
  <button id="ai-chat-btn">
    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
    <span class="tooltip">AI助手</span>
  </button>
</div>
```

**核心 JavaScript 逻辑**：

```javascript
// AI Chat Widget
(function() {
  var chatBtn = document.getElementById("ai-chat-btn");
  var chatWindow = document.getElementById("ai-chat-window");
  var chatClose = document.getElementById("ai-chat-close");
  var chatInput = document.getElementById("ai-chat-input");
  var chatSend = document.getElementById("ai-chat-send");
  var chatMessages = document.getElementById("ai-chat-messages");
  var isOpen = false;
  var isLoading = false;
  var aiContext = null;

  // 加载上下文
  function loadContext() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/my-blog/ai-context.json", true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          aiContext = JSON.parse(xhr.responseText);
        } catch(e) {
          console.warn("[AI Chat] Failed to parse context:", e);
        }
      }
    };
    xhr.send();
  }

  // 切换聊天窗口
  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.add("open");
      loadContext();
      setTimeout(function() { chatInput.focus(); }, 300);
    } else {
      chatWindow.classList.remove("open");
    }
  }

  // 构造 system prompt
  function getSystemPrompt() {
    var prompt = "你是AI探索笔记博客的智能助手。你可以回答关于AI技术、编程学习、博客内容等问题。请用友好、专业的语气回答。";
    if (aiContext && aiContext.length > 0) {
      prompt += "\n\n以下是博客文章摘要：\n";
      for (var i = 0; i < aiContext.length; i++) {
        var post = aiContext[i];
        prompt += "\n标题：" + post.title;
        if (post.categories && post.categories.length > 0) {
          prompt += "\n分类：" + post.categories.join(", ");
        }
        if (post.tags && post.tags.length > 0) {
          prompt += "\n标签：" + post.tags.join(", ");
        }
        prompt += "\n摘要：" + post.summary + "\n";
      }
    }
    return prompt;
  }

  // 调用小米 API
  function callAPI(question) {
    isLoading = true;
    chatSend.disabled = true;
    var typing = addTypingIndicator();

    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 30000);

    fetch("https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_KEY",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        max_tokens: 1024,
        system: getSystemPrompt(),
        messages: [{ role: "user", content: question }]
      }),
      signal: controller.signal
    })
    .then(function(response) {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error("API请求失败: " + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      typing.remove();
      if (data.content && data.content[0] && data.content[0].text) {
        addMessage(data.content[0].text, false);
      } else {
        showError("未能获取到有效响应", function() { callAPI(question); });
      }
    })
    .catch(function(error) {
      clearTimeout(timeoutId);
      typing.remove();
      if (error.name === "AbortError") {
        showError("请求超时，请重试", function() { callAPI(question); });
      } else {
        showError(error.message || "网络错误", function() { callAPI(question); });
      }
    })
    .finally(function() {
      isLoading = false;
      chatSend.disabled = chatInput.value.trim() === "";
    });
  }

  // ... 其他交互逻辑
})();
```

### 3. 注入到构建流程

在 `scripts/inject-custom.js` 的 `processDir` 函数中，将聊天组件注入到所有 HTML 文件：

```javascript
function processDir(dir) {
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      var content = fs.readFileSync(fullPath, 'utf8');
      // 检查是否已经注入过
      if (content.indexOf('ai-chat-widget') !== -1) continue;
      // 注入 CSS
      content = content.replace(/<\/head>/, headCSS + '\n</head>');
      // 注入 HTML 和 JavaScript
      content = content.replace(/<\/body>/, '\n' + chatWidgetHTML + '\n' + bodyScript + '\n</body>');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}
```

---

## 构建与测试

### 构建验证

```bash
$ pnpm build

> hexo-site@0.0.0 build D:\ToolWorkspace\my-blog
> hexo generate && node scripts/inject-custom.js

INFO  Validating config
INFO  Start processing
INFO  Files loaded in 84 ms
INFO  Generated: ai-context.json
INFO  1 files generated in 27 ms
[inject] Custom styles, animations and search UI injected.
```

构建成功！可以看到：
- `ai-context.json` 已生成，包含所有文章的摘要
- 注入脚本成功执行

### 本地预览

```bash
$ pnpm server
```

打开浏览器访问 `http://localhost:4000/my-blog/`，右下角出现了聊天按钮。点击打开聊天窗口，输入问题测试：

- "推荐一篇博客文章"
- "介绍一下 OpenSpec"
- "有什么学习建议吗？"

AI 助手能够基于博客内容给出相关的回答，效果不错！

---

## 部署上线

### 提交代码

```bash
$ git add .
$ git commit -m "feat: 集成AI智能助手，使用小米mimo大模型"
$ git push
```

### 自动部署

GitHub Actions 自动触发构建和部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

几分钟后，访问博客，AI 助手已经上线了！

---

## 技术细节

### API 调用格式

小米 mimo 模型兼容 Anthropic SDK 格式，请求体结构：

```javascript
{
  model: "mimo-v2.5-pro",
  max_tokens: 1024,
  system: "系统提示词，包含博客上下文",
  messages: [
    { role: "user", content: "用户的问题" }
  ]
}
```

请求头：

```javascript
{
  "Content-Type": "application/json",
  "x-api-key": "YOUR_API_KEY",
  "anthropic-version": "2023-06-01"
}
```

### 上下文注入策略

为了让 AI 能够回答关于博客内容的问题，我在 system prompt 中注入了所有文章的摘要：

```
你是AI探索笔记博客的智能助手。你可以回答关于AI技术、编程学习、博客内容等问题。

以下是博客文章摘要：

标题：你好，世界！我的第一篇博客
分类：随笔
标签：博客, AI
摘要：开篇你好，欢迎来到我的博客！这是一个记录 AI 使用与学习过程的个人空间...

标题：OpenSpec 实践手记
分类：AI工具
标签：AI, OpenSpec, 工程实践
摘要：最近在使用 Claude Code、Cursor 等 AI 编程工具时，遇到了一个共性问题...
```

这样 AI 就能基于博客内容给出相关的回答。

### 错误处理

实现了完善的错误处理机制：

1. **超时处理**：30 秒超时，超时后显示重试按钮
2. **网络错误**：捕获网络异常，提供重试选项
3. **API 错误**：处理非 200 响应，显示友好提示
4. **空响应**：检查响应格式，避免渲染空内容

---

## 遇到的问题与解决

### 问题 1：聊天功能没有注入

**现象**：构建成功，但 HTML 文件中没有聊天组件的代码。

**原因**：`inject-custom.js` 中的检查条件是 `if (content.indexOf('local-search-overlay') !== -1) continue;`，这意味着已经注入过搜索功能的文件会被跳过。

**解决**：修改检查条件为 `if (content.indexOf('ai-chat-widget') !== -1) continue;`，只检查聊天组件是否已注入。

### 问题 2：ai-context.json 没有生成

**现象**：构建时没有生成 `ai-context.json` 文件。

**原因**：Hexo 插件没有被正确加载。

**解决**：确保插件文件放在 `scripts/` 目录下，并且使用 `hexo.extend.generator.register` 注册。

### 问题 3：移动端显示异常

**现象**：在手机上，聊天窗口超出屏幕。

**原因**：固定宽度的聊天窗口在小屏幕上不适配。

**解决**：添加响应式样式，在 480px 以下宽度时，聊天窗口全屏显示：

```css
@media (max-width: 480px) {
  #ai-chat-window {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    bottom: 70px;
    right: -8px;
  }
}
```

---

## 总结

这次 AI 助手集成的实战，让我有几个深刻的体会：

### 1. OpenSpec 让复杂功能变得可控

32 个任务，如果没有清晰的规划，很容易遗漏或混乱。OpenSpec 把模糊的想法变成了可执行的任务清单，每一步都有明确的验收标准。

### 2. 小米大模型表现不错

mimo-v2.5-pro 的中文理解能力很强，能够准确理解用户意图，并基于博客上下文给出相关回答。而且 API 兼容 Anthropic 格式，接入成本很低。

### 3. 静态博客也能有动态功能

通过"构建时提取上下文 + 运行时调用 API"的模式，静态博客也能拥有智能交互功能。这种架构既保持了静态站点的性能优势，又增加了动态交互能力。

### 4. AI 编程工具的价值

使用 Claude Code 执行 OpenSpec 生成的任务清单，效率非常高。AI 负责写代码，我负责规划和验证，各司其职。

---

## 后续计划

- [ ] 添加对话历史功能，支持多轮对话
- [ ] 优化 system prompt，提高回答质量
- [ ] 添加使用统计，了解用户提问热点
- [ ] 考虑添加流式输出，提升用户体验

---

## 参考资料

- [小米大模型开放平台](https://open.mi.com/)
- [Anthropic API 文档](https://docs.anthropic.com/)
- [OpenSpec 官网](https://openspec.dev)
- [Hexo 插件开发指南](https://hexo.io/zh-cn/docs/plugins)
