const pptxgen = require("pptxgenjs");

// ============================================================
// 颜色方案 - 深色科技风格
// ============================================================
const COLORS = {
  bgDark: "0F1629",       // 深海蓝背景
  bgCard: "1E293B",       // 卡片背景
  primary: "3B82F6",      // 电光蓝
  secondary: "06B6D4",    // 青色
  accent: "10B981",       // 翠绿
  accentOrange: "F59E0B", // 琥珀
  textWhite: "FFFFFF",
  textMuted: "94A3B8",
  textLight: "CBD5E1",
  border: "334155",
};

// ============================================================
// 工厂函数 - 避免对象复用导致的文件损坏
// ============================================================
const makeShadow = () => ({
  type: "outer",
  color: "000000",
  blur: 8,
  offset: 3,
  angle: 135,
  opacity: 0.25,
});

// ============================================================
// 辅助函数
// ============================================================

/**
 * 添加页面底部的装饰条
 */
function addFooterBar(slide) {
  slide.addShape("rect", {
    x: 0,
    y: 5.25,
    w: 10,
    h: 0.375,
    fill: { color: COLORS.primary, transparency: 80 },
  });
}

/**
 * 添加页面编号
 */
function addPageNumber(slide, num, total) {
  slide.addText(`${num} / ${total}`, {
    x: 8.5,
    y: 5.25,
    w: 1.2,
    h: 0.375,
    fontSize: 10,
    color: COLORS.textMuted,
    align: "center",
    valign: "middle",
  });
}

/**
 * 添加左侧彩色装饰条
 */
function addAccentBar(slide, x, y, h, color) {
  slide.addShape("rect", {
    x: x,
    y: y,
    w: 0.06,
    h: h,
    fill: { color: color },
  });
}

/**
 * 添加功能卡片（带图标占位符）
 */
function addFeatureCard(slide, x, y, w, h, iconChar, title, desc, accentColor) {
  // 卡片背景
  slide.addShape("rect", {
    x: x,
    y: y,
    w: w,
    h: h,
    fill: { color: COLORS.bgCard },
    shadow: makeShadow(),
  });

  // 左侧彩色条
  addAccentBar(slide, x, y, h, accentColor);

  // 图标圆形背景
  slide.addShape("oval", {
    x: x + 0.25,
    y: y + 0.25,
    w: 0.5,
    h: 0.5,
    fill: { color: accentColor, transparency: 80 },
  });

  // 图标文字
  slide.addText(iconChar, {
    x: x + 0.25,
    y: y + 0.25,
    w: 0.5,
    h: 0.5,
    fontSize: 18,
    color: accentColor,
    align: "center",
    valign: "middle",
    bold: true,
  });

  // 标题
  slide.addText(title, {
    x: x + 0.9,
    y: y + 0.2,
    w: w - 1.1,
    h: 0.4,
    fontSize: 14,
    color: COLORS.textWhite,
    bold: true,
    valign: "middle",
    margin: 0,
  });

  // 描述
  slide.addText(desc, {
    x: x + 0.25,
    y: y + 0.75,
    w: w - 0.5,
    h: h - 1.0,
    fontSize: 11,
    color: COLORS.textMuted,
    valign: "top",
    lineSpacingMultiple: 1.3,
  });
}

// ============================================================
// 主函数 - 生成PPT
// ============================================================
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "liqingyun";
  pres.title = "AI探索笔记 - 个人博客网站介绍";

  const TOTAL_SLIDES = 7;

  // ==========================================================
  // Slide 1: 封面页
  // ==========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bgDark };

    // 顶部装饰线
    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: 10,
      h: 0.04,
      fill: { color: COLORS.primary },
    });

    // 左侧大装饰块
    slide.addShape("rect", {
      x: 0,
      y: 1.0,
      w: 0.12,
      h: 2.5,
      fill: { color: COLORS.accent },
    });

    // 主标题
    slide.addText("AI探索笔记", {
      x: 0.6,
      y: 1.2,
      w: 8.5,
      h: 1.0,
      fontSize: 48,
      fontFace: "Microsoft YaHei",
      color: COLORS.textWhite,
      bold: true,
      margin: 0,
    });

    // 副标题
    slide.addText("个人博客网站介绍", {
      x: 0.6,
      y: 2.1,
      w: 8.5,
      h: 0.6,
      fontSize: 24,
      fontFace: "Microsoft YaHei",
      color: COLORS.secondary,
      margin: 0,
    });

    // 技术栈标签
    slide.addText("基于 Hexo + Vue3 的现代化博客架构", {
      x: 0.6,
      y: 3.0,
      w: 8.5,
      h: 0.4,
      fontSize: 14,
      color: COLORS.textMuted,
      margin: 0,
    });

    // 技术标签徽章
    const tags = ["Hexo 8.1", "Vue 3", "Vite", "GitHub Pages"];
    tags.forEach((tag, i) => {
      slide.addShape("rect", {
        x: 0.6 + i * 1.8,
        y: 3.6,
        w: 1.5,
        h: 0.35,
        fill: { color: COLORS.primary, transparency: 70 },
      });
      slide.addText(tag, {
        x: 0.6 + i * 1.8,
        y: 3.6,
        w: 1.5,
        h: 0.35,
        fontSize: 10,
        color: COLORS.primary,
        align: "center",
        valign: "middle",
      });
    });

    // 底部信息
    slide.addText("lqy978599280.github.io/my-blog", {
      x: 0.6,
      y: 4.8,
      w: 5,
      h: 0.3,
      fontSize: 11,
      color: COLORS.textMuted,
    });

    addFooterBar(slide);
  }

  // ==========================================================
  // Slide 2: 博客概览
  // ==========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bgDark };

    // 页面标题
    slide.addText("博客概览", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 32,
      fontFace: "Microsoft YaHei",
      color: COLORS.textWhite,
      bold: true,
      margin: 0,
    });

    addAccentBar(slide, 0.5, 1.05, 0.04, COLORS.primary);

    // 左侧 - 博客定位
    slide.addShape("rect", {
      x: 0.5,
      y: 1.3,
      w: 4.2,
      h: 3.5,
      fill: { color: COLORS.bgCard },
      shadow: makeShadow(),
    });
    addAccentBar(slide, 0.5, 1.3, 3.5, COLORS.accent);

    slide.addText("博客定位", {
      x: 0.8,
      y: 1.5,
      w: 3.6,
      h: 0.5,
      fontSize: 18,
      color: COLORS.accent,
      bold: true,
      margin: 0,
    });

    slide.addText(
      [
        { text: "AI探索笔记", options: { bold: true, color: COLORS.textWhite, breakLine: true } },
        { text: "是一本关于 AI 工具使用、学习和技术实践的个人博客。", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "记录从零开始探索 AI 世界的每一步，包括大模型应用、智能助手开发、自动化工具链搭建等实践经验。", options: {} },
      ],
      {
        x: 0.8,
        y: 2.1,
        w: 3.6,
        h: 2.4,
        fontSize: 12,
        color: COLORS.textLight,
        lineSpacingMultiple: 1.5,
        valign: "top",
      }
    );

    // 右侧 - 技术栈
    slide.addShape("rect", {
      x: 5.1,
      y: 1.3,
      w: 4.4,
      h: 3.5,
      fill: { color: COLORS.bgCard },
      shadow: makeShadow(),
    });
    addAccentBar(slide, 5.1, 1.3, 3.5, COLORS.primary);

    slide.addText("技术栈", {
      x: 5.4,
      y: 1.5,
      w: 3.8,
      h: 0.5,
      fontSize: 18,
      color: COLORS.primary,
      bold: true,
      margin: 0,
    });

    const techItems = [
      { name: "Hexo 8.1.2", desc: "静态博客生成器" },
      { name: "Vue 3", desc: "交互式组件框架" },
      { name: "Vite", desc: "前端构建工具" },
      { name: "GitHub Pages", desc: "免费托管部署" },
      { name: "pnpm", desc: "高效包管理器" },
    ];

    techItems.forEach((item, i) => {
      const yPos = 2.15 + i * 0.5;
      slide.addShape("oval", {
        x: 5.5,
        y: yPos,
        w: 0.15,
        h: 0.15,
        fill: { color: COLORS.secondary },
      });
      slide.addText(item.name, {
        x: 5.8,
        y: yPos - 0.1,
        w: 1.5,
        h: 0.35,
        fontSize: 12,
        color: COLORS.textWhite,
        bold: true,
        margin: 0,
      });
      slide.addText(item.desc, {
        x: 7.2,
        y: yPos - 0.1,
        w: 2.0,
        h: 0.35,
        fontSize: 11,
        color: COLORS.textMuted,
        margin: 0,
      });
    });

    addFooterBar(slide);
    addPageNumber(slide, 2, TOTAL_SLIDES);
  }

  // ==========================================================
  // Slide 3: 核心功能 - AI智能助手
  // ==========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bgDark };

    slide.addText("核心功能：AI 智能助手", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 32,
      fontFace: "Microsoft YaHei",
      color: COLORS.textWhite,
      bold: true,
      margin: 0,
    });

    addAccentBar(slide, 0.5, 1.05, 0.04, COLORS.accentOrange);

    // 左侧 - 功能介绍
    slide.addShape("rect", {
      x: 0.5,
      y: 1.3,
      w: 5.5,
      h: 3.8,
      fill: { color: COLORS.bgCard },
      shadow: makeShadow(),
    });
    addAccentBar(slide, 0.5, 1.3, 3.8, COLORS.accentOrange);

    slide.addText("集成小米 mimo 大模型", {
      x: 0.8,
      y: 1.5,
      w: 5.0,
      h: 0.5,
      fontSize: 18,
      color: COLORS.accentOrange,
      bold: true,
      margin: 0,
    });

    slide.addText(
      [
        { text: "功能特点", options: { bold: true, color: COLORS.textWhite, breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "基于小米 mimo 大模型构建的 AI 聊天组件", options: { bullet: true, breakLine: true } },
        { text: "嵌入博客页面底部，随时唤起对话", options: { bullet: true, breakLine: true } },
        { text: "支持上下文理解的多轮对话", options: { bullet: true, breakLine: true } },
        { text: "可回答博客内容相关问题", options: { bullet: true, breakLine: true } },
        { text: "Vue 3 组件化开发，易于扩展", options: { bullet: true } },
      ],
      {
        x: 0.8,
        y: 2.2,
        w: 5.0,
        h: 2.5,
        fontSize: 12,
        color: COLORS.textLight,
        lineSpacingMultiple: 1.5,
        valign: "top",
      }
    );

    // 右侧 - 架构图示
    slide.addShape("rect", {
      x: 6.3,
      y: 1.3,
      w: 3.2,
      h: 3.8,
      fill: { color: COLORS.bgCard },
      shadow: makeShadow(),
    });

    slide.addText("组件架构", {
      x: 6.5,
      y: 1.5,
      w: 2.8,
      h: 0.4,
      fontSize: 14,
      color: COLORS.textWhite,
      bold: true,
      align: "center",
    });

    // 架构流程图
    const archItems = [
      { label: "AiChat.vue", color: COLORS.accentOrange },
      { label: "mimo API", color: COLORS.primary },
      { label: "对话管理", color: COLORS.secondary },
      { label: "UI 渲染", color: COLORS.accent },
    ];

    archItems.forEach((item, i) => {
      const yPos = 2.1 + i * 0.7;
      slide.addShape("rect", {
        x: 6.8,
        y: yPos,
        w: 2.2,
        h: 0.45,
        fill: { color: item.color, transparency: 70 },
      });
      slide.addText(item.label, {
        x: 6.8,
        y: yPos,
        w: 2.2,
        h: 0.45,
        fontSize: 11,
        color: COLORS.textWhite,
        align: "center",
        valign: "middle",
      });
      // 连接箭头
      if (i < archItems.length - 1) {
        slide.addText("↓", {
          x: 7.6,
          y: yPos + 0.45,
          w: 0.6,
          h: 0.25,
          fontSize: 14,
          color: COLORS.textMuted,
          align: "center",
        });
      }
    });

    addFooterBar(slide);
    addPageNumber(slide, 3, TOTAL_SLIDES);
  }

  // ==========================================================
  // Slide 4: 核心功能 - 搜索与动画
  // ==========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bgDark };

    slide.addText("核心功能：搜索与动画", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 32,
      fontFace: "Microsoft YaHei",
      color: COLORS.textWhite,
      bold: true,
      margin: 0,
    });

    addAccentBar(slide, 0.5, 1.05, 0.04, COLORS.secondary);

    // 三列卡片布局
    const features = [
      {
        icon: "S",
        title: "全文搜索",
        desc: "基于 hexo-generator-searchdb 实现，支持文章标题、内容、标签的全文检索，毫秒级响应。",
        color: COLORS.primary,
      },
      {
        icon: "P",
        title: "粒子动画背景",
        desc: "ParticleCanvas.vue 组件为网站 Header 区域添加动态粒子效果，增强视觉吸引力。",
        color: COLORS.accent,
      },
      {
        icon: "R",
        title: "滚动揭示动画",
        desc: "useScrollReveal.js 组合式函数为页面内容添加入场动画，提升用户体验。",
        color: COLORS.accentOrange,
      },
    ];

    features.forEach((feat, i) => {
      const x = 0.5 + i * 3.1;
      addFeatureCard(slide, x, 1.3, 2.8, 3.5, feat.icon, feat.title, feat.desc, feat.color);
    });

    addFooterBar(slide);
    addPageNumber(slide, 4, TOTAL_SLIDES);
  }

  // ==========================================================
  // Slide 5: 技术架构
  // ==========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bgDark };

    slide.addText("技术架构", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 32,
      fontFace: "Microsoft YaHei",
      color: COLORS.textWhite,
      bold: true,
      margin: 0,
    });

    addAccentBar(slide, 0.5, 1.05, 0.04, COLORS.primary);

    // 架构流程 - 4个阶段
    const stages = [
      {
        step: "01",
        title: "内容编写",
        desc: "Markdown 文章\nHexo 配置",
        color: COLORS.primary,
      },
      {
        step: "02",
        title: "组件编译",
        desc: "Vite 编译 Vue 3\n生成 IIFE Bundle",
        color: COLORS.secondary,
      },
      {
        step: "03",
        title: "静态生成",
        desc: "Hexo 生成 HTML\n脚本注入组件",
        color: COLORS.accent,
      },
      {
        step: "04",
        title: "部署上线",
        desc: "GitHub Pages\n自动构建部署",
        color: COLORS.accentOrange,
      },
    ];

    stages.forEach((stage, i) => {
      const x = 0.5 + i * 2.35;
      const w = 2.1;

      // 阶段卡片
      slide.addShape("rect", {
        x: x,
        y: 1.3,
        w: w,
        h: 2.8,
        fill: { color: COLORS.bgCard },
        shadow: makeShadow(),
      });

      // 步骤编号
      slide.addShape("oval", {
        x: x + 0.7,
        y: 1.5,
        w: 0.65,
        h: 0.65,
        fill: { color: stage.color, transparency: 70 },
      });
      slide.addText(stage.step, {
        x: x + 0.7,
        y: 1.5,
        w: 0.65,
        h: 0.65,
        fontSize: 18,
        color: stage.color,
        bold: true,
        align: "center",
        valign: "middle",
      });

      // 标题
      slide.addText(stage.title, {
        x: x + 0.15,
        y: 2.3,
        w: w - 0.3,
        h: 0.4,
        fontSize: 14,
        color: COLORS.textWhite,
        bold: true,
        align: "center",
      });

      // 描述
      slide.addText(stage.desc, {
        x: x + 0.15,
        y: 2.8,
        w: w - 0.3,
        h: 1.0,
        fontSize: 11,
        color: COLORS.textMuted,
        align: "center",
        lineSpacingMultiple: 1.4,
      });

      // 连接箭头
      if (i < stages.length - 1) {
        slide.addText("→", {
          x: x + w,
          y: 2.3,
          w: 0.25,
          h: 0.5,
          fontSize: 20,
          color: COLORS.textMuted,
          align: "center",
          valign: "middle",
        });
      }
    });

    // 底部说明
    slide.addShape("rect", {
      x: 0.5,
      y: 4.3,
      w: 9.0,
      h: 0.7,
      fill: { color: COLORS.bgCard },
    });
    addAccentBar(slide, 0.5, 4.3, 0.7, COLORS.primary);
    slide.addText(
      "核心流程：pnpm build:widgets → Vite 编译 Vue 组件 → Hexo generate → inject-custom.js 注入 → GitHub Pages 部署",
      {
        x: 0.8,
        y: 4.3,
        w: 8.5,
        h: 0.7,
        fontSize: 11,
        color: COLORS.textLight,
        valign: "middle",
      }
    );

    addFooterBar(slide);
    addPageNumber(slide, 5, TOTAL_SLIDES);
  }

  // ==========================================================
  // Slide 6: 文章内容
  // ==========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bgDark };

    slide.addText("博客文章", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 32,
      fontFace: "Microsoft YaHei",
      color: COLORS.textWhite,
      bold: true,
      margin: 0,
    });

    addAccentBar(slide, 0.5, 1.05, 0.04, COLORS.accent);

    const articles = [
      {
        title: "AI 聊天机器人实践",
        desc: "记录集成小米 mimo 大模型、构建 AI 聊天组件的完整开发过程。",
        tag: "AI 实践",
        color: COLORS.accentOrange,
      },
      {
        title: "OpenSpec 学习经验",
        desc: "分享使用 OpenSpec 规范管理项目变更、提升协作效率的实践经验。",
        tag: "工具链",
        color: COLORS.primary,
      },
      {
        title: "Skill 实战指南",
        desc: "探索 Claude Code Skill 系统，实战演示如何创建和使用自定义技能。",
        tag: "AI 工具",
        color: COLORS.secondary,
      },
      {
        title: "Hello World",
        desc: "博客的第一篇文章，记录博客搭建的起点。",
        tag: "入门",
        color: COLORS.accent,
      },
    ];

    articles.forEach((article, i) => {
      const y = 1.3 + i * 0.95;
      const cardW = 9.0;
      const cardH = 0.8;

      // 卡片背景
      slide.addShape("rect", {
        x: 0.5,
        y: y,
        w: cardW,
        h: cardH,
        fill: { color: COLORS.bgCard },
      });
      addAccentBar(slide, 0.5, y, cardH, article.color);

      // 标签
      slide.addShape("rect", {
        x: 0.8,
        y: y + 0.2,
        w: 0.9,
        h: 0.35,
        fill: { color: article.color, transparency: 70 },
      });
      slide.addText(article.tag, {
        x: 0.8,
        y: y + 0.2,
        w: 0.9,
        h: 0.35,
        fontSize: 9,
        color: article.color,
        align: "center",
        valign: "middle",
      });

      // 标题
      slide.addText(article.title, {
        x: 1.9,
        y: y + 0.1,
        w: 3.0,
        h: 0.35,
        fontSize: 14,
        color: COLORS.textWhite,
        bold: true,
        margin: 0,
      });

      // 描述
      slide.addText(article.desc, {
        x: 1.9,
        y: y + 0.42,
        w: 7.3,
        h: 0.3,
        fontSize: 11,
        color: COLORS.textMuted,
        margin: 0,
      });
    });

    addFooterBar(slide);
    addPageNumber(slide, 6, TOTAL_SLIDES);
  }

  // ==========================================================
  // Slide 7: 总结与展望
  // ==========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bgDark };

    slide.addText("总结与展望", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 32,
      fontFace: "Microsoft YaHei",
      color: COLORS.textWhite,
      bold: true,
      margin: 0,
    });

    addAccentBar(slide, 0.5, 1.05, 0.04, COLORS.accent);

    // 左侧 - 总结
    slide.addShape("rect", {
      x: 0.5,
      y: 1.3,
      w: 4.2,
      h: 3.5,
      fill: { color: COLORS.bgCard },
      shadow: makeShadow(),
    });
    addAccentBar(slide, 0.5, 1.3, 3.5, COLORS.accent);

    slide.addText("项目总结", {
      x: 0.8,
      y: 1.5,
      w: 3.6,
      h: 0.5,
      fontSize: 18,
      color: COLORS.accent,
      bold: true,
      margin: 0,
    });

    slide.addText(
      [
        { text: "Hexo + Vue 3 的混合架构", options: { bullet: true, breakLine: true } },
        { text: "AI 智能助手集成实践经验", options: { bullet: true, breakLine: true } },
        { text: "自动化构建与部署流程", options: { bullet: true, breakLine: true } },
        { text: "组件化、可扩展的前端架构", options: { bullet: true } },
      ],
      {
        x: 0.8,
        y: 2.2,
        w: 3.6,
        h: 2.2,
        fontSize: 12,
        color: COLORS.textLight,
        lineSpacingMultiple: 1.8,
        valign: "top",
      }
    );

    // 右侧 - 展望
    slide.addShape("rect", {
      x: 5.1,
      y: 1.3,
      w: 4.4,
      h: 3.5,
      fill: { color: COLORS.bgCard },
      shadow: makeShadow(),
    });
    addAccentBar(slide, 5.1, 1.3, 3.5, COLORS.primary);

    slide.addText("未来规划", {
      x: 5.4,
      y: 1.5,
      w: 3.8,
      h: 0.5,
      fontSize: 18,
      color: COLORS.primary,
      bold: true,
      margin: 0,
    });

    slide.addText(
      [
        { text: "引入更多 AI 模型支持", options: { bullet: true, breakLine: true } },
        { text: "添加评论与互动系统", options: { bullet: true, breakLine: true } },
        { text: "优化 SEO 与性能表现", options: { bullet: true, breakLine: true } },
        { text: "探索更多 AI 工具集成", options: { bullet: true } },
      ],
      {
        x: 5.4,
        y: 2.2,
        w: 3.8,
        h: 2.2,
        fontSize: 12,
        color: COLORS.textLight,
        lineSpacingMultiple: 1.8,
        valign: "top",
      }
    );

    // 底部 CTA
    slide.addShape("rect", {
      x: 2.5,
      y: 5.0,
      w: 5.0,
      h: 0.45,
      fill: { color: COLORS.primary },
    });
    slide.addText("访问博客：lqy978599280.github.io/my-blog", {
      x: 2.5,
      y: 5.0,
      w: 5.0,
      h: 0.45,
      fontSize: 12,
      color: COLORS.textWhite,
      align: "center",
      valign: "middle",
    });
  }

  // ==========================================================
  // 写入文件
  // ==========================================================
  const outputPath = "d:/ToolWorkspace/my-blog/ai-blog-intro.pptx";
  await pres.writeFile({ fileName: outputPath });
  console.log(`PPT 已生成: ${outputPath}`);
}

main().catch((err) => {
  console.error("生成 PPT 时出错:", err);
  process.exit(1);
});
