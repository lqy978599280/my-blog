var API_ENDPOINT = 'https://apihub.agnes-ai.com/v1/images/generations';
var API_KEY = 'sk-r7fpxCxzQDAkXJ0mD26Km1j65EcwHj5rI7x8VYBnfm9uj9V1';
var MODEL = 'agnes-image-2.1-flash';

var SIZE_OPTIONS = [
  { label: '1024 × 1024', value: '1024x1024' },
  { label: '1024 × 1792 (竖版)', value: '1024x1792' },
  { label: '1792 × 1024 (横版)', value: '1792x1024' },
  { label: '1536 × 1536', value: '1536x1536' },
  { label: '1536 × 2560 (竖版4K)', value: '1536x2560' },
  { label: '2560 × 1536 (横版4K)', value: '2560x1536' }
];

/**
 * 文生图 API 调用
 */
function callTextToImageApi(prompt, size, onStatus) {
  var controller = new AbortController();
  var timeoutId = setTimeout(function () {
    controller.abort();
  }, 180000);

  if (onStatus) {
    onStatus('正在生成图片...');
  }

  var requestBody = {
    model: MODEL,
    prompt: prompt,
    size: size,
    extra_body: {
      response_format: 'url'
    }
  };

  return fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY
    },
    body: JSON.stringify(requestBody),
    signal: controller.signal
  })
  .then(function (response) {
    clearTimeout(timeoutId);
    if (!response.ok) {
      return response.json().then(function (errData) {
        var msg = (errData && errData.message) || 'API请求失败: ' + response.status;
        throw new Error(msg);
      });
    }
    return response.json();
  })
  .then(function (data) {
    if (!data || !data.data || !data.data[0]) {
      throw new Error('无效的API响应');
    }
    if (onStatus) {
      onStatus('图片生成完成');
    }
    return data.data[0];
  })
  .catch(function (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('请求超时（180秒），请重试');
    }
    throw err;
  });
}

/**
 * 图生图 API 调用
 */
function callImageToImageApi(prompt, size, imageInput, onStatus) {
  var controller = new AbortController();
  var timeoutId = setTimeout(function () {
    controller.abort();
  }, 180000);

  if (onStatus) {
    onStatus('正在基于参考图生成...');
  }

  var requestBody = {
    model: MODEL,
    prompt: prompt,
    size: size,
    extra_body: {
      response_format: 'url',
      image: [imageInput]
    }
  };

  return fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY
    },
    body: JSON.stringify(requestBody),
    signal: controller.signal
  })
  .then(function (response) {
    clearTimeout(timeoutId);
    if (!response.ok) {
      return response.json().then(function (errData) {
        var msg = (errData && errData.message) || 'API请求失败: ' + response.status;
        throw new Error(msg);
      });
    }
    return response.json();
  })
  .then(function (data) {
    if (!data || !data.data || !data.data[0]) {
      throw new Error('无效的API响应');
    }
    if (onStatus) {
      onStatus('图片生成完成');
    }
    return data.data[0];
  })
  .catch(function (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('请求超时（180秒），请重试');
    }
    throw err;
  });
}

/**
 * 通过 Blob 下载图片（优先 fetch blob，跨域失败时 fallback 到新标签页）
 */
function downloadImageViaBlob(imageUrl, filename) {
  return fetch(imageUrl, { mode: 'cors' })
    .then(function (response) {
      return response.blob();
    })
    .then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename || 'ai-generated-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(function () {
      window.open(imageUrl, '_blank');
    });
}

export function useImageGenerator() {
  return {
    callTextToImageApi: callTextToImageApi,
    callImageToImageApi: callImageToImageApi,
    downloadImageViaBlob: downloadImageViaBlob,
    SIZE_OPTIONS: SIZE_OPTIONS,
    MODEL: MODEL
  };
}
