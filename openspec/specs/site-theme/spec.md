# 站点主题与部署

## 概述

博客采用自定义的 Neural Dark 暗色主题，通过 GitHub Actions 自动部署到 GitHub Pages。

## 需求

- 站点 SHALL 使用暗色主题（背景 #0a0e17，强调色 #00f0ff）
- 站点 SHALL 包含 Header 粒子网络动画效果
- 文章卡片 SHALL 具备滚动渐显和悬停发光动效
- 站点 SHALL 使用 Sora 字体（标题）和 JetBrains Mono（代码）
- 站点 SHALL 通过 GitHub Actions 自动构建和部署
- 构建产物 SHALL 注入自定义 CSS 动画和粒子脚本

## 场景：自动部署

GIVEN 代码推送到 main 分支
WHEN GitHub Actions 触发
THEN 系统 SHALL 执行 `pnpm build` 构建
AND 构建产物 SHALL 部署到 GitHub Pages

## 场景：自定义样式注入

GIVEN `scripts/inject-custom.js` 存在
WHEN 执行 `pnpm build`
THEN 系统 SHALL 先执行 `hexo generate`
THEN 系统 SHALL 执行注入脚本，将自定义 CSS 和 JS 注入到所有 HTML 文件

## 技术约束

- 主题目录：`themes/landscape/`
- 注入脚本：`scripts/inject-custom.js`
- CI 配置：`.github/workflows/deploy.yml`
- 博客地址：https://lqy978599280.github.io/my-blog/
