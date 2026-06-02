---
title: 我的 Claude Code Skill 工具箱：30+ 个实战场景全覆盖
date: 2026-06-02 10:00:00
tags:
  - AI
  - Claude Code
  - Skill
  - 工程实践
  - 效率工具
categories:
  - AI工具
---

## 前言

之前写过一篇文章介绍 6 个 Skill 的实战经验，但随着使用深入，我又陆续安装了 30 多个 Skill。

从代码质量到项目管理，从沟通效率到工具集成，这些 Skill 覆盖了我日常开发的方方面面。

这篇文章是我这段时间的**完整 Skill 使用手册**——每个 Skill 解决什么问题、怎么用、效果如何，全在这里。

---

## Skill 分类速查表

先按功能分类列出来，方便查找：

| 类别 | Skill | 一句话说明 |
|------|-------|-----------|
| **代码质量** | `simplify` | 自动优化代码结构 |
| | `karpathy-guidelines` | 避免 LLM 常见编码错误 |
| | `improve-codebase-architecture` | 发现架构改进机会 |
| **开发流程** | `tdd` | 测试驱动开发 |
| | `review` | 代码审查 |
| | `security-review` | 安全漏洞扫描 |
| | `diagnose` | Bug 诊断循环 |
| **沟通效率** | `caveman` | 压缩输出 75% |
| | `grill-me` | 采访式需求澄清 |
| | `grill-with-docs` | 带文档的采访 |
| **项目管理** | `to-issues` | 转换为 GitHub Issue |
| | `to-prd` | 转换为 PRD 文档 |
| | `openspec-propose` | 提出变更方案 |
| | `openspec-apply-change` | 实施变更 |
| | `openspec-archive-change` | 归档变更 |
| | `opsx:propose` | 快速提出变更 |
| | `opsx:apply` | 应用任务 |
| | `opsx:archive` | 归档任务 |
| | `opsx:explore` | 探索变更 |
| **工具集成** | `pptx` | PPT 文件处理 |
| | `frontend-design` | 前端界面设计 |
| | `claude-api` | Claude API 开发 |
| **配置管理** | `update-config` | 更新 Claude Code 配置 |
| | `keybindings-help` | 键绑定自定义 |
| | `fewer-permission-prompts` | 减少权限提示 |
| **其他** | `find-skills` | 发现新 Skill |
| | `write-a-skill` | 编写自定义 Skill |
| | `loop` | 循环执行任务 |
| | `init` | 项目初始化 |
| | `performance` | 性能优化 |

---

## 一、代码质量类

### 1. simplify - 我用它优化了 50+ 次代码

**触发方式：** `/simplify`

**解决的问题：** 代码写完后想优化，但手动重构太慢。

**实际效果：**

```javascript
// 优化前：嵌套 5 层，24 行
function processUsers(users) {
  var result = [];
  for (var i = 0; i < users.length; i++) {
    if (users[i] != null) {
      if (users[i].age >= 18) {
        if (users[i].name) {
          result.push({
            name: users[i].name,
            age: users[i].age
          });
        }
      }
    }
  }
  return result;
}

// 优化后：0 层嵌套，8 行
function processUsers(users) {
  if (!Array.isArray(users)) {
    return [];
  }
  return users
    .filter(u => u?.age >= 18 && u?.name)
    .map(({ name, age }) => ({ name, age }));
}
```

| 指标 | 优化前 | 优化后 | 改进 |
|------|--------|--------|------|
| 代码行数 | 24 行 | 8 行 | -67% |
| 嵌套层级 | 5 层 | 0 层 | -100% |
| 可读性 | 低 | 高 | 显著提升 |

---

### 2. karpathy-guidelines - 避免 LLM 常见错误

**触发方式：** 写代码、review、重构时自动触发

**解决的问题：** AI 生成的代码常有过度工程化、缺少边界检查等问题。

**Karpathy 的核心原则：**

| 原则 | 说明 |
|------|------|
| 简单优先 | 能用 10 行解决就别写 100 行 |
| 边界检查 | 输入验证不能省 |
| 明确胜于隐晦 | 变量名、函数名要清晰 |
| 不要过度抽象 | 三行相似代码比一个早抽象好 |

**实际案例：**

```javascript
// ❌ 过度工程化
class UserService {
  constructor(repository, validator, transformer, logger) {
    this.repository = repository;
    this.validator = validator;
    this.transformer = transformer;
    this.logger = logger;
  }
  
  async process(data) {
    this.logger.info('Processing', data);
    const validated = this.validator.validate(data);
    const transformed = this.transformer.transform(validated);
    return this.repository.save(transformed);
  }
}

// ✅ 简单直接
function processUser(data) {
  if (!data?.name || !data?.email) {
    throw new Error('Missing required fields');
  }
  
  return db.users.create({
    name: data.name,
    email: data.email
  });
}
```

---

### 3. improve-codebase-architecture - 发现隐藏的架构问题

**触发方式：** `/improve-codebase-architecture`

**解决的问题：** 代码库越来越大，但不知道哪里需要重构。

**它会分析：**
- 模块耦合度
- 依赖关系
- 测试覆盖率
- 可维护性指标

**在我的博客项目中发现的问题：**

| 问题 | 严重度 | 建议 |
|------|--------|------|
| scripts 目录函数重复 | 中 | 提取公共工具函数 |
| 配置散落多处 | 低 | 统一到 config 目录 |
| 缺少类型定义 | 中 | 添加 JSDoc 或 TypeScript |

---

## 二、开发流程类

### 4. tdd - 测试驱动开发

**触发方式：** `/tdd`

**解决的问题：** 不知道怎么写测试，或者懒得写。

**工作流程：**

```
Red（写失败的测试）
  ↓
Green（写最少代码让测试通过）
  ↓
Refactor（优化代码结构）
```

**实际案例：**

```javascript
// Red: 先写测试
describe('processUsers', () => {
  it('应该过滤未成年用户', () => {
    const users = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 16 }
    ];
    expect(processUsers(users)).toHaveLength(1);
  });

  it('应该处理空数组', () => {
    expect(processUsers([])).toEqual([]);
  });

  it('应该处理 null 输入', () => {
    expect(processUsers(null)).toEqual([]);
  });
});

// Green: 写实现
function processUsers(users) {
  if (!Array.isArray(users)) {
    return [];
  }
  return users.filter(u => u?.age >= 18);
}
```

**效果：** 测试覆盖率从 0% → 100%，还顺便发现了 2 个边界 bug。

---

### 5. review - 代码审查

**触发方式：** `/review`

**解决的问题：** 代码写完了，想让 AI 帮忙检查。

**审查维度：**

| 维度 | 检查内容 |
|------|----------|
| 代码质量 | 命名、结构、复杂度 |
| 安全性 | XSS、注入、敏感信息 |
| 性能 | 算法复杂度、内存泄漏 |
| 可维护性 | 文档、注释、测试 |

**实际案例：**

执行 `/review` 后，Claude Code 发现了我的代码有几个问题：

```javascript
// 问题 1：escapeHtml 不完整
function escapeHtml(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // 缺少 & " ' 的转义
}

// 问题 2：filter 条件太宽松
users.filter(u => u.age >= 18)
// 如果 u.age 是 undefined，会抛异常
```

**修复后：**

```javascript
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function processUsers(users) {
  return users
    .filter(u => u?.age != null && u.age >= 18);
}
```

---

### 6. security-review - 安全漏洞扫描

**触发方式：** `/security-review`

**解决的问题：** 代码有没有安全漏洞？

**检查范围：**

- XSS（跨站脚本攻击）
- SQL 注入
- 命令注入
- 敏感信息泄露
- 权限问题

**实际案例：**

```javascript
// ❌ 危险代码
function renderUser(name) {
  document.getElementById('user').innerHTML = name;
  // 如果 name 包含 <script>，会被执行
}

// ✅ 安全代码
function renderUser(name) {
  document.getElementById('user').textContent = name;
  // 或者
  document.getElementById('user').innerHTML = escapeHtml(name);
}
```

---

### 7. diagnose - Bug 诊断循环

**触发方式：** `/diagnose`

**解决的问题：** 有 Bug 但不知道怎么排查。

**工作流程：**

```
Reproduce（复现）
  ↓
Minimise（缩小范围）
  ↓
Hypothesise（提出假设）
  ↓
Instrument（添加日志）
  ↓
Fix（修复）
  ↓
Regression-test（回归测试）
```

**实际案例：**

博客搜索功能偶尔失效：

| 阶段 | 发现 |
|------|------|
| Reproduce | 发现是异步加载问题 |
| Minimise | 缩小到索引加载时机 |
| Hypothesise | 假设：索引未加载完就搜索 |
| Instrument | 添加日志确认加载顺序 |
| Fix | 改用事件监听 |
| Regression-test | 写测试防止复发 |

---

## 三、沟通效率类

### 8. caveman - 压缩输出 75%

**触发方式：** `/caveman`

**解决的问题：** 输出太长，token 消耗大。

**对比：**

**普通模式（~300 tokens）：**

> 我发现了以下问题需要修复：
> 1. **深层嵌套问题** - 所有三个函数都使用了深层嵌套的 `if` 语句，这是一种被称为"箭头反模式"的不良实践。建议使用 guard clause 或 early return 来扁平化逻辑。
> 2. **冗余状态** - `processUserData` 中的 `isAdult: true` 属性是冗余的...

**Caveman 模式（~80 tokens）：**

> Found 8 issues. Fixed all.
> | Issue | Severity |
> |-------|----------|
> | Nested if 5 levels | Medium |
> | `isAdult: true` always true | Low |
> Fix: Replaced loops with `filter`/`map`. `const` everywhere.

| 指标 | 普通模式 | Caveman | 节省 |
|------|----------|---------|------|
| Token | ~300 | ~80 | -73% |
| 阅读时间 | 45s | 15s | -67% |

---

### 9. grill-me - 采访式需求澄清

**触发方式：** `/grill-me`

**解决的问题：** 需求不清楚，AI 也不知道该怎么做。

**它会像记者一样采访你：**

```
你想要什么？
  ↓
为什么需要这个？
  ↓
有没有现有方案？
  ↓
边界情况是什么？
  ↓
怎么验证成功？
```

**实际案例：**

我说："帮我优化搜索功能"

它问：
1. 搜索现在有什么问题？
2. 数据量有多大？
3. 需要支持模糊搜索吗？
4. 响应时间要求是多少？
5. 有没有参考实现？

经过 5 轮问答，需求从"优化搜索"变成了"实现基于 FlexSearch 的中文模糊搜索，支持拼音，响应时间 < 50ms"。

---

### 10. grill-with-docs - 带文档的采访

**触发方式：** `/grill-with-docs`

**解决的问题：** 采访时需要参考项目文档、ADR、CONTEXT.md 等。

**与 grill-me 的区别：**

| 特性 | grill-me | grill-with-docs |
|------|----------|-----------------|
| 参考文档 | 不参考 | 参考项目文档 |
| 术语一致性 | 不保证 | 保持与项目一致 |
| 决策记录 | 不记录 | 更新 ADR |

---

## 四、项目管理类

### 11. to-issues - 转换为 GitHub Issue

**触发方式：** `/to-issues`

**解决的问题：** 有想法但懒得写 Issue。

**输入：** 一段描述

**输出：** 格式化的 GitHub Issue

```markdown
## 问题描述
搜索功能在移动端响应慢，需要优化

## 期望行为
搜索结果在 500ms 内返回

## 技术方案
1. 添加 FlexSearch 索引
2. 实现防抖
3. 添加 loading 状态

## 验收标准
- [ ] 搜索响应时间 < 500ms
- [ ] 支持中文模糊搜索
- [ ] 移动端体验流畅
```

---

### 12. to-prd - 转换为 PRD

**触发方式：** `/to-prd`

**解决的需求：** 从想法到完整的产品需求文档。

**输出结构：**

```markdown
# 产品需求文档

## 背景
## 目标用户
## 核心功能
## 技术约束
## 里程碑
## 成功指标
```

---

### 13. OpenSpec 系列 - 规范驱动开发

**触发方式：**

- `/openspec-propose` - 提出变更方案
- `/openspec-apply-change` - 实施变更
- `/openspec-archive-change` - 归档变更

**解决的问题：** AI 改代码时"自作主张"，改坏已有功能。

**工作流程：**

```
1. /openspec-propose
   → 生成 Spec Delta 文件
   → 描述"需求发生了什么变化"
   
2. /openspec-apply-change
   → 根据 Spec 实施代码变更
   
3. /openspec-archive-change
   → 归档已完成的变更
```

**实际案例：**

想给博客添加暗黑模式：

```
/openspec-propose

输入：添加暗黑模式支持，跟随系统主题，支持手动切换

输出：openspec/changes/add-dark-mode/spec.md
- 新增 ThemeProvider
- 新增主题切换组件
- CSS 变量定义
- 持久化用户偏好
```

然后：

```
/openspec-apply-change add-dark-mode

Claude Code 按照 Spec 一步步实施，不会自作主张。
```

---

### 14. opsx 系列 - 快速变更管理

**触发方式：**

- `/opsx:propose` - 快速提出
- `/opsx:apply` - 应用任务
- `/opsx:archive` - 归档
- `/opsx:explore` - 探索

**与 openspec 的区别：** opsx 更轻量，适合小改动。

---

## 五、工具集成类

### 15. pptx - PPT 文件处理

**触发方式：** 提到 `.pptx` 文件时自动触发

**支持的操作：**

- 创建 PPT
- 读取 PPT 内容
- 编辑 PPT
- 合并/拆分 PPT
- 提取文字

**实际案例：**

我用它自动生成了博客介绍 PPT：

```bash
# 读取 PPT 内容
/pptx 读取 ai-blog-intro.pptx 的内容

# 创建新 PPT
/pptx 创建一个介绍博客的 PPT，包含：
- 博客简介
- 技术栈
- 文章分类
```

---

### 16. frontend-design - 前端界面设计

**触发方式：** `/frontend-design`

**解决的问题：** 需要好看的 UI，但不会设计。

**它会生成：**

- 精美的 HTML/CSS
- 响应式布局
- 现代化设计风格
- 完整可运行的代码

**实际案例：**

```bash
/frontend-design 创建一个博客文章卡片组件，包含：
- 封面图
- 标题
- 摘要
- 标签
- 阅读时间
```

输出一个完整的、设计精美的卡片组件。

---

### 17. claude-api - Claude API 开发

**触发方式：** 涉及 Anthropic SDK 时自动触发

**支持的功能：**

- Prompt Caching
- Streaming
- Tool Use
- 多模态输入
- 模型版本迁移

**实际案例：**

```bash
# 从 4.5 迁移到 4.7
/claude-api 帮我把这个项目从 Claude 4.5 迁移到 4.7

# 优化 Prompt Caching
/claude-api 这个 API 调用成本太高，帮我加上 Prompt Caching
```

---

## 六、配置管理类

### 18. update-config - 更新配置

**触发方式：** `/update-config`

**解决的问题：** 想配置 Claude Code 但不知道怎么改 settings.json。

**支持的配置：**

- 权限设置
- 环境变量
- Hooks 配置
- 工具别名

**实际案例：**

```bash
# 添加权限
/update-config 允许运行 npm 命令

# 设置环境变量
/update-config 设置 DEBUG=true

# 配置 Hook
/update-config 当 Claude 停止时显示通知
```

---

### 19. keybindings-help - 键绑定自定义

**触发方式：** `/keybindings-help`

**解决的问题：** 想自定义快捷键。

**实际案例：**

```bash
# 修改提交键
/keybindings-help 把提交键从 Enter 改为 Cmd+Enter

# 添加快捷键
/keybindings-help 添加 Ctrl+S 保存当前文件
```

---

### 20. fewer-permission-prompts - 减少权限提示

**触发方式：** `/fewer-permission-prompts`

**解决的问题：** 每次执行命令都要确认，太烦了。

**它会：**

1. 扫描你的使用习惯
2. 识别常见的只读操作
3. 自动添加到白名单

**效果：**

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 每小时权限提示 | ~20 次 | ~2 次 |
| 开发流畅度 | 中断频繁 | 连续工作 |

---

## 七、其他实用 Skill

### 21. find-skills - 发现新 Skill

**触发方式：** `/find-skills`

**解决的问题：** 不知道有什么好用的 Skill。

```bash
# 找 PPT 相关的 Skill
/find-skills 有没有处理 PPT 的 Skill

# 找前端相关的 Skill
/find-skills 有没有设计 UI 的 Skill
```

---

### 22. write-a-skill - 编写自定义 Skill

**触发方式：** `/write-a-skill`

**解决的问题：** 现有 Skill 不满足需求，想自己写。

**实际案例：**

```bash
/write-a-skill 帮我写一个 Skill，功能是：
- 自动检查代码中的 console.log
- 替换为结构化日志
- 保留必要的调试日志
```

---

### 23. loop - 循环执行任务

**触发方式：** `/loop`

**解决的问题：** 需要定期检查某个状态。

```bash
# 每 5 分钟检查部署状态
/loop 5m 检查部署状态

# 每 10 分钟运行测试
/loop 10m 运行测试套件
```

---

### 24. init - 项目初始化

**触发方式：** `/init`

**解决的问题：** 新项目不知道怎么配置 Claude Code。

**它会：**

1. 分析项目类型
2. 生成 CLAUDE.md
3. 配置 settings.json
4. 设置推荐的 hooks

---

### 25. performance - 性能优化

**触发方式：** `/performance`

**解决的问题：** 代码运行慢，不知道哪里有问题。

**它会分析：**

- 时间复杂度
- 空间复杂度
- I/O 瓶颈
- 内存泄漏

**实际案例：**

```bash
/performance 这个函数执行太慢了，帮我优化

# 输出：
# 1. 算法从 O(n²) 优化到 O(n)
# 2. 减少不必要的内存分配
# 3. 添加缓存
```

---

## 我的 Skill 组合工作流

经过这段时间的使用，我形成了一套固定工作流：

### 日常开发流程

```
1. /grill-me          → 澄清需求
   ↓
2. /openspec-propose  → 生成 Spec
   ↓
3. /tdd               → 写测试
   ↓
4. 写代码
   ↓
5. /simplify          → 优化代码
   ↓
6. /review            → 代码审查
   ↓
7. /security-review   → 安全检查
   ↓
8. /openspec-archive  → 归档变更
   ↓
9. /caveman           → 压缩输出（长对话时）
```

### Bug 修复流程

```
1. /diagnose          → 诊断问题
   ↓
2. 写修复代码
   ↓
3. /tdd               → 写回归测试
   ↓
4. /review            → 审查修复
```

### 项目管理流程

```
1. 有想法
   ↓
2. /to-prd            → 生成 PRD
   ↓
3. /to-issues         → 拆分为 Issue
   ↓
4. 逐个实现
   ↓
5. /openspec-archive  → 归档
```

---

## Token 成本统计

以一个完整功能开发为例：

| 阶段 | Skill | Token 消耗 |
|------|-------|------------|
| 需求澄清 | grill-me | ~500 |
| 规划 | openspec-propose | ~1000 |
| 写测试 | tdd | ~800 |
| 写代码 | 普通模式 | ~2000 |
| 优化 | simplify | ~1500 |
| 审查 | review | ~500 |
| 安全检查 | security-review | ~400 |
| 输出 | caveman | ~200 |

**总计：** ~6900 tokens

**如果不使用 Skill：** ~12000 tokens（估算）

**节省：** ~43%

---

## 我的使用建议

### 按场景选 Skill

| 场景 | 推荐 Skill |
|------|-----------|
| 需求不清楚 | `/grill-me` |
| 代码优化 | `/simplify` |
| Bug 诊断 | `/diagnose` |
| 安全检查 | `/security-review` |
| 写测试 | `/tdd` |
| 代码审查 | `/review` |
| 长对话 | `/caveman` |
| 项目规划 | `/openspec-propose` |
| 前端设计 | `/frontend-design` |
| PPT 处理 | `/pptx` |

### 组合使用

```
/grill-me → /tdd → 写代码 → /simplify → /review → /security-review
```

### 新手入门

先掌握这 5 个：

1. `/simplify` - 代码优化
2. `/caveman` - 压缩输出
3. `/review` - 代码审查
4. `/tdd` - 写测试
5. `/grill-me` - 需求澄清

然后再逐步探索其他 Skill。

---

## 总结

30+ 个 Skill，覆盖了我日常开发的方方面面：

| 类别 | 核心 Skill | 解决的问题 |
|------|-----------|-----------|
| 代码质量 | simplify, karpathy-guidelines | 代码优化、避免错误 |
| 开发流程 | tdd, review, security-review | 测试、审查、安全 |
| 沟通效率 | caveman, grill-me | 压缩输出、需求澄清 |
| 项目管理 | openspec, to-issues | 规范驱动、Issue 管理 |
| 工具集成 | pptx, frontend-design | PPT、前端设计 |

Skill 不是花哨的功能，是实实在在的效率工具。

用好它们，开发效率至少提升 50%。

---

## 参考资料

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [OpenSpec 项目](https://github.com/fission-ai/openspec)
- [本文源码](https://github.com/liqingyun/my-blog)
