## 1. 依赖安装与配置

- [x] 1.1 安装 `hexo-generator-searchdb` 依赖
- [x] 1.2 在 `_config.yml` 中添加搜索索引配置（JSON 格式、post 范围、striptags 内容）

## 2. 搜索 UI 组件

- [x] 2.1 创建搜索 UI 的 CSS 样式（搜索面板、输入框、结果列表、暗色主题适配）
- [x] 2.2 创建搜索 UI 的 JavaScript 逻辑（加载索引、实时过滤、结果渲染）
- [x] 2.3 将搜索 CSS 和 JS 注入到 `scripts/inject-custom.js` 中

## 3. 主题模板集成

- [x] 3.1 修改导航栏搜索图标的行为，从 Google 搜索跳转改为打开站内搜索面板
- [x] 3.2 添加搜索面板的 HTML 结构（在 inject 脚本中注入）

## 4. 验证与测试

- [x] 4.1 执行 `pnpm build` 验证搜索索引文件生成
- [x] 4.2 本地预览验证搜索功能（中文搜索、实时结果、点击跳转）
- [x] 4.3 验证暗色主题下搜索 UI 的视觉效果
