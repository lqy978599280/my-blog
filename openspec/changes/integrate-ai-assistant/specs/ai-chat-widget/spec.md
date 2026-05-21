## ADDED Requirements

### Requirement: Chat button visibility
博客页面右下角 SHALL 显示一个悬浮聊天按钮，使用AI/机器人图标。按钮 SHALL 使用博客主题的青色（#00f0ff）作为强调色。

#### Scenario: Page load
- **WHEN** 用户访问博客任意页面
- **THEN** 右下角显示半透明的聊天按钮，带轻微呼吸动画

#### Scenario: Button hover
- **WHEN** 用户鼠标悬停在聊天按钮上
- **THEN** 按钮变为完全不透明，显示"AI助手"提示文字

### Requirement: Chat window open/close
点击聊天按钮 SHALL 打开聊天窗口，再次点击或点击关闭按钮 SHALL 关闭聊天窗口。

#### Scenario: Open chat window
- **WHEN** 用户点击聊天按钮
- **THEN** 从按钮位置展开聊天窗口，窗口标题显示"AI探索助手"

#### Scenario: Close chat window
- **WHEN** 用户点击聊天窗口的关闭按钮或再次点击聊天按钮
- **THEN** 聊天窗口收起，回到按钮状态

#### Scenario: Close with Escape key
- **WHEN** 聊天窗口打开时用户按下Escape键
- **THEN** 聊天窗口关闭

### Requirement: Message input and sending
用户 SHALL 能够在输入框中输入问题并发送。支持Enter键发送，Shift+Enter换行。

#### Scenario: Send message
- **WHEN** 用户在输入框输入文字并按Enter或点击发送按钮
- **THEN** 消息显示在聊天区域，显示加载动画，等待AI响应

#### Scenario: Empty message
- **WHEN** 用户尝试发送空消息
- **THEN** 发送按钮禁用，不发送请求

#### Scenario: Multiline input
- **WHEN** 用户按Shift+Enter换行
- **THEN** 输入框支持多行输入，不触发发送

### Requirement: AI response display
AI的回复 SHALL 以Markdown格式渲染，支持代码块语法高亮。

#### Scenario: Successful response
- **WHEN** API返回成功响应
- **THEN** AI回复以Markdown格式显示在聊天区域，代码块带语法高亮

#### Scenario: Loading state
- **WHEN** 等待API响应时
- **THEN** 显示打字动画的加载指示器

#### Scenario: Error handling
- **WHEN** API调用失败（网络错误、超时、服务端错误）
- **THEN** 显示友好的错误提示，提供重试按钮

#### Scenario: Response timeout
- **WHEN** API响应超过30秒
- **THEN** 显示超时提示，提供重试按钮

### Requirement: Preset questions
聊天窗口打开时 SHALL 显示预设问题引导用户，点击预设问题直接发送。

#### Scenario: Show presets
- **WHEN** 聊天窗口首次打开或清空对话后
- **THEN** 显示3-4个预设问题按钮，如"推荐一篇文章"、"解释一下AI技术"

#### Scenario: Click preset
- **WHEN** 用户点击某个预设问题
- **THEN** 该问题自动填入并发送

### Requirement: Chat window styling
聊天窗口 SHALL 使用博客的暗色主题配色，与整体风格一致。

#### Scenario: Theme consistency
- **WHEN** 聊天窗口渲染
- **THEN** 背景使用深色（#0d1117），文字使用浅色，强调色使用青色（#00f0ff）

#### Scenario: Responsive design
- **WHEN** 在移动设备上查看
- **THEN** 聊天窗口全屏展示，提供更好的移动端体验
