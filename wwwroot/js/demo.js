// Leadwise CRM demo behavior.
// Plain JavaScript, no dependencies. Everything here is progressive: if this file
// fails to load, the dashboard still reads correctly, it just does not animate.
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth');

  /* ---------- Toasts ---------- */

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const toastRegion = $('#toastRegion');
  const MAX_TOASTS = 3;

  function makeIcon(name) {
    // Built with DOM calls instead of innerHTML so it also works under Trusted Types.
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', `#i-${name}`);
    svg.append(use);
    return svg;
  }

  function dismissToast(toast) {
    if (!toast.isConnected || toast.classList.contains('leaving')) return;
    toast.classList.add('leaving');
    window.setTimeout(() => toast.remove(), 200);
  }

  function showToast(title, message) {
    if (!toastRegion) return;

    // Keep the screen calm: older toasts make room for new ones.
    $$('.toast:not(.leaving)', toastRegion).slice(0, -(MAX_TOASTS - 1)).forEach(dismissToast);

    const toast = document.createElement('div');
    toast.className = 'toast';

    const badge = document.createElement('span');
    badge.className = 'toast-icon';
    badge.append(makeIcon('check'));

    const body = document.createElement('div');
    const heading = document.createElement('p');
    heading.className = 'toast-title';
    heading.textContent = title;
    const detail = document.createElement('p');
    detail.className = 'toast-text';
    detail.textContent = message;
    body.append(heading, detail);

    const close = document.createElement('button');
    close.className = 'toast-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.append(makeIcon('x'));
    close.addEventListener('click', () => dismissToast(toast));

    toast.append(badge, body, close);
    toastRegion.append(toast);
    window.setTimeout(() => dismissToast(toast), 5000);
  }

  // Any element with data-toast="Title|Message" shows a preview toast when clicked.
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-toast]');
    if (!trigger) return;
    if (trigger.tagName === 'A') event.preventDefault();
    const [title, ...rest] = trigger.dataset.toast.split('|');
    showToast(title, rest.join('|'));
  });

  /* ---------- Theme ---------- */

  const themeButton = $('#themeToggle');
  const themeMeta = $('meta[name="theme-color"]');
  const THEME_KEY = 'leadwise-theme';
  const THEME_COLORS = { light: '#f4f6fb', dark: '#0b1120' };

  function describeToggle(theme) {
    themeButton?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function hasSavedTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'light' || saved === 'dark';
    } catch (error) {
      return false;
    }
  }

  function applyTheme(theme, save) {
    root.classList.add('theme-anim');
    root.dataset.theme = theme;
    themeMeta?.setAttribute('content', THEME_COLORS[theme]);
    describeToggle(theme);
    window.setTimeout(() => root.classList.remove('theme-anim'), 350);

    if (save) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        // Not being able to save is fine. The choice just lasts for this visit.
      }
    }
  }

  describeToggle(root.dataset.theme);
  themeButton?.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });

  // Until someone picks a theme themselves, follow the operating system.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (!hasSavedTheme()) applyTheme(event.matches ? 'dark' : 'light', false);
  });

  /* ---------- Mobile drawer ---------- */

  const sidebar = $('#sidebar');
  const scrim = $('#scrim');
  const menuButton = $('#menuButton');
  const desktopQuery = window.matchMedia('(min-width: 64.0625rem)');

  function setDrawer(open, returnFocus = true) {
    if (!sidebar || !menuButton) return;
    const wasOpen = sidebar.classList.contains('open');
    if (open === wasOpen) return;

    sidebar.classList.toggle('open', open);
    scrim?.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

    if (open) {
      $('.nav-item', sidebar)?.focus();
    } else if (returnFocus) {
      menuButton.focus();
    }
  }

  menuButton?.addEventListener('click', () => setDrawer(!sidebar.classList.contains('open')));
  scrim?.addEventListener('click', () => setDrawer(false));
  sidebar?.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) setDrawer(false, false);
  });
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) setDrawer(false, false);
  });

  document.addEventListener('keydown', (event) => {
    if (!sidebar?.classList.contains('open')) return;

    if (event.key === 'Escape') {
      setDrawer(false);
      return;
    }

    // Keep Tab inside the open drawer so keyboard users cannot wander behind it.
    if (event.key === 'Tab') {
      const focusable = $$('a[href], button:not([disabled])', sidebar);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------- Greeting and date ---------- */

  const now = new Date();
  const greeting = $('#greeting');
  const today = $('#today');
  const hour = now.getHours();

  if (greeting) greeting.textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  if (today) {
    today.textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now);
    const pad = (n) => String(n).padStart(2, '0');
    today.setAttribute('datetime', `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
  }

  /* ---------- Animated stats ---------- */

  const counters = $$('[data-count]');

  // Building a number formatter is surprisingly costly, so we make one per decimal count and reuse it.
  const formatters = new Map();

  function formatCount(el, value) {
    const decimals = Number(el.dataset.decimals || 0);
    if (!formatters.has(decimals)) {
      formatters.set(decimals, new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
    }
    return `${el.dataset.prefix || ''}${formatters.get(decimals).format(value)}`;
  }

  function runCounter(el) {
    const target = Number(el.dataset.count);
    const duration = 1300;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // quick start, soft landing
      el.textContent = formatCount(el, target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Start every number at zero so it can count up when its card scrolls into view.
  if (!reduceMotion.matches) {
    counters.forEach((el) => { el.textContent = formatCount(el, 0); });
  }

  function reveal(container) {
    container.classList.add('is-visible');
    if (reduceMotion.matches) return;
    $$('[data-count]', container).forEach(runCounter);
  }

  const animated = $$('[data-animate]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    animated.forEach((el) => observer.observe(el));
  } else {
    animated.forEach((el) => {
      el.classList.add('is-visible');
      $$('[data-count]', el).forEach((n) => { n.textContent = formatCount(n, Number(n.dataset.count)); });
    });
  }

  /* ---------- Lead search and status filter ---------- */

  const searchInput = $('#leadSearch');
  const statusFilter = $('#statusFilter');
  const rows = $$('#leadRows tr[data-status]');
  const emptyRow = $('#emptyRow');
  const visibleCount = $('#visibleCount');

  function filterLeads() {
    const query = (searchInput?.value || '').toLowerCase().trim();
    const status = statusFilter?.value || 'all';
    let visible = 0;

    rows.forEach((row) => {
      const matchesText = !query || row.textContent.toLowerCase().includes(query);
      const matchesStatus = status === 'all' || row.dataset.status === status;
      const show = matchesText && matchesStatus;
      row.hidden = !show;
      if (show) visible += 1;
    });

    if (emptyRow) emptyRow.hidden = visible > 0;
    if (visibleCount) visibleCount.textContent = String(visible);
  }

  searchInput?.addEventListener('input', filterLeads);
  statusFilter?.addEventListener('change', filterLeads);

  $('#rangeFilter')?.addEventListener('change', () => {
    showToast('Time range', 'The charts use the same sample data for every range in this demo.');
  });

  /* ---------- Search shortcuts ---------- */

  function jumpToSearch() {
    if (!searchInput) return;
    searchInput.focus({ preventScroll: true });
    $('#leads')?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  }

  $('#searchButton')?.addEventListener('click', jumpToSearch);

  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    const typing = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    if (typing) return;
    event.preventDefault();
    jumpToSearch();
  });
})();
