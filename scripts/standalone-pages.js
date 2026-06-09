var fs = require('fs');
var path = require('path');

/**
 * 独立页面处理：将完整的 HTML 文件替换 Hexo 渲染的版本
 * 用于跳过主题布局的独立页面（如小游戏）
 */
var standaloneDirs = ['game'];

hexo.extend.filter.register('after_render:html', function(html, data) {
  // data.path 是输出路径，如 "game/index.html"
  var relPath = data.path || '';

  for (var i = 0; i < standaloneDirs.length; i++) {
    var dirName = standaloneDirs[i];
    if (relPath.indexOf(dirName + '/') === 0) {
      var srcFile = path.join(hexo.source_dir, relPath);
      if (fs.existsSync(srcFile)) {
        return fs.readFileSync(srcFile, 'utf8');
      }
    }
  }

  return html;
});
