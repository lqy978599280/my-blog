---
title: 实战：用代码生成PPT——以我的博客介绍为例
date: 2026-05-25 11:30:00
tags:
  - PPT
  - PptxGenJS
  - 自动化
  - 前端工具
categories:
  - 技术实践
---

## 前言

最近在工作中要实现好几个ppt，苦于没有找到比较好的做ppt的功能，在这个博客里研究下。

本来想直接用 PowerPoint 手动做，但一想到要调格式、对齐、配色就头大。而且如果以后内容更新了，又得重新改一遍。

于是我琢磨了一下：**能不能用代码自动生成PPT？**

这篇文章就记录了我的探索过程——从方案对比、设计思路，到最终用 PptxGenJS 生成一份 7 页深色科技风格PPT的完整实践。

---

## 方案选型：三种主流方案对比

在动手之前，我先调研了三种主流的PPT生成方案：

| 方案 | 工具 | 优点 | 缺点 |
|------|------|------|------|
| Python-pptx | python-pptx | Python生态丰富，模板操作灵活 | 需要Python环境，样式控制较繁琐 |
| PptxGenJS | pptxgenjs | Node.js原生，API简洁，样式丰富 | 模板编辑能力较弱 |
| Office XML | 直接操作OOXML | 完全控制，无依赖 | 门槛极高，开发效率低 |

我的博客项目本身就是 Node.js 生态（Hexo + Vite），所以自然倾向于 JavaScript 方案。对比下来，**PptxGenJS** 的 API 设计最直观，样式控制能力也足够强，就选它了。

```bash
pnpm add pptxgenjs
```

---

## 设计思路

### 页面结构

我规划了 7 页内容：

1. **封面页** - 标题 + 技术栈标签
2. **博客概览** - 双栏布局，左侧介绍定位，右侧展示技术栈
3. **AI智能助手** - 卡片 + 架构流程图
4. **搜索与动画** - 三列功能卡片
5. **技术架构** - 四阶段流程图
6. **博客文章** - 列表式文章展示
7. **总结展望** - 双栏对比

### 视觉风格

我选择了一套深色科技风格的配色方案，深色背景 + 明亮的强调色，适合科技类内容的展示：

```javascript
const COLORS = {
  bgDark: "0F1629",       // 深海蓝背景
  bgCard: "1E293B",       // 卡片背景
  primary: "3B82F6",      // 电光蓝
  secondary: "06B6D4",    // 青色
  accent: "10B981",       // 翠绿
  accentOrange: "F59E0B", // 琥珀
  textWhite: "FFFFFF",
  textMuted: "94A3B8",
};
```

---

## 实战：核心代码实现

### 基础结构

```javascript
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";  // 16:9 宽屏
pres.author = "liqingyun";
pres.title = "AI探索笔记 - 个人博客网站介绍";
```

### 封面页

封面页需要包含标题、副标题和技术栈标签。核心思路是通过坐标系统精确控制元素位置：

```javascript
const slide = pres.addSlide();
slide.background = { color: "0F1629" };

// 顶部装饰线
slide.addShape("rect", {
  x: 0, y: 0, w: 10, h: 0.04,
  fill: { color: "3B82F6" },
});

// 主标题
slide.addText("AI探索笔记", {
  x: 0.6, y: 1.2, w: 8.5, h: 1.0,
  fontSize: 48,
  color: "FFFFFF",
  bold: true,
});

// 副标题
slide.addText("个人博客网站介绍", {
  x: 0.6, y: 2.1, w: 8.5, h: 0.6,
  fontSize: 24,
  color: "06B6D4",
});

// 技术栈标签
const tags = ["Hexo 8.1", "Vue 3", "Vite", "GitHub Pages"];
tags.forEach((tag, i) => {
  slide.addShape("rect", {
    x: 0.6 + i * 1.8, y: 3.6, w: 1.5, h: 0.35,
    fill: { color: "3B82F6", transparency: 70 },
  });
  slide.addText(tag, {
    x: 0.6 + i * 1.8, y: 3.6, w: 1.5, h: 0.35,
    fontSize: 10, color: "3B82F6",
    align: "center", valign: "middle",
  });
});
```

### 卡片式内容页

对于功能介绍类的页面，我用卡片式布局来组织内容，封装了一个通用的卡片函数：

```javascript
function addFeatureCard(slide, x, y, w, h, icon, title, desc, color) {
  // 卡片背景
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: "1E293B" },
  });
  // 左侧彩色条
  slide.addShape("rect", {
    x, y, w: 0.06, h,
    fill: { color },
  });
  // 标题
  slide.addText(title, {
    x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.4,
    fontSize: 14, color: "FFFFFF", bold: true,
  });
  // 描述
  slide.addText(desc, {
    x: x + 0.25, y: y + 0.75, w: w - 0.5, h: h - 1.0,
    fontSize: 11, color: "94A3B8",
  });
}
```

### 流程图式架构页

技术架构页用四阶段流程图展示构建过程：

```javascript
const stages = [
  { step: "01", title: "内容编写", desc: "Markdown 文章\nHexo 配置" },
  { step: "02", title: "组件编译", desc: "Vite 编译 Vue 3\n生成 IIFE Bundle" },
  { step: "03", title: "静态生成", desc: "Hexo 生成 HTML\n脚本注入组件" },
  { step: "04", title: "部署上线", desc: "GitHub Pages\n自动构建部署" },
];

stages.forEach((stage, i) => {
  const x = 0.5 + i * 2.35;
  // 卡片 + 编号 + 标题 + 描述
  // 中间用箭头连接
});
```

### 输出文件

```javascript
await pres.writeFile({ fileName: "ai-blog-intro.pptx" });
```

完整代码已放在项目的 `scripts/create-pptx.js` 文件中，运行 `node scripts/create-pptx.js` 即可生成。

---

## 踩坑经验：几个关键技巧

### 1. 坐标系统

PptxGenJS 使用英寸作为单位，16:9 布局的画布是 **10英寸 x 5.625英寸**。所有元素都通过 `x, y, w, h` 四个参数定位。

刚开始我用像素思维去算位置，结果发现偏移得离谱。后来换成英寸，一切就对了。

### 2. 避免对象复用

这是一个坑！PptxGenJS 会**原地修改**传入的对象（比如把 shadow 的值转成 EMU），所以不能在多个元素之间共享同一个配置对象：

```javascript
// 错误 - 第二次调用会拿到已转换的值
const shadow = { type: "outer", blur: 6, offset: 2, color: "000000", opacity: 0.15 };
slide.addShape("rect", { shadow, ... });
slide.addShape("rect", { shadow, ... });  // 损坏！

// 正确 - 每次创建新对象
const makeShadow = () => ({ type: "outer", blur: 6, offset: 2, color: "000000", opacity: 0.15 });
slide.addShape("rect", { shadow: makeShadow(), ... });
slide.addShape("rect", { shadow: makeShadow(), ... });
```

我一开始就是犯了这个错误，生成的PPT打开时部分样式丢失，排查了好一会儿才发现是对象复用的问题。

### 3. 颜色格式

颜色值**不要加 `#` 前缀**，直接用6位十六进制：

```javascript
color: "FF0000"    // 正确
color: "#FF0000"   // 错误，会导致文件损坏
```

### 4. 透明度控制

不要在颜色字符串中编码透明度（如 `"00000020"`），使用 `transparency` 属性：

```javascript
fill: { color: "3B82F6", transparency: 70 }  // 70% 透明
```

---

## 最终效果

生成的PPT共7页，采用深色科技风格：

1. **封面页** - 标题与技术栈标签
2. **博客概览** - 双栏布局展示定位与技术栈
3. **AI智能助手** - 卡片 + 架构流程图
4. **搜索与动画** - 三列功能卡片
5. **技术架构** - 四阶段流程图
6. **博客文章** - 列表式文章展示
7. **总结展望** - 双栏对比

整体效果还不错，深海蓝背景配上电光蓝、青色、翠绿的强调色，视觉上挺有科技感的。

---

## 延伸：模板化方案

如果你需要**基于模板批量生成**，可以进一步抽象：

1. **定义数据模板**：用 JSON 或 YAML 定义每页的内容
2. **编写渲染函数**：根据模板类型（封面、卡片、列表等）自动选择布局
3. **批量生成**：遍历数据列表，每个数据项生成一个PPT

```javascript
// 数据模板示例
const slides = [
  { type: "cover", title: "...", subtitle: "..." },
  { type: "features", items: [{ title: "...", desc: "..." }] },
  { type: "summary", left: "...", right: "..." },
];

// 批量渲染
slides.forEach(config => {
  const slide = pres.addSlide();
  renderers[config.type](slide, config);
});
```

这样，你只需要修改数据文件，就能快速生成结构相同、内容不同的PPT。

---

## 总结

用代码生成PPT并不是什么新鲜事，但在实际项目中确实能省下不少重复劳动。特别是当你需要制作一系列风格统一的演示文稿时，模板化方案的优势就体现出来了。

PptxGenJS 的 API 设计足够直观，上手很快，适合前端开发者使用。如果你也有类似需求，不妨试试这个方案。

核心流程就一句话：

```
pnpm add pptxgenjs → 编写生成脚本（坐标定位 + 样式配置）→ node 运行输出 .pptx
```

---

## 参考资料

- [PptxGenJS 官方文档](https://gitbrent.github.io/PptxGenJS/)
- [PptxGenJS API 参考](https://gitbrent.github.io/PptxGenJS/docs/api-text/)
- 本文配套的PPT文件：`ai-blog-intro.pptx`
- 完整代码：`scripts/create-pptx.js`
