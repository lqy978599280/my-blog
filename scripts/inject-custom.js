var fs = require('fs');
var path = require('path');

var headCSS = '\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">\n  <style>\n    ::-webkit-scrollbar { width: 6px; height: 6px; }\n    ::-webkit-scrollbar-track { background: #0a0e17; }\n    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }\n    ::-webkit-scrollbar-thumb:hover { background: #334155; }\n    ::selection { background: rgba(0, 240, 255, 0.2); color: #fff; }\n    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }\n    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }\n    @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 5px rgba(0, 240, 255, 0.1); } 50% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.15); } }\n    #header { animation: fadeIn 0.8s ease; }\n    #header-title { animation: fadeInUp 0.8s ease 0.2s both; }\n    #header-inner { animation: slideDown 0.6s ease 0.4s both; }\n    #main { animation: fadeInUp 0.6s ease 0.5s both; }\n    #sidebar { animation: fadeInUp 0.6s ease 0.6s both; }\n    .article-inner:hover { animation: glowPulse 2s ease infinite; }\n    .article { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }\n    .article.revealed { opacity: 1; transform: translateY(0); }\n    .archive-article { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }\n    .archive-article.revealed { opacity: 1; transform: translateY(0); }\n  </style>';

var bodyScript = '<script>\n(function() {\n  var header = document.getElementById("header");\n  if (!header) return;\n  var canvas = document.createElement("canvas");\n  canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none";\n  header.style.position = "relative";\n  header.insertBefore(canvas, header.children[1]);\n  var ctx = canvas.getContext("2d");\n  var particles = [];\n  var particleCount = 60;\n  var maxDist = 120;\n  function resize() { canvas.width = header.offsetWidth; canvas.height = header.offsetHeight; }\n  function Particle() {\n    this.x = Math.random() * canvas.width;\n    this.y = Math.random() * canvas.height;\n    this.vx = (Math.random() - 0.5) * 0.5;\n    this.vy = (Math.random() - 0.5) * 0.5;\n    this.radius = Math.random() * 1.5 + 0.5;\n    this.opacity = Math.random() * 0.5 + 0.2;\n  }\n  function init() { resize(); particles = []; for (var i = 0; i < particleCount; i++) particles.push(new Particle()); }\n  function draw() {\n    ctx.clearRect(0, 0, canvas.width, canvas.height);\n    for (var i = 0; i < particles.length; i++) {\n      var p = particles[i];\n      p.x += p.vx; p.y += p.vy;\n      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;\n      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;\n      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);\n      ctx.fillStyle = "rgba(0,240,255," + p.opacity + ")"; ctx.fill();\n      for (var j = i + 1; j < particles.length; j++) {\n        var p2 = particles[j];\n        var dx = p.x - p2.x, dy = p.y - p2.y;\n        var dist = Math.sqrt(dx * dx + dy * dy);\n        if (dist < maxDist) {\n          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);\n          ctx.strokeStyle = "rgba(0,240,255," + ((1 - dist / maxDist) * 0.15) + ")";\n          ctx.lineWidth = 0.5; ctx.stroke();\n        }\n      }\n    }\n    requestAnimationFrame(draw);\n  }\n  init(); draw();\n  window.addEventListener("resize", function() { init(); });\n})();\n(function() {\n  function checkReveal() {\n    var els = document.querySelectorAll(".article, .archive-article, .widget");\n    var wh = window.innerHeight;\n    for (var i = 0; i < els.length; i++) {\n      var rect = els[i].getBoundingClientRect();\n      if (rect.top < wh - 100) els[i].classList.add("revealed");\n    }\n  }\n  checkReveal();\n  var ticking = false;\n  window.addEventListener("scroll", function() {\n    if (!ticking) { requestAnimationFrame(function() { checkReveal(); ticking = false; }); ticking = true; }\n  });\n})();\n</script>';

function processDir(dir) {
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      var content = fs.readFileSync(fullPath, 'utf8');
      if (content.indexOf('particles-canvas') !== -1) continue;
      content = content.replace(/<\/head>/, headCSS + '\n</head>');
      content = content.replace(/<\/body>/, '\n' + bodyScript + '\n</body>');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

var publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  processDir(publicDir);
  console.log('[inject] Custom styles and animations injected into HTML files.');
} else {
  console.log('[inject] public directory not found.');
}
