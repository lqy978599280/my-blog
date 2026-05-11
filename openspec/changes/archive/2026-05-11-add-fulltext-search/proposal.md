## Why

博客目前没有搜索功能，读者只能通过浏览首页或按标签/分类筛选来查找文章。随着文章数量增长，找到特定内容会越来越困难。添加全文搜索功能可以让读者快速定位感兴趣的内容，提升用户体验。

## What Changes

- 新增基于 hexo-generator-searchdb 的本地全文搜索功能
- 在导航栏集成搜索入口，替换现有的 Google 搜索跳转
- 支持中文分词，确保中文文章可被正确搜索
- 搜索结果实时展示，无需跳转外部页面

## Capabilities

### New Capabilities

- `site-search`: 博客站内全文搜索功能，包括搜索索引生成、搜索 UI 组件、中文分词支持

### Modified Capabilities

- `blog-post`: 文章元数据中需要确保 summary/excerpt 被正确索引

## Impact

- 新增依赖：`hexo-generator-searchdb`（搜索索引生成）
- 修改文件：`_config.yml`（添加搜索配置）、主题模板（集成搜索 UI）
- 构建流程：索引文件将在 `hexo generate` 时自动生成
- 无破坏性变更，现有功能不受影响
