---
title: OpenSpec 实践手记：用 Spec 驱动 AI 编程的新范式
date: 2026-05-11 10:00:00
tags:
  - AI
  - OpenSpec
  - 工程实践
  - Prompt Engineering
categories:
  - AI工具
---

## 前言

最近在使用 Claude Code、Cursor 等 AI 编程工具时，遇到了一个共性问题：**上下文丢失**。

每次开新会话，AI 就像失忆了一样——之前讨论过的架构决策、设计约束、业务规则，统统忘干净。更头疼的是，当项目变大之后，AI 经常"自作主张"地改坏已有功能，因为它根本不理解系统的全貌。

直到我发现了 **OpenSpec**，一个轻量级的 Spec 驱动规划框架。它用一种非常优雅的方式解决了这个问题：**把规划成果持久化为版本控制的规范文件，让 AI 和人类都能随时回顾系统的设计意图**。

这篇文章记录了我在自己的 Hexo 博客项目中，从零开始学习和使用 OpenSpec 的完整过程——包括安装、配置、编写 Spec、生成 Proposal、实施功能、归档变更的每一步。

---

## 什么是 OpenSpec？

OpenSpec 是由 Fission AI 开源的一个**规范驱动的开发规划框架**。它的核心理念很简单：

> 在写代码之前，先用结构化的 Spec 文件描述"系统应该做什么"；在改代码时，用 Spec Delta 展示"需求发生了什么变化"。

它不是又一个文档工具，而是一个**活在代码仓库里的规划层**。

### 与其他方案的对比

| 方案 | 问题 |
|------|------|
| 纯聊天式 Prompt | 上下文随会话消失，无法复用 |
| PRD 文档 | 与代码脱节，容易过时 |
| 架构决策记录 (ADR) | 只记录决策，不描述系统行为 |
| **OpenSpec** | Spec 与代码共存，版本控制，AI 可读 |

---

## 安装与配置

安装非常简单，一行命令：

```bash
npm install -g @fission-ai/openspec@latest
```

不需要 API Key，不需要 MCP 协议，不绑定任何特定的 AI 工具。装完就能用。

然后在项目根目录初始化：

```bash
openspec init
```

这会在项目中创建 `openspec/` 目录结构，并自动配置你使用的 AI 工具（比如 Claude Code 的 slash commands）。

### 支持的 AI 工具

OpenSpec 提供了原生集成，支持的工具非常广泛：

- **Claude Code** — 我主要使用的工具
- **Cursor** / **GitHub Copilot** / **Windsurf**
- **Gemini CLI** / **Cline** / **RooCode**
- **Amazon Q** / **Qwen Code** 等等

每个工具都有对应的 slash command 集成，使用体验一致。

---

## 核心概念

OpenSpec 的工作流围绕三个核心概念展开：

### 1. Specs（规范）

Spec 是对系统某个能力的结构化描述，存放在 `openspec/specs/` 目录下：

```
openspec/specs/
├── auth-login/
│   └── spec.md
├── auth-session/
│   └── spec.md
├── checkout-cart/
│   └── spec.md
└── checkout-payment/
    └── spec.md
```

每个 Spec 用 SHALL 风格描述需求，用 GIVEN/WHEN/THEN 格式描述场景：

```markdown
## 需求

- 系统 SHALL 支持用户名密码登录
- 登录失败超过 5 次 SHALL 触发账户锁定

## 场景：正常登录

GIVEN 用户已注册且账户未锁定
WHEN 用户提交正确的用户名和密码
THEN 系统返回有效的会话 Token
```

### 2. Proposals（提案）

当你需要做改动时，通过 slash command 或 CLI 创建变更：

```bash
openspec new change add-fulltext-search
```

然后按模板编写 4 个制品（proposal / specs / design / tasks）。OpenSpec 提供了 `openspec instructions` 命令来指导你完成每个制品的编写。

### 3. Spec Deltas（规范差异）

这是 OpenSpec 最精妙的设计。与传统的代码 Diff 不同，Spec Delta 展示的是**需求层面的变化**：

```diff
- 会话有效期 SHALL 为 24 小时
+ 会话有效期 SHALL 可配置，默认 24 小时

+ ## 场景：记住我登录
+ GIVEN 用户勾选了"记住我"选项
+ WHEN 用户登录成功
+ THEN 会话有效期 SHALL 延长至 30 天
```

这让 Code Review 从"看代码改了什么"升级为"看需求变了什么"。

---

## 实际使用体验：为博客添加全文搜索

接下来，我用一个真实的例子来演示完整的工作流。目标是给我的 Hexo 博客添加全文搜索功能，支持中文搜索。

### 第一步：初始化 OpenSpec

```bash
$ openspec init

✔ Setup complete for Claude Code
Created: Claude Code
4 skills and 4 commands in .claude/
```

初始化后，项目中多了 `openspec/specs/`、`openspec/changes/` 目录，以及 `.claude/` 下的 AI 工具集成。

### 第二步：为现有功能补 Spec

在规划新功能之前，先为博客的现有能力编写 Spec。我创建了两个：

**文章管理 Spec** (`openspec/specs/blog-post/spec.md`)：

```markdown
# 文章管理

## 需求

- 系统 SHALL 支持 Markdown 格式的文章编写与发布
- 文章 SHALL 存放在 source/_posts/ 目录下
- 文章 SHALL 包含 YAML Front Matter 元数据
- 系统 SHALL 按日期倒序在首页展示文章列表

## 场景：发布新文章

GIVEN 管理员在 source/_posts/ 目录下创建了新的 .md 文件
AND 文件包含有效的 YAML Front Matter
WHEN 执行 pnpm build 构建
THEN 新文章 SHALL 出现在首页文章列表中
```

**主题部署 Spec** (`openspec/specs/site-theme/spec.md`)：

```markdown
# 站点主题与部署

## 需求

- 站点 SHALL 使用暗色主题（背景 #0a0e17，强调色 #00f0ff）
- 站点 SHALL 通过 GitHub Actions 自动构建和部署
```

### 第三步：创建变更和 Proposal

```bash
$ openspec new change add-fulltext-search

✔ Created change 'add-fulltext-search' at openspec/changes/add-fulltext-search/
```

然后用 `openspec instructions` 获取每个制品的编写指导：

```bash
$ openspec instructions proposal --change add-fulltext-search
$ openspec instructions specs --change add-fulltext-search
$ openspec instructions design --change add-fulltext-search
$ openspec instructions tasks --change add-fulltext-search
```

每个命令都会输出详细的模板和要求。按照指导，我依次编写了 4 个制品：

#### proposal.md — 为什么要做这个变更

```markdown
## Why

博客目前没有搜索功能，读者只能通过浏览首页或按标签/分类筛选来查找文章。
随着文章数量增长，找到特定内容会越来越困难。

## What Changes

- 新增基于 hexo-generator-searchdb 的本地全文搜索功能
- 在导航栏集成搜索入口，替换现有的 Google 搜索跳转
- 支持中文分词，确保中文文章可被正确搜索

## Capabilities

### New Capabilities
- `site-search`: 博客站内全文搜索功能
```

#### specs/site-search/spec.md — 搜索功能的详细需求

```markdown
## ADDED Requirements

### Requirement: 全文搜索索引生成
系统 SHALL 在构建时自动生成全文搜索索引文件。

#### Scenario: 构建时生成搜索索引
- WHEN 执行 pnpm build 构建站点
- THEN 系统 SHALL 在输出目录中生成 JSON 格式的搜索索引文件

#### Scenario: 中文内容索引
- WHEN 文章包含中文内容
- THEN 搜索"AI" SHALL 匹配包含"AI探索"的文章

### Requirement: 搜索 UI 组件
站点 SHALL 提供一个内嵌的搜索 UI 组件。

#### Scenario: 实时搜索
- WHEN 用户在搜索框中输入关键词
- THEN 系统 SHALL 实时展示匹配的文章列表
```

#### design.md — 技术方案

```markdown
## Decisions

### 1. 搜索索引方案：hexo-generator-searchdb
选择理由：Hexo 生态中最成熟的搜索索引生成插件，支持 JSON 格式输出。

### 2. 搜索 UI：自定义实现
选择理由：复用导航栏搜索图标，自定义 UI 适配暗色主题。

### 3. 中文搜索策略：子串匹配
选择理由：中文不需要严格分词，indexOf 子串匹配已能覆盖大部分场景。
```

#### tasks.md — 实施任务清单

```markdown
## 1. 依赖安装与配置
- [ ] 1.1 安装 hexo-generator-searchdb 依赖
- [ ] 1.2 在 _config.yml 中添加搜索索引配置

## 2. 搜索 UI 组件
- [ ] 2.1 创建搜索 UI 的 CSS 样式
- [ ] 2.2 创建搜索 UI 的 JavaScript 逻辑
- [ ] 2.3 将搜索 CSS 和 JS 注入到 inject 脚本中

## 3. 验证与测试
- [ ] 4.1 执行 pnpm build 验证搜索索引文件生成
- [ ] 4.2 本地预览验证搜索功能
```

### 第四步：验证 Proposal

```bash
$ openspec validate add-fulltext-search

Change 'add-fulltext-search' is valid
```

```bash
$ openspec status --change add-fulltext-search

Change: add-fulltext-search
Schema: spec-driven
Progress: 4/4 artifacts complete

[x] proposal
[x] design
[x] specs
[x] tasks

All artifacts complete!
```

### 第五步：按任务实施

有了清晰的任务清单，实施过程变得非常顺畅。每个任务都有明确的验收标准（来自 Spec），AI 在执行时不会偏离方向。

实际实施过程：

```bash
# 1. 安装依赖
pnpm add hexo-generator-searchdb

# 2. 在 _config.yml 中添加搜索配置
# search:
#   path: search.json
#   field: post
#   content: true
#   format: striptags

# 3. 在 inject-custom.js 中添加搜索 UI 的 CSS 和 JS

# 4. 构建验证
$ pnpm build

INFO  Generated: search.json
INFO  20 files generated in 312 ms
[inject] Custom styles, animations and search UI injected.
```

构建成功，`search.json` 索引文件自动生成，包含了所有文章的标题、内容、标签和分类。

### 第六步：归档变更

功能实施完成、所有任务勾选后，用 `openspec archive` 归档：

```bash
$ openspec archive add-fulltext-search -y

Task status: ✓ Complete

Specs to update:
  site-search: create
Applying changes to openspec/specs/site-search/spec.md:
  + 3 added
Totals: + 3, ~ 0, - 0, → 0
Specs updated successfully.
Change 'add-fulltext-search' archived as '2026-05-11-add-fulltext-search'.
```

归档后，`site-search` 的 Spec 被合并到了主 Spec 目录 `openspec/specs/site-search/spec.md`，变更记录移到了 `openspec/changes/archive/` 下。

最终的项目结构：

```
openspec/
├── specs/
│   ├── blog-post/spec.md       ← 文章管理 Spec
│   ├── site-search/spec.md     ← 搜索功能 Spec（归档后生成）
│   └── site-theme/spec.md      ← 主题部署 Spec
└── changes/
    └── archive/
        └── 2026-05-11-add-fulltext-search/
            ├── proposal.md
            ├── design.md
            ├── tasks.md
            └── specs/site-search/spec.md
```

---

## 为什么 Spec 比 Prompt 更重要？

用了 OpenSpec 之后，我最大的感受是：**好的规划比好的 Prompt 更重要**。

### Prompt 的局限

```
❌ "帮我加个搜索功能"
❌ "优化一下性能"
❌ "重构认证模块"
```

这些 Prompt 缺乏上下文，AI 只能猜测你的意图。

### Spec 的优势

有了 Spec，AI 能看到：
- 系统当前的行为是什么（现有 Spec）
- 你想改成什么（Spec Delta）
- 需要满足什么约束（需求和场景）

这比任何精心设计的 Prompt 都有效。

---

## OpenSpec CLI 速查

在实际使用中，这些命令最常用：

```bash
# 初始化
openspec init

# 创建变更
openspec new change <name>

# 获取制品编写指导
openspec instructions proposal --change <name>
openspec instructions specs --change <name>
openspec instructions design --change <name>
openspec instructions tasks --change <name>

# 验证和查看状态
openspec validate <name>
openspec status --change <name>

# 归档完成的变更
openspec archive <name> -y

# 查看所有 Spec 和变更
openspec list --specs
openspec list
```

---

## 适用场景

OpenSpec 特别适合以下场景：

**1. 已有项目的功能迭代**

> "Brownfield development" — 这是 OpenSpec 的设计重心。对于成熟项目，理解现有系统比从零开始更难。

**2. 多人协作**

Spec 存在 Git 里，团队成员通过 PR 审查 Spec 变更，确保大家对需求的理解一致。

**3. 跨会话的长期规划**

大型功能往往需要多次会话才能完成。Spec 让每次会话都能接续上次的进度。

**4. AI 编程的质量控制**

Spec 为 AI 提供了明确的约束，减少"自作主张"的风险。

---

## 注意事项

使用 OpenSpec 也有一些需要注意的地方：

1. **不要过度设计** — OpenSpec 强调"够用就好"，不要把 Spec 写成瀑布式的需求文档
2. **Spec 需要维护** — 代码改了但 Spec 没更新，比没有 Spec 更糟糕
3. **增量采用** — 不需要一次性为整个项目补 Spec，按需创建即可
4. **AI 不是万能的** — "Specs only work if you actually read them, think through them, and engage with them"

---

## 总结

OpenSpec 给我的 AI 编程工作流带来了质的提升：

- **上下文持久化** — 不再依赖会话记忆
- **意图可追溯** — Spec Delta 让变更意图清晰可见
- **AI 协作更精准** — 有了 Spec 约束，AI 的输出质量显著提高
- **团队对齐** — Spec 成为活的文档，而不是写完就扔的 PRD

如果你也在用 AI 工具做开发，强烈推荐试试 OpenSpec。它不是银弹，但确实解决了一个真实的痛点：**让 AI 理解你的系统，而不只是你的 Prompt**。

---

## 参考资料

- [OpenSpec 官网](https://openspec.dev)
- [OpenSpec GitHub 仓库](https://github.com/Fission-AI/OpenSpec)
- [OpenSpec Discord 社区](https://discord.gg/openspec)
