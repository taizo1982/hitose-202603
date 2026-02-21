/**
 * HITOSE Spring Campaign LP - JavaScript
 *
 * data-cv属性を持つ要素は自動でコンバージョン追跡されます
 * ビルド時にコンバージョンコードが自動挿入されます
 */

document.addEventListener('DOMContentLoaded', function() {
  // スムーズスクロール
  initSmoothScroll();

  // ヘッダーのスクロール制御
  initHeaderScroll();

  // スクロールアニメーション
  initScrollAnimations();

  // FAQアコーディオンのアクセシビリティ強化
  initFAQAccessibility();
});

/**
 * スムーズスクロール
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * ヘッダーのスクロール表示/非表示
 */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        const currentScrollY = window.scrollY;

        // スクロール位置に応じてクラスを切り替え
        if (currentScrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        // スクロール方向に応じてヘッダーを表示/非表示
        if (currentScrollY <= 100) {
          header.style.transform = 'translateY(0)';
        } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
          // 下スクロール - ヘッダーを隠す
          header.style.transform = 'translateY(-100%)';
        } else {
          // 上スクロール - ヘッダーを表示
          header.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  });
}

/**
 * スクロールアニメーション（Intersection Observer）
 * GPU加速とCSS変数による滑らかなスタガーアニメーション
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  if (animatedElements.length === 0) return;

  // Intersection Observer が使えない場合はすべて表示
  if (!('IntersectionObserver' in window)) {
    animatedElements.forEach(el => {
      el.style.setProperty('--stagger-delay', '0s');
      el.classList.add('is-visible');
    });
    return;
  }

  // グループ単位で要素インデックスを計算してCSS変数を設定
  const groupMap = new Map();
  animatedElements.forEach(el => {
    const group = el.closest('[data-stagger-group]') || el.parentElement;
    if (!group) {
      el.style.setProperty('--stagger-delay', '0s');
      return;
    }
    if (!groupMap.has(group)) {
      groupMap.set(group, []);
    }
    groupMap.get(group).push(el);
  });

  groupMap.forEach((elements) => {
    elements.forEach((el, index) => {
      el.style.setProperty('--stagger-delay', `${index * 0.08}s`);
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -5% 0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 即座にクラスを追加（遅延はCSS変数で制御）
        entry.target.classList.add('is-visible');
        // 一度表示したら監視を解除
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 各要素を監視
  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

/**
 * FAQアコーディオンのアクセシビリティ強化
 */
function initFAQAccessibility() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const summary = item.querySelector('summary');

    // キーボードナビゲーション
    summary.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.open = !item.open;
      }
    });
  });
}

/**
 * ページ読み込み完了時の処理
 */
window.addEventListener('load', function() {
  // 画像の遅延読み込み完了後にレイアウトシフトを防ぐ
  document.body.classList.add('loaded');
});

/**
 * コンバージョン追跡用のプレースホルダー
 * ビルド時に実際のコードに置き換えられます
 */
// __CONVERSION_CODE_PLACEHOLDER__
