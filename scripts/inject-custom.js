var fs = require('fs');
var path = require('path');

var headCSS = '\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">\n  <style>\n    ::-webkit-scrollbar { width: 6px; height: 6px; }\n    ::-webkit-scrollbar-track { background: #0a0e17; }\n    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }\n    ::-webkit-scrollbar-thumb:hover { background: #334155; }\n    ::selection { background: rgba(0, 240, 255, 0.2); color: #fff; }\n    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }\n    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }\n    @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 5px rgba(0, 240, 255, 0.1); } 50% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.15); } }\n    #header { animation: fadeIn 0.8s ease; }\n    #header-title { animation: fadeInUp 0.8s ease 0.2s both; }\n    #header-inner { animation: slideDown 0.6s ease 0.4s both; }\n    #main { animation: fadeInUp 0.6s ease 0.5s both; }\n    #sidebar { animation: fadeInUp 0.6s ease 0.6s both; }\n    .article-inner:hover { animation: glowPulse 2s ease infinite; }\n    .article { opacity: 1 !important; }\n    .archive-article { opacity: 1 !important; }\n    .article.animating { opacity: 0 !important; transform: translateY(30px) !important; }\n    .article.revealed { opacity: 1 !important; transform: translateY(0) !important; transition: opacity 0.6s ease, transform 0.6s ease; }\n    .archive-article.animating { opacity: 0 !important; transform: translateY(20px) !important; }\n    .archive-article.revealed { opacity: 1 !important; transform: translateY(0) !important; transition: opacity 0.5s ease, transform 0.5s ease; }\n\n    /* Search Panel */\n    #local-search-overlay {\n      display: none !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: rgba(10, 14, 23, 0.85); backdrop-filter: blur(8px); z-index: 9999;\n      animation: fadeIn 0.2s ease;\n    }\n    #local-search-overlay.active { display: flex !important; justify-content: center; padding-top: 12vh; }\n    #local-search-panel {\n      width: 90%; max-width: 640px; max-height: 70vh; display: flex; flex-direction: column;\n    }\n    #local-search-input {\n      width: 100%; padding: 16px 20px; font-size: 18px; font-family: "Sora", sans-serif;\n      background: #111827; border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 12px;\n      color: #e2e8f0; outline: none; box-sizing: border-box;\n      transition: border-color 0.3s;\n    }\n    #local-search-input:focus { border-color: rgba(0, 240, 255, 0.4); box-shadow: 0 0 20px rgba(0, 240, 255, 0.08); }\n    #local-search-input::placeholder { color: #64748b; }\n    #local-search-results {\n      margin-top: 12px; overflow-y: auto; flex: 1;\n    }\n    .search-result-item {\n      padding: 16px 20px; margin-bottom: 8px; background: #111827;\n      border: 1px solid rgba(0, 240, 255, 0.06); border-radius: 10px;\n      cursor: pointer; transition: all 0.3s;\n    }\n    .search-result-item:hover {\n      border-color: rgba(0, 240, 255, 0.2); transform: translateY(-1px);\n      box-shadow: 0 4px 16px rgba(0, 240, 255, 0.06);\n    }\n    .search-result-title {\n      font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 6px;\n    }\n    .search-result-title em { color: #00f0ff; font-style: normal; }\n    .search-result-snippet {\n      font-size: 13px; color: #94a3b8; line-height: 1.6;\n      overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;\n    }\n    .search-result-snippet em { color: #00f0ff; font-style: normal; background: rgba(0, 240, 255, 0.08); padding: 0 2px; border-radius: 2px; }\n    .search-result-meta { font-size: 12px; color: #475569; margin-top: 6px; }\n    .search-no-result { padding: 40px 20px; text-align: center; color: #64748b; font-size: 15px; }\n    .search-close-hint { font-size: 12px; color: #475569; text-align: center; margin-top: 16px; }\n    .search-close-hint kbd {\n      background: #1e293b; border: 1px solid #334155; border-radius: 4px;\n      padding: 2px 6px; font-size: 11px; color: #94a3b8;\n    }\n    #main { color: #e2e8f0 !important; }\n    .article-entry { color: #e2e8f0 !important; }\n    .article-entry p { color: #cbd5e1 !important; }\n    #search-form-wrap { display: none; }\n' + chatWidgetCSS + '\n  </style>';

var chatWidgetCSS = '\n    /* AI Chat Widget */\n    #ai-chat-widget {\n      position: fixed; bottom: 24px; right: 24px; z-index: 9998;\n      font-family: "Sora", sans-serif;\n    }\n    #ai-chat-btn {\n      width: 56px; height: 56px; border-radius: 50%;\n      background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);\n      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;\n      box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);\n      transition: all 0.3s ease; position: relative;\n    }\n    #ai-chat-btn:hover {\n      transform: scale(1.1); box-shadow: 0 6px 30px rgba(0, 240, 255, 0.4);\n    }\n    #ai-chat-btn svg {\n      width: 28px; height: 28px; fill: white;\n    }\n    #ai-chat-btn .tooltip {\n      position: absolute; right: 70px; top: 50%; transform: translateY(-50%);\n      background: #1e293b; color: #e2e8f0; padding: 6px 12px; border-radius: 6px;\n      font-size: 13px; white-space: nowrap; opacity: 0; transition: opacity 0.3s;\n      pointer-events: none;\n    }\n    #ai-chat-btn:hover .tooltip { opacity: 1; }\n    @keyframes chatPulse {\n      0%, 100% { box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3); }\n      50% { box-shadow: 0 4px 30px rgba(0, 240, 255, 0.5); }\n    }\n    #ai-chat-btn { animation: chatPulse 3s ease infinite; }\n    #ai-chat-window {\n      display: none; position: absolute; bottom: 70px; right: 0;\n      width: 380px; height: 520px; background: #0d1117;\n      border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 16px;\n      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);\n      flex-direction: column; overflow: hidden;\n      animation: chatWindowOpen 0.3s ease;\n    }\n    @keyframes chatWindowOpen {\n      from { opacity: 0; transform: translateY(20px) scale(0.95); }\n      to { opacity: 1; transform: translateY(0) scale(1); }\n    }\n    #ai-chat-window.open { display: flex; }\n    #ai-chat-header {\n      padding: 16px 20px; background: linear-gradient(135deg, #111827 0%, #1e293b 100%);\n      border-bottom: 1px solid rgba(0, 240, 255, 0.1);\n      display: flex; align-items: center; justify-content: space-between;\n    }\n    #ai-chat-header-title {\n      font-size: 15px; font-weight: 600; color: #f1f5f9;\n      display: flex; align-items: center; gap: 8px;\n    }\n    #ai-chat-header-title::before {\n      content: ""; display: inline-block; width: 8px; height: 8px;\n      background: #00f0ff; border-radius: 50%; animation: chatPulse 2s ease infinite;\n    }\n    #ai-chat-close {\n      background: none; border: none; color: #64748b; cursor: pointer;\n      font-size: 20px; padding: 4px; transition: color 0.2s;\n    }\n    #ai-chat-close:hover { color: #e2e8f0; }\n    #ai-chat-messages {\n      flex: 1; overflow-y: auto; padding: 16px;\n      display: flex; flex-direction: column; gap: 12px;\n    }\n    #ai-chat-messages::-webkit-scrollbar { width: 4px; }\n    #ai-chat-messages::-webkit-scrollbar-track { background: transparent; }\n    #ai-chat-messages::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }\n    .chat-msg {\n      max-width: 85%; padding: 12px 16px; border-radius: 12px;\n      font-size: 14px; line-height: 1.6; word-wrap: break-word;\n    }\n    .chat-msg.user {\n      align-self: flex-end; background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);\n      color: white; border-bottom-right-radius: 4px;\n    }\n    .chat-msg.assistant {\n      align-self: flex-start; background: #1e293b; color: #e2e8f0;\n      border-bottom-left-radius: 4px;\n    }\n    .chat-msg.assistant code {\n      background: #0d1117; padding: 2px 6px; border-radius: 4px;\n      font-family: "JetBrains Mono", monospace; font-size: 13px;\n    }\n    .chat-msg.assistant pre {\n      background: #0d1117; padding: 12px; border-radius: 8px; margin: 8px 0;\n      overflow-x: auto;\n    }\n    .chat-msg.assistant pre code {\n      background: none; padding: 0;\n    }\n    .chat-typing {\n      align-self: flex-start; display: flex; gap: 4px; padding: 12px 16px;\n    }\n    .chat-typing span {\n      width: 8px; height: 8px; background: #64748b; border-radius: 50%;\n      animation: typingDot 1.4s ease infinite;\n    }\n    .chat-typing span:nth-child(2) { animation-delay: 0.2s; }\n    .chat-typing span:nth-child(3) { animation-delay: 0.4s; }\n    @keyframes typingDot {\n      0%, 100% { transform: translateY(0); opacity: 0.4; }\n      50% { transform: translateY(-6px); opacity: 1; }\n    }\n    #ai-chat-presets {\n      padding: 8px 16px; display: flex; flex-wrap: wrap; gap: 6px;\n    }\n    .chat-preset-btn {\n      background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.15);\n      color: #00f0ff; padding: 6px 12px; border-radius: 16px;\n      font-size: 12px; cursor: pointer; transition: all 0.2s;\n      font-family: "Sora", sans-serif;\n    }\n    .chat-preset-btn:hover {\n      background: rgba(0, 240, 255, 0.15); border-color: rgba(0, 240, 255, 0.3);\n    }\n    #ai-chat-input-area {\n      padding: 12px 16px; border-top: 1px solid rgba(0, 240, 255, 0.1);\n      display: flex; gap: 8px; align-items: flex-end;\n    }\n    #ai-chat-input {\n      flex: 1; background: #111827; border: 1px solid rgba(0, 240, 255, 0.15);\n      border-radius: 12px; padding: 10px 14px; color: #e2e8f0;\n      font-size: 14px; font-family: "Sora", sans-serif; resize: none;\n      max-height: 100px; outline: none; transition: border-color 0.3s;\n    }\n    #ai-chat-input:focus { border-color: rgba(0, 240, 255, 0.4); }\n    #ai-chat-input::placeholder { color: #64748b; }\n    #ai-chat-send {\n      background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);\n      border: none; border-radius: 12px; padding: 10px 16px;\n      color: white; cursor: pointer; transition: all 0.2s;\n      display: flex; align-items: center; justify-content: center;\n    }\n    #ai-chat-send:hover { transform: scale(1.05); }\n    #ai-chat-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }\n    #ai-chat-send svg { width: 18px; height: 18px; fill: white; }\n    .chat-error {\n      align-self: center; background: rgba(239, 68, 68, 0.1);\n      border: 1px solid rgba(239, 68, 68, 0.2); color: #fca5a5;\n      padding: 8px 16px; border-radius: 8px; font-size: 13px;\n      text-align: center;\n    }\n    .chat-error button {\n      background: rgba(239, 68, 68, 0.2); border: none; color: #fca5a5;\n      padding: 4px 12px; border-radius: 6px; cursor: pointer; margin-left: 8px;\n      font-size: 12px;\n    }\n    @media (max-width: 480px) {\n      #ai-chat-window {\n        width: calc(100vw - 32px); height: calc(100vh - 100px);\n        bottom: 70px; right: -8px;\n      }\n    }';

var chatWidgetHTML = '<div id="ai-chat-widget">' +
  '<div id="ai-chat-window">' +
    '<div id="ai-chat-header">' +
      '<div id="ai-chat-header-title">AI探索助手</div>' +
      '<button id="ai-chat-close">&times;</button>' +
    '</div>' +
    '<div id="ai-chat-messages"></div>' +
    '<div id="ai-chat-presets">' +
      '<button class="chat-preset-btn" data-q="推荐一篇博客文章">推荐文章</button>' +
      '<button class="chat-preset-btn" data-q="介绍一下这个博客的主要内容">博客介绍</button>' +
      '<button class="chat-preset-btn" data-q="解释一下AI技术的基本概念">AI技术</button>' +
      '<button class="chat-preset-btn" data-q="有什么学习建议吗？">学习建议</button>' +
    '</div>' +
    '<div id="ai-chat-input-area">' +
      '<textarea id="ai-chat-input" placeholder="输入你的问题..." rows="1"></textarea>' +
      '<button id="ai-chat-send" disabled>' +
        '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
      '</button>' +
    '</div>' +
  '</div>' +
  '<button id="ai-chat-btn">' +
    '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>' +
    '<span class="tooltip">AI助手</span>' +
  '</button>' +
'</div>';

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
// AI Chat Widget
'(function() {\n' +
'  var chatBtn = document.getElementById("ai-chat-btn");\n' +
'  var chatWindow = document.getElementById("ai-chat-window");\n' +
'  var chatClose = document.getElementById("ai-chat-close");\n' +
'  var chatInput = document.getElementById("ai-chat-input");\n' +
'  var chatSend = document.getElementById("ai-chat-send");\n' +
'  var chatMessages = document.getElementById("ai-chat-messages");\n' +
'  var chatPresets = document.getElementById("ai-chat-presets");\n' +
'  var isOpen = false;\n' +
'  var isLoading = false;\n' +
'  var aiContext = null;\n' +
'  var contextLoaded = false;\n' +
'\n' +
'  function loadContext() {\n' +
'    if (contextLoaded) return;\n' +
'    contextLoaded = true;\n' +
'    var xhr = new XMLHttpRequest();\n' +
'    xhr.open("GET", "/my-blog/ai-context.json", true);\n' +
'    xhr.onreadystatechange = function() {\n' +
'      if (xhr.readyState === 4 && xhr.status === 200) {\n' +
'        try {\n' +
'          aiContext = JSON.parse(xhr.responseText);\n' +
'        } catch(e) {\n' +
'          console.warn("[AI Chat] Failed to parse context:", e);\n' +
'        }\n' +
'      }\n' +
'    };\n' +
'    xhr.send();\n' +
'  }\n' +
'\n' +
'  function toggleChat() {\n' +
'    isOpen = !isOpen;\n' +
'    if (isOpen) {\n' +
'      chatWindow.classList.add("open");\n' +
'      loadContext();\n' +
'      setTimeout(function() { chatInput.focus(); }, 300);\n' +
'    } else {\n' +
'      chatWindow.classList.remove("open");\n' +
'    }\n' +
'  }\n' +
'\n' +
'  function closeChat() {\n' +
'    isOpen = false;\n' +
'    chatWindow.classList.remove("open");\n' +
'  }\n' +
'\n' +
'  function escapeHtml(text) {\n' +
'    var div = document.createElement("div");\n' +
'    div.textContent = text;\n' +
'    return div.innerHTML;\n' +
'  }\n' +
'\n' +
'  function renderMarkdown(text) {\n' +
'    // Simple markdown rendering\n' +
'    text = text.replace(/```(\\w*)\\n([\\s\\S]*?)```/g, function(match, lang, code) {\n' +
'      return \'<pre><code class="language-\' + lang + \'">\' + escapeHtml(code) + \'</code></pre>\';\n' +
'    });\n' +
'    text = text.replace(/`([^`]+)`/g, \'<code>$1</code>\');\n' +
'    text = text.replace(/\\*\\*([^*]+)\\*\\*/g, \'<strong>$1</strong>\');\n' +
'    text = text.replace(/\\*([^*]+)\\*/g, \'<em>$1</em>\');\n' +
'    text = text.replace(/\\n/g, \'<br>\');\n' +
'    return text;\n' +
'  }\n' +
'\n' +
'  function addMessage(content, isUser) {\n' +
'    var msg = document.createElement("div");\n' +
'    msg.className = "chat-msg " + (isUser ? "user" : "assistant");\n' +
'    if (isUser) {\n' +
'      msg.textContent = content;\n' +
'    } else {\n' +
'      msg.innerHTML = renderMarkdown(content);\n' +
'    }\n' +
'    chatMessages.appendChild(msg);\n' +
'    chatMessages.scrollTop = chatMessages.scrollHeight;\n' +
'    return msg;\n' +
'  }\n' +
'\n' +
'  function addTypingIndicator() {\n' +
'    var typing = document.createElement("div");\n' +
'    typing.className = "chat-typing";\n' +
'    typing.innerHTML = "<span></span><span></span><span></span>";\n' +
'    chatMessages.appendChild(typing);\n' +
'    chatMessages.scrollTop = chatMessages.scrollHeight;\n' +
'    return typing;\n' +
'  }\n' +
'\n' +
'  function showError(message, retryFn) {\n' +
'    var error = document.createElement("div");\n' +
'    error.className = "chat-error";\n' +
'    error.innerHTML = escapeHtml(message);\n' +
'    if (retryFn) {\n' +
'      var btn = document.createElement("button");\n' +
'      btn.textContent = "重试";\n' +
'      btn.onclick = function() {\n' +
'        error.remove();\n' +
'        retryFn();\n' +
'      };\n' +
'      error.appendChild(btn);\n' +
'    }\n' +
'    chatMessages.appendChild(error);\n' +
'    chatMessages.scrollTop = chatMessages.scrollHeight;\n' +
'  }\n' +
'\n' +
'  function getSystemPrompt() {\n' +
'    var prompt = "你是AI探索笔记博客的智能助手。你可以回答关于AI技术、编程学习、博客内容等问题。请用友好、专业的语气回答。";\n' +
'    if (aiContext && aiContext.length > 0) {\n' +
'      prompt += "\\n\\n以下是博客文章摘要：\\n";\n' +
'      for (var i = 0; i < aiContext.length; i++) {\n' +
'        var post = aiContext[i];\n' +
'        prompt += "\\n标题：" + post.title;\n' +
'        if (post.categories && post.categories.length > 0) {\n' +
'          prompt += "\\n分类：" + post.categories.join(", ");\n' +
'        }\n' +
'        if (post.tags && post.tags.length > 0) {\n' +
'          prompt += "\\n标签：" + post.tags.join(", ");\n' +
'        }\n' +
'        prompt += "\\n摘要：" + post.summary + "\\n";\n' +
'      }\n' +
'    }\n' +
'    return prompt;\n' +
'  }\n' +
'\n' +
'  function callAPI(question) {\n' +
'    isLoading = true;\n' +
'    chatSend.disabled = true;\n' +
'    var typing = addTypingIndicator();\n' +
'\n' +
'    var controller = new AbortController();\n' +
'    var timeoutId = setTimeout(function() { controller.abort(); }, 30000);\n' +
'\n' +
'    fetch("https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages", {\n' +
'      method: "POST",\n' +
'      headers: {\n' +
'        "Content-Type": "application/json",\n' +
'        "x-api-key": "tp-ck566wwq6qo6295enlcmm5ud565ej0dcaiw7i5qmw3upl3gp",\n' +
'        "anthropic-version": "2023-06-01"\n' +
'      },\n' +
'      body: JSON.stringify({\n' +
'        model: "mimo-v2.5-pro",\n' +
'        max_tokens: 1024,\n' +
'        system: getSystemPrompt(),\n' +
'        messages: [{ role: "user", content: question }]\n' +
'      }),\n' +
'      signal: controller.signal\n' +
'    })\n' +
'    .then(function(response) {\n' +
'      clearTimeout(timeoutId);\n' +
'      if (!response.ok) {\n' +
'        throw new Error("API请求失败: " + response.status);\n' +
'      }\n' +
'      return response.json();\n' +
'    })\n' +
'    .then(function(data) {\n' +
'      typing.remove();\n' +
'      if (data.content && data.content[0] && data.content[0].text) {\n' +
'        addMessage(data.content[0].text, false);\n' +
'      } else {\n' +
'        showError("未能获取到有效响应", function() { callAPI(question); });\n' +
'      }\n' +
'    })\n' +
'    .catch(function(error) {\n' +
'      clearTimeout(timeoutId);\n' +
'      typing.remove();\n' +
'      if (error.name === "AbortError") {\n' +
'        showError("请求超时，请重试", function() { callAPI(question); });\n' +
'      } else {\n' +
'        showError(error.message || "网络错误", function() { callAPI(question); });\n' +
'      }\n' +
'    })\n' +
'    .finally(function() {\n' +
'      isLoading = false;\n' +
'      chatSend.disabled = chatInput.value.trim() === "";\n' +
'    });\n' +
'  }\n' +
'\n' +
'  function sendMessage() {\n' +
'    var question = chatInput.value.trim();\n' +
'    if (!question || isLoading) return;\n' +
'\n' +
'    addMessage(question, true);\n' +
'    chatInput.value = "";\n' +
'    chatSend.disabled = true;\n' +
'    chatInput.style.height = "auto";\n' +
'\n' +
'    // Hide presets after first message\n' +
'    if (chatPresets) {\n' +
'      chatPresets.style.display = "none";\n' +
'    }\n' +
'\n' +
'    callAPI(question);\n' +
'  }\n' +
'\n' +
'  chatBtn.addEventListener("click", toggleChat);\n' +
'  chatClose.addEventListener("click", closeChat);\n' +
'\n' +
'  chatInput.addEventListener("input", function() {\n' +
'    this.style.height = "auto";\n' +
'    this.style.height = Math.min(this.scrollHeight, 100) + "px";\n' +
'    chatSend.disabled = this.value.trim() === "" || isLoading;\n' +
'  });\n' +
'\n' +
'  chatInput.addEventListener("keydown", function(e) {\n' +
'    if (e.key === "Enter" && !e.shiftKey) {\n' +
'      e.preventDefault();\n' +
'      sendMessage();\n' +
'    }\n' +
'  });\n' +
'\n' +
'  chatSend.addEventListener("click", sendMessage);\n' +
'\n' +
'  // Preset questions\n' +
'  chatPresets.addEventListener("click", function(e) {\n' +
'    var btn = e.target.closest(".chat-preset-btn");\n' +
'    if (btn && btn.dataset.q) {\n' +
'      chatInput.value = btn.dataset.q;\n' +
'      sendMessage();\n' +
'    }\n' +
'  });\n' +
'\n' +
'  // Escape key to close\n' +
'  document.addEventListener("keydown", function(e) {\n' +
'    if (e.key === "Escape" && isOpen) {\n' +
'      closeChat();\n' +
'    }\n' +
'  });\n' +
'\n' +
'  // Click outside to close\n' +
'  document.addEventListener("click", function(e) {\n' +
'    if (isOpen && !chatWindow.contains(e.target) && e.target !== chatBtn && !chatBtn.contains(e.target)) {\n' +
'      closeChat();\n' +
'    }\n' +
'  });\n' +
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
'      html += \'<div class="search-result-item" data-url="\' + m.url + \'">\' +\n' +
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
'  results.addEventListener("click", function(e) {\n' +
'    var item = e.target.closest(".search-result-item");\n' +
'    if (item && item.dataset.url) window.location.href = item.dataset.url;\n' +
'  });\n' +
'  overlay.addEventListener("click", function(e) { if (e.target === overlay) closeSearch(); });\n' +
'  document.addEventListener("keydown", function(e) { if (e.key === "Escape") closeSearch(); });\n' +
'\n' +
'  // Override search icon click\n' +
'  var searchBtn = document.querySelector(".nav-search-btn");\n' +
'  if (searchBtn) {\n' +
'    searchBtn.addEventListener("click", function(e) {\n' +
'      e.preventDefault();\n' +
'      e.stopImmediatePropagation();\n' +
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
      if (content.indexOf('ai-chat-widget') !== -1) continue;
      content = content.replace(/<\/head>/, headCSS + '\n</head>');
      content = content.replace(/<\/body>/, '\n' + chatWidgetHTML + '\n' + bodyScript + '\n</body>');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

// Only run when executed directly (not when loaded by Hexo)
if (require.main === module) {
  var publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    processDir(publicDir);
    console.log('[inject] Custom styles, animations and search UI injected.');
  } else {
    console.log('[inject] public directory not found.');
  }
}
