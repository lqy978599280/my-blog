# AI探索笔记

一个记录 AI 工具使用、学习心得和技术实践的个人博客，基于 Hexo 构建，部署在 GitHub Pages。

## 特性

- **Neural Dark 暗色主题** — 深色科技风格，粒子网络动画背景
- **全文搜索** — 支持文章标题、内容、标签和分类的本地搜索
- **滚动动效** — 文章卡片滚动渐入动画
- **响应式布局** — 适配桌面和移动端

## 技术栈

- [Hexo](https://hexo.io/) v8 — 静态博客框架
- Landscape 主题（深度定制）
- GitHub Pages — 托管部署
- GitHub Actions — 自动构建发布

## 本地开发

```bash
# 安装依赖
pnpm install

# 本地预览
pnpm server

# 构建（含自定义注入）
pnpm build

# 清理
pnpm clean
```

## 项目结构

```
├── source/              # 文章和页面
│   └── _posts/          # Markdown 文章
├── themes/landscape/    # 定制主题
│   ├── layout/          # EJS 模板
│   └── source/          # 静态资源（CSS/JS/图片）
├── scripts/
│   └── inject-custom.js # 构建后注入（粒子动画、搜索UI、滚动动效）
└── .github/workflows/
    └── deploy.yml       # GitHub Actions 自动部署
```

## 写作

在 `source/_posts/` 下创建 Markdown 文件：

```markdown
---
title: 文章标题
date: 2026-05-11
tags:
  - AI
categories:
  - AI工具
---

正文内容...
```

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

站点地址：[https://lqy978599280.github.io/my-blog](https://lqy978599280.github.io/my-blog)
