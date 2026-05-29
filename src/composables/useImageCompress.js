/**
 * 图片上传处理工具
 * 保留高质量原图用于PPT背景
 */
export function useImageCompress() {

  /**
   * 处理图片：生成高质量背景图 + 缩略图
   * @param {File} file - 图片文件
   * @returns {Promise<{fullQuality: string, thumbnail: string, name: string, width: number, height: number}>}
   */
  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var img = new Image();

        img.onload = function () {
          // 生成高质量背景图（保留原始分辨率，只做适度缩放）
          var bgCanvas = document.createElement('canvas');
          var bgWidth = img.width;
          var bgHeight = img.height;

          // 限制最大分辨率，避免PPT文件过大
          var MAX_BG_WIDTH = 1920;
          var MAX_BG_HEIGHT = 1080;
          if (bgWidth > MAX_BG_WIDTH || bgHeight > MAX_BG_HEIGHT) {
            var ratio = Math.min(MAX_BG_WIDTH / bgWidth, MAX_BG_HEIGHT / bgHeight);
            bgWidth = Math.round(bgWidth * ratio);
            bgHeight = Math.round(bgHeight * ratio);
          }

          bgCanvas.width = bgWidth;
          bgCanvas.height = bgHeight;
          var bgCtx = bgCanvas.getContext('2d');
          bgCtx.drawImage(img, 0, 0, bgWidth, bgHeight);

          // 高质量输出（质量0.92，PNG不压缩）
          var fullQuality = bgCanvas.toDataURL('image/png');

          // 生成缩略图
          var thumbCanvas = document.createElement('canvas');
          var thumbRatio = Math.min(200 / img.width, 150 / img.height);
          thumbCanvas.width = Math.round(img.width * thumbRatio);
          thumbCanvas.height = Math.round(img.height * thumbRatio);
          thumbCanvas.getContext('2d').drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
          var thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.8);

          // 去掉data URL前缀
          var rawBase64 = fullQuality.split(',')[1];

          resolve({
            fullQuality: rawBase64,
            thumbnail: thumbnail,
            name: file.name,
            width: bgWidth,
            height: bgHeight
          });
        };

        img.onerror = function () {
          reject(new Error('图片加载失败'));
        };

        img.src = e.target.result;
      };

      reader.onerror = function () {
        reject(new Error('文件读取失败'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 验证文件类型
   * @param {File} file
   * @returns {boolean}
   */
  function isValidImage(file) {
    var validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    return validTypes.indexOf(file.type) !== -1;
  }

  /**
   * 格式化文件大小
   * @param {number} bytes
   * @returns {string}
   */
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return {
    compressImage: compressImage,
    isValidImage: isValidImage,
    formatSize: formatSize
  };
}
