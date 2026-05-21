## ADDED Requirements

### Requirement: Article summary extraction
构建时 SHALL 提取每篇文章的前500字作为摘要，存入JSON文件供AI参考。

#### Scenario: Build time extraction
- **WHEN** 执行`pnpm build`生成静态文件
- **THEN** 自动生成`search.json`同级的`ai-context.json`文件

#### Scenario: Summary content
- **WHEN** 提取文章摘要
- **THEN** 包含文章标题、分类、标签、前500字正文内容

#### Scenario: Draft exclusion
- **WHEN** 文章标记为draft
- **THEN** 不包含在摘要文件中

### Requirement: Context injection to AI
发送给AI的请求 SHALL 包含博客内容摘要作为上下文，使AI能够基于博客内容回答。

#### Scenario: API request context
- **WHEN** 用户发送问题
- **THEN** 请求的system prompt包含博客摘要信息

#### Scenario: Context format
- **WHEN** 构造API请求
- **THEN** system prompt格式为：你是AI探索笔记博客的助手，以下是博客文章摘要：{摘要内容}，请基于这些内容回答用户问题。

#### Scenario: Fallback without context
- **WHEN** 上下文文件加载失败
- **THEN** 使用通用system prompt，仍能正常回答但不基于特定博客内容

### Requirement: Context file loading
聊天组件 SHALL 在初始化时加载上下文文件，加载失败不影响基本功能。

#### Scenario: Successful load
- **WHEN** 聊天组件初始化
- **THEN** 异步加载`ai-context.json`文件

#### Scenario: Load failure
- **WHEN** 上下文文件加载失败
- **THEN** 记录警告日志，使用默认空上下文继续运行

#### Scenario: File not found
- **WHEN** 上下文文件不存在
- **THEN** 视为加载失败，使用默认空上下文

### Requirement: Content freshness
上下文文件 SHALL 反映最新构建时的博客内容。

#### Scenario: New article added
- **WHEN** 添加新文章后重新构建
- **THEN** 新文章摘要自动包含在上下文文件中

#### Scenario: Article updated
- **WHEN** 修改文章内容后重新构建
- **THEN** 上下文文件中的摘要同步更新
