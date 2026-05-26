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

    // 使用 Intersection Observer 实现滚动检测
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('animating');
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05
      }
    );

    // 立即检查视口内的元素，其余添加 animating 类
    const viewportHeight = window.innerHeight;
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight - 50) {
        // 已在视口内，直接显示
        el.classList.add('revealed');
      } else {
        // 不在视口，添加隐藏状态并观察
        el.classList.add('animating');
        observer.observe(el);
      }
    }
  }

  // 等待 DOM 更新后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
