/**
 * 滚动渐入动效 composable
 * 当元素进入视口时添加 revealed 类，触发 CSS 过渡动画
 */
export function useScrollReveal() {
  /**
   * 初始化滚动动效
   */
  function init() {
    const elements = document.querySelectorAll('.article, .archive-article');

    if (elements.length === 0) {
      return;
    }

    // 为每个元素添加初始隐藏状态
    for (const el of elements) {
      el.classList.add('animating');
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
    }

    // 使用 Intersection Observer 实现滚动检测
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
      }
    );

    // 观察所有元素
    for (const el of elements) {
      observer.observe(el);
    }

    // 立即检查视口内的元素
    requestAnimationFrame(() => {
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          el.classList.add('revealed');
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      }
    });
  }

  // 等待 DOM 更新后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
