var fs = require('fs');
var path = require('path');

var headCSS = '\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">\n  <style>\n    ::-webkit-scrollbar { width: 6px; height: 6px; }\n    ::-webkit-scrollbar-track { background: #0a0e17; }\n    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }\n    ::-webkit-scrollbar-thumb:hover { background: #334155; }\n    ::selection { background: rgba(0, 240, 255, 0.2); color: #fff; }\n    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }\n    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }\n    @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 5px rgba(0, 240, 255, 0.1); } 50% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.15); } }\n    #header { animation: fadeIn 0.8s ease; }\n    #header-title { animation: fadeInUp 0.8s ease 0.2s both; }\n    #header-inner { animation: slideDown 0.6s ease 0.4s both; }\n    #main { animation: fadeInUp 0.6s ease 0.5s both; }\n    #sidebar { animation: fadeInUp 0.6s ease 0.6s both; }\n    .article-inner:hover { animation: glowPulse 2s ease infinite; }\n    .article { opacity: 1 !important; }\n    .archive-article { opacity: 1 !important; }\n    .article.animating { opacity: 0 !important; transform: translateY(30px) !important; }\n    .article.revealed { opacity: 1 !important; transform: translateY(0) !important; transition: opacity 0.6s ease, transform 0.6s ease; }\n    .archive-article.animating { opacity: 0 !important; transform: translateY(20px) !important; }\n    .archive-article.revealed { opacity: 1 !important; transform: translateY(0) !important; transition: opacity 0.5s ease, transform 0.5s ease; }\n\n    /* Search Panel */\n    #local-search-overlay {\n      display: none !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: rgba(10, 14, 23, 0.85); backdrop-filter: blur(8px); z-index: 9999;\n      animation: fadeIn 0.2s ease;\n    }\n    #local-search-overlay.active { display: flex !important; justify-content: center; padding-top: 12vh; }\n    #local-search-panel {\n      width: 90%; max-width: 640px; max-height: 70vh; display: flex; flex-direction: column;\n    }\n    #local-search-input {\n      width: 100%; padding: 16px 20px; font-size: 18px; font-family: "Sora", sans-serif;\n      background: #111827; border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 12px;\n      color: #e2e8f0; outline: none; box-sizing: border-box;\n      transition: border-color 0.3s;\n    }\n    #local-search-input:focus { border-color: rgba(0, 240, 255, 0.4); box-shadow: 0 0 20px rgba(0, 240, 255, 0.08); }\n    #local-search-input::placeholder { color: #64748b; }\n    #local-search-results {\n      margin-top: 12px; overflow-y: auto; flex: 1;\n    }\n    .search-result-item {\n      padding: 16px 20px; margin-bottom: 8px; background: #111827;\n      border: 1px solid rgba(0, 240, 255, 0.06); border-radius: 10px;\n      cursor: pointer; transition: all 0.3s;\n    }\n    .search-result-item:hover {\n      border-color: rgba(0, 240, 255, 0.2); transform: translateY(-1px);\n      box-shadow: 0 4px 16px rgba(0, 240, 255, 0.06);\n    }\n    .search-result-title {\n      font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 6px;\n    }\n    .search-result-title em { color: #00f0ff; font-style: normal; }\n    .search-result-snippet {\n      font-size: 13px; color: #94a3b8; line-height: 1.6;\n      overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;\n    }\n    .search-result-snippet em { color: #00f0ff; font-style: normal; background: rgba(0, 240, 255, 0.08); padding: 0 2px; border-radius: 2px; }\n    .search-result-meta { font-size: 12px; color: #475569; margin-top: 6px; }\n    .search-no-result { padding: 40px 20px; text-align: center; color: #64748b; font-size: 15px; }\n    .search-close-hint { font-size: 12px; color: #475569; text-align: center; margin-top: 16px; }\n    .search-close-hint kbd {\n      background: #1e293b; border: 1px solid #334155; border-radius: 4px;\n      padding: 2px 6px; font-size: 11px; color: #94a3b8;\n    }\n    #main { color: #e2e8f0 !important; }\n    .article-entry { color: #e2e8f0 !important; }\n    .article-entry p { color: #cbd5e1 !important; }\n    #search-form-wrap { display: none; }\n  </style>';

var bodyScript = '<script>\n' +
// Particle Network
'(function() {\n' +
'  var header = document.getElementById("header");\n' +
'  if (!header) return;\n' +
'  var canvas = document.createElement("canvas");\n' +
'  canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none";\n' +
'  header.style.position = "relative";\n' +
'  header.insertBefore(canvas, header.children[1]);\n' +
'  var ctx = canvas.getContext("2d");\n' +
'  var particles = [];\n' +
'  var particleCount = 60;\n' +
'  var maxDist = 120;\n' +
'  function resize() { canvas.width = header.offsetWidth; canvas.height = header.offsetHeight; }\n' +
'  function Particle() {\n' +
'    this.x = Math.random() * canvas.width;\n' +
'    this.y = Math.random() * canvas.height;\n' +
'    this.vx = (Math.random() - 0.5) * 0.5;\n' +
'    this.vy = (Math.random() - 0.5) * 0.5;\n' +
'    this.radius = Math.random() * 1.5 + 0.5;\n' +
'    this.opacity = Math.random() * 0.5 + 0.2;\n' +
'  }\n' +
'  function init() { resize(); particles = []; for (var i = 0; i < particleCount; i++) particles.push(new Particle()); }\n' +
'  function draw() {\n' +
'    ctx.clearRect(0, 0, canvas.width, canvas.height);\n' +
'    for (var i = 0; i < particles.length; i++) {\n' +
'      var p = particles[i];\n' +
'      p.x += p.vx; p.y += p.vy;\n' +
'      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;\n' +
'      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;\n' +
'      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);\n' +
'      ctx.fillStyle = "rgba(0,240,255," + p.opacity + ")"; ctx.fill();\n' +
'      for (var j = i + 1; j < particles.length; j++) {\n' +
'        var p2 = particles[j];\n' +
'        var dx = p.x - p2.x, dy = p.y - p2.y;\n' +
'        var dist = Math.sqrt(dx * dx + dy * dy);\n' +
'        if (dist < maxDist) {\n' +
'          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);\n' +
'          ctx.strokeStyle = "rgba(0,240,255," + ((1 - dist / maxDist) * 0.15) + ")";\n' +
'          ctx.lineWidth = 0.5; ctx.stroke();\n' +
'        }\n' +
'      }\n' +
'    }\n' +
'    requestAnimationFrame(draw);\n' +
'  }\n' +
'  init(); draw();\n' +
'  window.addEventListener("resize", function() { init(); });\n' +
'})();\n' +
// Scroll Reveal
'(function() {\n' +
'  var els = document.querySelectorAll(".article, .archive-article");\n' +
'  for (var i = 0; i < els.length; i++) els[i].classList.add("animating");\n' +
'  requestAnimationFrame(function() {\n' +
'    for (var i = 0; i < els.length; i++) {\n' +
'      var rect = els[i].getBoundingClientRect();\n' +
'      if (rect.top < window.innerHeight - 100) els[i].classList.add("revealed");\n' +
'    }\n' +
'  });\n' +
'  var ticking = false;\n' +
'  window.addEventListener("scroll", function() {\n' +
'    if (!ticking) { requestAnimationFrame(function() {\n' +
'      for (var i = 0; i < els.length; i++) {\n' +
'        if (!els[i].classList.contains("revealed")) {\n' +
'          var rect = els[i].getBoundingClientRect();\n' +
'          if (rect.top < window.innerHeight - 100) els[i].classList.add("revealed");\n' +
'        }\n' +
'      }\n' +
'      ticking = false;\n' +
'    }); ticking = true; }\n' +
'  });\n' +
'})();\n' +
// Local Search
'(function() {\n' +
'  var searchData = null;\n' +
'  var searchLoaded = false;\n' +
'  var overlay = document.createElement("div");\n' +
'  overlay.id = "local-search-overlay";\n' +
'  overlay.innerHTML = \'<div id="local-search-panel">\' +\n' +
'    \'<input type="text" id="local-search-input" placeholder="搜索文章..." autocomplete="off">\' +\n' +
'    \'<div id="local-search-results"></div>\' +\n' +
'    \'<div class="search-close-hint">按 <kbd>Esc</kbd> 关闭</div>\' +\n' +
'    \'</div>\';\n' +
'  document.body.appendChild(overlay);\n' +
'  var input = document.getElementById("local-search-input");\n' +
'  var results = document.getElementById("local-search-results");\n' +
'\n' +
'  function loadSearchData() {\n' +
'    if (searchLoaded) return;\n' +
'    searchLoaded = true;\n' +
'    var xhr = new XMLHttpRequest();\n' +
'    xhr.open("GET", "/my-blog/search.json", true);\n' +
'    xhr.onreadystatechange = function() {\n' +
'      if (xhr.readyState === 4 && xhr.status === 200) {\n' +
'        searchData = JSON.parse(xhr.responseText);\n' +
'      }\n' +
'    };\n' +
'    xhr.send();\n' +
'  }\n' +
'\n' +
'  function stripHtml(html) {\n' +
'    var tmp = document.createElement("div");\n' +
'    tmp.innerHTML = html;\n' +
'    return tmp.textContent || tmp.innerText || "";\n' +
'  }\n' +
'\n' +
'  function escapeRegex(str) {\n' +
'    return str.replace(/[\\\\^$.*+?()[\\]{}|]/g, "\\\\$$&");\n' +
'  }\n' +
'\n' +
'  function highlightText(text, keyword) {\n' +
'    if (!keyword) return text;\n' +
'    var regex = new RegExp("(" + escapeRegex(keyword) + ")", "gi");\n' +
'    return text.replace(regex, "<em>$1</em>");\n' +
'  }\n' +
'\n' +
'  function doSearch(keyword) {\n' +
'    if (!searchData || !keyword) { results.innerHTML = ""; return; }\n' +
'    keyword = keyword.toLowerCase();\n' +
'    var matches = [];\n' +
'    for (var i = 0; i < searchData.length; i++) {\n' +
'      var item = searchData[i];\n' +
'      var title = (item.title || "").toLowerCase();\n' +
'      var content = stripHtml(item.content || "").toLowerCase();\n' +
'      var tags = (item.tags || []).join(" ").toLowerCase();\n' +
'      var categories = (item.categories || []).join(" ").toLowerCase();\n' +
'      if (title.indexOf(keyword) !== -1 || content.indexOf(keyword) !== -1 ||\n' +
'          tags.indexOf(keyword) !== -1 || categories.indexOf(keyword) !== -1) {\n' +
'        var snippet = stripHtml(item.content || "");\n' +
'        var idx = snippet.toLowerCase().indexOf(keyword);\n' +
'        if (idx !== -1) {\n' +
'          var start = Math.max(0, idx - 40);\n' +
'          var end = Math.min(snippet.length, idx + keyword.length + 80);\n' +
'          snippet = (start > 0 ? "..." : "") + snippet.substring(start, end) + (end < snippet.length ? "..." : "");\n' +
'        } else {\n' +
'          snippet = snippet.substring(0, 120) + "...";\n' +
'        }\n' +
'        matches.push({ title: item.title, url: item.url, snippet: snippet, date: item.date });\n' +
'      }\n' +
'      if (matches.length >= 10) break;\n' +
'    }\n' +
'    if (matches.length === 0) {\n' +
'      results.innerHTML = \'<div class="search-no-result">未找到相关文章</div>\';\n' +
'      return;\n' +
'    }\n' +
'    var html = "";\n' +
'    for (var j = 0; j < matches.length; j++) {\n' +
'      var m = matches[j];\n' +
'      html += \'<div class="search-result-item" onclick="window.location.href=\'\\\'\' + m.url + \'\\\'">\' +\n' +
'        \'<div class="search-result-title">\' + highlightText(m.title, keyword) + \'</div>\' +\n' +
'        \'<div class="search-result-snippet">\' + highlightText(m.snippet, keyword) + \'</div>\' +\n' +
'        (m.date ? \'<div class="search-result-meta">\' + m.date + \'</div>\' : "") +\n' +
'        \'</div>\';\n' +
'    }\n' +
'    results.innerHTML = html;\n' +
'  }\n' +
'\n' +
'  function openSearch() {\n' +
'    var scrollW = window.innerWidth - document.documentElement.clientWidth;\n' +
'    document.body.style.overflow = "hidden";\n' +
'    if (scrollW > 0) document.body.style.paddingRight = scrollW + "px";\n' +
'    overlay.classList.add("active");\n' +
'    loadSearchData();\n' +
'    setTimeout(function() { input.focus(); }, 100);\n' +
'  }\n' +
'\n' +
'  function closeSearch() {\n' +
'    overlay.classList.remove("active");\n' +
'    document.body.style.overflow = "";\n' +
'    document.body.style.paddingRight = "";\n' +
'    input.value = "";\n' +
'    results.innerHTML = "";\n' +
'  }\n' +
'\n' +
'  input.addEventListener("input", function() { doSearch(this.value.trim()); });\n' +
'  overlay.addEventListener("click", function(e) { if (e.target === overlay) closeSearch(); });\n' +
'  document.addEventListener("keydown", function(e) { if (e.key === "Escape") closeSearch(); });\n' +
'\n' +
'  // Override search icon click\n' +
'  var searchBtn = document.querySelector(".nav-search-btn");\n' +
'  if (searchBtn) {\n' +
'    searchBtn.addEventListener("click", function(e) {\n' +
'      e.preventDefault();\n' +
'      e.stopPropagation();\n' +
'      openSearch();\n' +
'    });\n' +
'  }\n' +
'})();\n' +
'</script>';

function processDir(dir) {
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      var content = fs.readFileSync(fullPath, 'utf8');
      if (content.indexOf('local-search-overlay') !== -1) continue;
      content = content.replace(/<\/head>/, headCSS + '\n</head>');
      content = content.replace(/<\/body>/, '\n' + bodyScript + '\n</body>');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

var publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  processDir(publicDir);
  console.log('[inject] Custom styles, animations and search UI injected.');
} else {
  console.log('[inject] public directory not found.');
}
