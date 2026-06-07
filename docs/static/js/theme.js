(function () {
  'use strict';

  const ICONS = {
    auto: 'fa-circle-half-stroke',
    light: 'fa-sun',
    dark: 'fa-moon',
  };

  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  function resolveTheme(pref) {
    return pref === 'auto' ? (mq.matches ? 'dark' : 'light') : pref;
  }

  function applyTheme(pref) {
    const resolved = resolveTheme(pref);
    document.documentElement.setAttribute('data-bs-theme', resolved);
    localStorage.setItem('bwc-theme', pref);

    const icon = document.getElementById('bwc-theme-icon');
    if (icon) icon.className = `fa-solid ${ICONS[pref]}`;

    document.querySelectorAll('.bwc-theme-opt').forEach((btn) => {
      btn.classList.toggle('bwc-theme-active', btn.dataset.theme === pref);
    });
  }

  const saved = localStorage.getItem('bwc-theme') || 'auto';
  document.documentElement.setAttribute('data-bs-theme', resolveTheme(saved));

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(saved);
    document.querySelectorAll('.bwc-theme-opt').forEach((btn) => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });
    mq.addEventListener('change', () => {
      if (localStorage.getItem('bwc-theme') === 'auto') applyTheme('auto');
    });
  });
}());

// Hide broken logo images without inline onerror
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img.bwc-logo').forEach((img) => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });
});
