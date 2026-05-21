## Why

当前博客是纯静态网站，访客只能被动阅读内容，缺乏互动性。集成AI智能助手可以让访客主动提问，获得个性化的回答和内容推荐，提升用户体验和参与度。小米mimo-v2.5-pro模型提供了强大的中文理解能力，非常适合中文博客场景。

## What Changes

- 在博客右下角添加可折叠的AI聊天窗口
- 支持访客输入问题，AI根据博客内容进行回答
- 集成小米mimo-v2.5-pro模型API（Anthropic SDK格式）
- 聊天窗口支持Markdown渲染，代码高亮
- 添加预设问题引导访客互动
- 聊天记录保持在当前会话中

## Capabilities

### New Capabilities
- `ai-chat-widget`: AI聊天窗口组件，包含UI交互、消息展示、API调用逻辑
- `ai-content-context`: 博客内容上下文管理，提取文章摘要作为AI回答的参考依据

### Modified Capabilities
<!-- 无需修改现有能力的规格 -->

## Impact

- **代码变更**: `scripts/inject-custom.js` 需要注入聊天UI和API调用脚本
- **新增依赖**: 无需新增npm依赖，使用原生fetch API调用
- **API集成**: 需要配置小米API endpoint和模型信息
- **构建流程**: 无影响，仍通过inject-custom.js后处理注入
- **性能影响**: 聊天功能按需加载，不影响首屏渲染
