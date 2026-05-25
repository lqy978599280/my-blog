var fs = require('fs');
var path = require('path');

/**
 * 注入到 <head> 的内容
 * - Google Fonts 预连接和加载
 */
var headCSS = '\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">\n';

/**
 * 注入到 </body> 之前的内容
 * - Vue3 构建产物
 */
var bodyScripts = '\n  <link rel="stylesheet" href="/my-blog/js/widgets/blog-widgets.css">\n  <script src="/my-blog/js/widgets/blog-widgets.js"><\/script>\n';

/**
 * 处理目录中的所有 HTML 文件
 */
function processDir(dir) {
  var entries = fs.readdirSync(dir, { withFileTypes: true });

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      var content = fs.readFileSync(fullPath, 'utf8');

      // 检查是否已经注入过（使用正确的路径检查）
      if (content.indexOf('href="/my-blog/js/widgets/blog-widgets.css"') !== -1) {
        continue;
      }

      // 移除旧的注入标记（如果有）
      content = content.replace(/<!-- Vue3 Blog Widgets Injected -->\n/g, '');
      content = content.replace(/<link rel="stylesheet" href="\/js\/widgets\/blog-widgets\.css">\n/g, '');
      content = content.replace(/<script src="\/js\/widgets\/blog-widgets\.js"><\/script>\n/g, '');

      // 注入 Google Fonts 到 <head>
      content = content.replace(/<\/head>/, headCSS + '\n</head>');

      // 注入 Vue3 构建产物到 </body> 之前
      content = content.replace(
        /<\/body>/,
        '\n<!-- Vue3 Blog Widgets Injected -->\n' + bodyScripts + '\n</body>'
      );

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

// 仅在直接执行时运行（Hexo 加载时不执行）
if (require.main === module) {
  var publicDir = path.join(process.cwd(), 'public');

  if (fs.existsSync(publicDir)) {
    processDir(publicDir);
    console.log('[inject] Vue3 blog widgets injected successfully.');
  } else {
    console.log('[inject] public directory not found.');
  }
}
