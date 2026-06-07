/**
 * home.js — Bitweb homepage
 * Fetches the latest release tag from GitHub and populates #bwc-latest-ver.
 */

(() => {
  'use strict';

  const REPO    = 'bitweb-project/bitweb';
  const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

  const init = async () => {
    const el = document.getElementById('bwc-latest-ver');
    if (!el) return;

    try {
      const res  = await fetch(API_URL, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const tag  = data.tag_name;
      if (tag) el.textContent = tag;
    } catch (_) {
      /* leave the "—" placeholder if the fetch fails */
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
