/**
 * lifecycle.js — Bitweb Core release lifecycle page
 * Fetches all releases, groups by major version, shows the last 2 majors as
 * "Supported", everything older as "End of Life".
 *
 * Versioning convention:
 *   v30.3    → major = 30   (production release)
 *   v30.3.1  → major = 30   (production release)
 *   v0.x.y   → ignored      (test/legacy builds)
 */

(() => {
  "use strict";

  const REPO    = "bitweb-project/bitweb";
  const API_URL = `https://api.github.com/repos/${REPO}/releases`;

  // ── Parse major version from tag ───────────────────────────
  const parseMajor = (tag) => {
    const s = tag.replace(/^v/, "");
    const first = parseInt(s.split(".")[0], 10);
    if (!first || first === 0) return -1;   // v0.x.y = test release, skip
    return first;
  };

  // ── Safe DOM helpers ────────────────────────────────────────
  const el = (tag, attrs = {}, ...children) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "cls") e.className = v;
      else if (k === "text") e.textContent = v;
      else e.setAttribute(k, v);
    }
    for (const child of children) {
      if (child) e.appendChild(
        typeof child === "string" ? document.createTextNode(child) : child
      );
    }
    return e;
  };

  // ── Main ────────────────────────────────────────────────────
  const init = async () => {
    const wrapper = document.getElementById("bwc-lifecycle-root");
    if (!wrapper) return;

    const ds = wrapper.dataset;
    const i18n = {
      loading:   ds.i18nLoading   ?? "Loading…",
      error:     ds.i18nError     ?? "Failed to load releases.",
      supported: ds.i18nSupported ?? "Supported",
      eol:       ds.i18nEol       ?? "End of Life",
      status:    ds.i18nStatus    ?? "Status",
      released:  ds.i18nReleased  ?? "Released",
      version:   ds.i18nVersion   ?? "Version",
    };

    // Skeleton
    wrapper.appendChild(el("p", { cls: "text-secondary small", text: i18n.loading }));

    let releases;
    try {
      const res = await fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      releases = await res.json();
    } catch {
      wrapper.innerHTML = "";
      wrapper.appendChild(el("div", { cls: "alert alert-warning", text: i18n.error }));
      return;
    }

    wrapper.innerHTML = "";

    if (!releases.length) {
      wrapper.appendChild(el("p", { cls: "text-secondary" }, i18n.error));
      return;
    }

    // Group by major version
    const byMajor = new Map();
    for (const r of releases) {
      const m = parseMajor(r.tag_name);
      if (m < 0) continue;
      if (!byMajor.has(m)) byMajor.set(m, []);
      byMajor.get(m).push(r);
    }

    // Determine top-2 supported majors
    const allMajors = [...byMajor.keys()].sort((a, b) => b - a);
    const supported = new Set(allMajors.slice(0, 2));

    // Build table
    const table  = el("table", { cls: "table table-sm table-bordered bwc-lifecycle-table" });
    const thead  = el("thead");
    const trHead = el("tr");
    trHead.appendChild(el("th", { text: i18n.version }));
    trHead.appendChild(el("th", { text: i18n.released }));
    trHead.appendChild(el("th", { text: i18n.status }));
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = el("tbody");

    for (const major of allMajors) {
      const isSupported = supported.has(major);
      const seriesReleases = byMajor.get(major).sort(
        (a, b) => new Date(b.published_at) - new Date(a.published_at)
      );

      for (const r of seriesReleases) {
        const tr = el("tr");

        // Version + link
        const tdVer = el("td");
        const link  = el("a", {
          href:   r.html_url,
          target: "_blank",
          rel:    "noopener noreferrer",
          text:   r.tag_name,
        });
        tdVer.appendChild(link);
        tr.appendChild(tdVer);

        // Date
        const dateStr = r.published_at
          ? new Date(r.published_at).toLocaleDateString()
          : "—";
        tr.appendChild(el("td", { text: dateStr }));

        // Status badge
        const tdStatus = el("td");
        const badge = el("span", {
          cls:  isSupported
            ? "badge bg-success text-white"
            : "badge bg-secondary text-white",
          text: isSupported ? i18n.supported : i18n.eol,
        });
        tdStatus.appendChild(badge);
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
      }
    }

    table.appendChild(tbody);

    // Anchor for #schedule
    const anchor = el("span", { id: "schedule" });
    wrapper.appendChild(anchor);
    wrapper.appendChild(table);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
