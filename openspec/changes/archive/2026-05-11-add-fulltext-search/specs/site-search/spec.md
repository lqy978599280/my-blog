## ADDED Requirements

### Requirement: 全文搜索索引生成

系统 SHALL 在构建时自动生成全文搜索索引文件，包含所有已发布文章的标题、内容、标签和分类信息。

#### Scenario: 构建时生成搜索索引
- **WHEN** 执行 `pnpm build` 构建站点
- **THEN** 系统 SHALL 在输出目录中生成 JSON 格式的搜索索引文件
- **AND** 索引 SHALL 包含所有 `source/_posts/` 下已发布文章的内容

#### Scenario: 中文内容索引
- **WHEN** 文章包含中文内容
- **THEN** 搜索索引 SHALL 对中文进行分词处理
- **AND** 搜索"AI" SHALL 匹配包含"AI探索"的文章

### Requirement: 搜索 UI 组件

站点 SHALL 提供一个内嵌的搜索 UI 组件，用户输入关键词后实时展示匹配结果。

#### Scenario: 打开搜索面板
- **WHEN** 用户点击导航栏的搜索图标
- **THEN** 系统 SHALL 展开搜索输入框
- **AND** 输入框 SHALL 自动获得焦点

#### Scenario: 实时搜索
- **WHEN** 用户在搜索框中输入关键词
- **THEN** 系统 SHALL 实时展示匹配的文章列表
- **AND** 每条结果 SHALL 显示文章标题和摘要
- **AND** 点击结果 SHALL 跳转到对应文章页面

#### Scenario: 无结果提示
- **WHEN** 用户输入的关键词无匹配结果
- **THEN** 系统 SHALL 显示"未找到相关文章"提示

### Requirement: 搜索入口位置

搜索功能 SHALL 通过导航栏的搜索图标触发，替换现有的 Google 搜索跳转行为。

#### Scenario: 搜索入口可见性
- **WHEN** 用户访问任意页面
- **THEN** 导航栏 SHALL 显示搜索图标
- **AND** 点击搜索图标 SHALL 在当前页面内打开搜索面板（不跳转外部页面）
