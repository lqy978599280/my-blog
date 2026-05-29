/**
 * PPT生成器核心逻辑
 * AI API调用 + JSON解析 + pptxgenjs渲染 + 浏览器下载
 */
import PptxGenJS from 'pptxgenjs';

var API_ENDPOINT = 'https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages';
var API_KEY = 'tp-ck566wwq6qo6295enlcmm5ud565ej0dcaiw7i5qmw3upl3gp';
var MODEL = 'mimo-v2.5';

var SYSTEM_PROMPT = [
  '你是一个PPT设计师。根据用户要求，直接输出一个JSON对象（不要markdown代码块，不要解释）。',
  '坐标单位：英寸。16:9画布=10x5.625。颜色6位hex无#号。',
  'JSON格式：{"title":"标题","theme":{"bgColor":"0F1629","cardColor":"1E293B","primaryColor":"3B82F6","secondaryColor":"06B6D4","accentColor":"10B981","textColor":"FFFFFF","mutedColor":"94A3B8"},"slides":[{"background":"0F1629","elements":[{"type":"title","text":"...","x":0.5,"y":0.3,"w":9,"h":0.7,"fontSize":32,"color":"FFFFFF","bold":true},{"type":"text","text":"...","x":0.5,"y":1.3,"w":4.2,"h":3,"fontSize":14,"color":"CBD5E1","lineSpacingMultiple":1.5},{"type":"bullet","items":["要点1","要点2"],"x":0.8,"y":2,"w":3.6,"h":2.5,"fontSize":14,"color":"CBD5E1","lineSpacingMultiple":1.8},{"type":"shape","shape":"rect","x":0,"y":0,"w":10,"h":0.04,"fill":"3B82F6"},{"type":"card","x":0.5,"y":1.3,"w":4.2,"h":3,"fill":"1E293B","accentColor":"06B6D4"}]}]}',
  '元素类型：title(大标题),text(正文),bullet(列表items数组),shape(形状),card(卡片+左侧彩条)',
  '要求：第一页封面，最后一页总结，内容页加页码x:8.5,y:5.25，卡片左侧加0.06宽彩条，边距0.5。'
].join('\n');

var DEFAULT_THEME = {
  bgColor: '0F1629',
  cardColor: '1E293B',
  primaryColor: '3B82F6',
  secondaryColor: '06B6D4',
  accentColor: '10B981',
  textColor: 'FFFFFF',
  mutedColor: '94A3B8'
};

/**
 * 调用AI API生成PPT布局JSON
 */
function callAiApi(prompt, content, hasTemplateImage, slideCount, stylePreset, onStatus) {
  var controller = new AbortController();
  var timeoutId = setTimeout(function () { controller.abort(); }, 120000);

  if (onStatus) onStatus('正在分析需求...');

  // 构建用户提示
  var userText = 'Prompt: ' + prompt;
  if (content && content.trim()) {
    userText += '\n\nContent/Copy:\n' + content;
  }
  userText += '\n\nSlide count: ' + slideCount;
  userText += '\nStyle: ' + stylePreset;
  if (hasTemplateImage) {
    userText += '\n\nNote: A background image has been uploaded and will be applied as the background for ALL slides. Please design the layout accordingly - use semi-transparent card backgrounds (transparency 20-40%) so the background image shows through. Do NOT add any image elements in the JSON.';
  }

  return fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16384,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userText }]
    }),
    signal: controller.signal
  })
  .then(function (response) {
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error('API请求失败: ' + response.status);
    }
    return response.json();
  })
  .then(function (data) {
    if (onStatus) onStatus('正在解析布局...');
    console.log('[PPT Generator] API response:', JSON.stringify(data).substring(0, 500));

    if (!data || !data.content) {
      throw new Error('无效的API响应');
    }

    // 遍历 content 数组，找到可用的内容
    var textContent = '';
    for (var i = 0; i < data.content.length; i++) {
      var item = data.content[i];
      // 优先取 text 类型
      if (item.type === 'text' && item.text) {
        textContent = item.text;
        break;
      }
    }

    // 如果没有 text 类型，尝试从 thinking 中提取 JSON
    if (!textContent) {
      for (var j = 0; j < data.content.length; j++) {
        var contentItem = data.content[j];
        if (contentItem.type === 'thinking' && contentItem.thinking) {
          // 从 thinking 内容中提取 JSON
          var firstBrace = contentItem.thinking.indexOf('{');
          var lastBrace = contentItem.thinking.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            textContent = contentItem.thinking.substring(firstBrace, lastBrace + 1);
            break;
          }
        }
      }
    }

    if (textContent) {
      return textContent;
    }

    throw new Error('未能获取有效响应');
  })
  .catch(function (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('请求超时（120秒），请重试');
    }
    throw err;
  });
}

/**
 * 解析AI返回的JSON（3层容错策略）
 */
function parseSlideJson(rawText) {
  // 策略1：直接解析
  try {
    return JSON.parse(rawText);
  } catch (e) { /* continue */ }

  // 策略2：提取markdown代码块
  var fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (e) { /* continue */ }
  }

  // 策略3：查找首尾花括号
  var firstBrace = rawText.indexOf('{');
  var lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
    } catch (e) { /* continue */ }
  }

  throw new Error('AI返回的格式无效，请重试');
}

/**
 * 验证并修正slide数据
 */
function validateSlideJson(data) {
  if (!data || !Array.isArray(data.slides) || data.slides.length === 0) {
    throw new Error('无效的幻灯片数据');
  }

  for (var i = 0; i < data.slides.length; i++) {
    var slide = data.slides[i];
    if (!Array.isArray(slide.elements)) {
      throw new Error('第' + (i + 1) + '页缺少元素数据');
    }
    for (var j = 0; j < slide.elements.length; j++) {
      var el = slide.elements[j];
      if (!el.type) {
        throw new Error('第' + (i + 1) + '页第' + (j + 1) + '个元素缺少类型');
      }
      // 补全默认坐标
      if (el.type !== 'image') {
        if (el.x === undefined || el.x === null) el.x = 0;
        if (el.y === undefined || el.y === null) el.y = 0;
        if (el.w === undefined || el.w === null) el.w = 9;
        if (el.h === undefined || el.h === null) el.h = 0.5;
      }
    }
  }

  return data;
}

/**
 * 渲染单个元素到幻灯片
 */
function renderElement(slide, el, theme) {
  switch (el.type) {
    case 'title':
    case 'text':
      slide.addText(el.text || '', {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        fontSize: el.fontSize || 14,
        fontFace: el.fontFace || 'Microsoft YaHei',
        color: el.color || theme.textColor,
        bold: el.bold || false,
        italic: el.italic || false,
        align: el.align || 'left',
        valign: el.valign || 'top',
        lineSpacingMultiple: el.lineSpacingMultiple || 1.2,
        margin: 0
      });
      break;

    case 'bullet':
      var items = el.items || [];
      var textArr = [];
      for (var i = 0; i < items.length; i++) {
        textArr.push({
          text: items[i],
          options: {
            bullet: true,
            breakLine: i < items.length - 1
          }
        });
      }
      slide.addText(textArr, {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        fontSize: el.fontSize || 12,
        fontFace: el.fontFace || 'Microsoft YaHei',
        color: el.color || theme.mutedColor,
        lineSpacingMultiple: el.lineSpacingMultiple || 1.5,
        valign: 'top'
      });
      break;

    case 'shape':
      slide.addShape(el.shape || 'rect', {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        fill: { color: el.fill || theme.primaryColor },
        rectRadius: el.rectRadius || 0
      });
      break;

    case 'card':
      // 卡片背景
      slide.addShape('rect', {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        fill: { color: el.fill || theme.cardColor },
        shadow: {
          type: 'outer',
          color: '000000',
          blur: 8,
          offset: 3,
          angle: 135,
          opacity: 0.25
        }
      });
      // 左侧彩色装饰条
      slide.addShape('rect', {
        x: el.x,
        y: el.y,
        w: 0.06,
        h: el.h,
        fill: { color: el.accentColor || theme.primaryColor }
      });
      break;

    case 'image':
      // 图片元素（template引用上传的图片）
      if (el.src === 'template' && el._imageData) {
        slide.addImage({
          data: 'image/jpeg;base64,' + el._imageData,
          x: el.x,
          y: el.y,
          w: el.w,
          h: el.h
        });
      }
      break;
  }
}

/**
 * 生成PPT Blob
 * @param {Object} slideData - AI返回的布局JSON
 * @param {string} templateImageBase64 - 上传的模板图片base64
 * @param {function} onStatus - 状态回调
 * @returns {Promise<Blob>}
 */
function generatePpt(slideData, templateImageBase64, onStatus) {
  if (onStatus) onStatus('正在构建PPT...');

  var pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'AI PPT Generator';
  pres.title = slideData.title || 'AI Generated Presentation';

  var theme = slideData.theme || DEFAULT_THEME;
  var totalSlides = slideData.slides.length;

  for (var i = 0; i < totalSlides; i++) {
    var slideDef = slideData.slides[i];
    var slide = pres.addSlide();

    // 设置背景：如果有模板图片则用图片背景，否则用纯色
    if (templateImageBase64) {
      slide.background = { data: 'image/png;base64,' + templateImageBase64 };
    } else {
      slide.background = { color: slideDef.background || theme.bgColor };
    }

    // 渲染所有元素
    for (var j = 0; j < slideDef.elements.length; j++) {
      var el = slideDef.elements[j];
      renderElement(slide, el, theme);
    }

    // 自动添加页码（封面和结尾页除外）
    if (i > 0 && i < totalSlides - 1) {
      slide.addText((i + 1) + ' / ' + totalSlides, {
        x: 8.5,
        y: 5.25,
        w: 1.2,
        h: 0.375,
        fontSize: 10,
        color: theme.mutedColor,
        align: 'center',
        valign: 'middle'
      });
    }
  }

  return pres.write({ outputType: 'blob' });
}

/**
 * 下载PPT文件
 */
function downloadPpt(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename || 'ai-generated.pptx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 获取风格预设提示
 */
function getStyleHint(stylePreset) {
  switch (stylePreset) {
    case 'dark-tech':
      return 'Dark tech theme: deep blue background (0F1629), electric blue accents (3B82F6), cyan highlights (06B6D4), modern and futuristic feel';
    case 'minimal-light':
      return 'Minimal light theme: white/light gray background, clean typography, subtle shadows, professional and understated';
    case 'corporate-blue':
      return 'Corporate blue theme: navy blue primary, white content areas, structured grid layout, formal business style';
    default:
      return 'Dark tech theme with modern aesthetics';
  }
}

export function usePptGenerator() {
  return {
    callAiApi: callAiApi,
    parseSlideJson: parseSlideJson,
    validateSlideJson: validateSlideJson,
    generatePpt: generatePpt,
    downloadPpt: downloadPpt,
    getStyleHint: getStyleHint,
    DEFAULT_THEME: DEFAULT_THEME
  };
}
