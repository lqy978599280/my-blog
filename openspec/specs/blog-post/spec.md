# 文章管理

## 概述

博客基于 Hexo 静态站点生成器，使用 Markdown 格式编写文章，通过 `hexo generate` 构建为静态 HTML 文件，部署到 GitHub Pages。

## 需求

- 系统 SHALL 支持 Markdown 格式的文章编写与发布
- 文章 SHALL 存放在 `source/_posts/` 目录下，文件扩展名为 `.md`
- 文章 SHALL 包含 YAML Front Matter 元数据（title, date, tags, categories）
- 系统 SHALL 按日期倒序在首页展示文章列表
- 系统 SHALL 支持按标签（tags）和分类（categories）组织文章
- 系统 SHALL 支持文章摘要（excerpt），首页仅展示摘要和"阅读全文"链接

## 场景：发布新文章

GIVEN 管理员在 `source/_posts/` 目录下创建了新的 `.md` 文件
AND 文件包含有效的 YAML Front Matter
WHEN 执行 `pnpm build` 构建
THEN 新文章 SHALL 出现在首页文章列表中
AND 文章 SHALL 按日期倒序排列

## 场景：文章标签与分类

GIVEN 文章的 Front Matter 中定义了 tags 和 categories
WHEN 构建站点
THEN 系统 SHALL 生成对应的标签页和分类页
AND 文章 SHALL 在对应标签/分类页面中展示

## 场景：中文内容展示

GIVEN 文章内容包含中文字符
WHEN 访问文章页面
THEN 中文内容 SHALL 正确显示
AND 页面 SHALL 使用 `zh-CN` 语言设置

## 技术约束

- 静态站点生成器：Hexo 8.x
- 主题：landscape（自定义 Neural Dark 暗色主题）
- 部署目标：GitHub Pages
- 构建命令：`pnpm build`（hexo generate + 自定义注入脚本）
