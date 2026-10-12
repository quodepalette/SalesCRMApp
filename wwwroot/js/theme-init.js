// Runs before the page paints so the saved theme is applied with no flash.
// It stays tiny and separate on purpose: the strict CSP does not allow inline scripts.
(function () {
  var root = document.documentElement;
  var theme = null;

  try {
    theme = localStorage.getItem('leadwise-theme');
  } catch (e) {
    // Storage can be blocked (private mode, strict settings). We just fall back to the system choice.
  }

  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  root.dataset.theme = theme;
  root.classList.add('js');

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1120' : '#f4f6fb');
})();
