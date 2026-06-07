/**
 * download.js — Bitweb Core download page
 * Fetches releases from GitHub API, filters to the last 2 major versions,
 * renders download cards.
 *
 * All UI strings come from data-i18n-* attributes on #bwc-download-root —
 * no inline translations.
 *
 * Versioning convention:
 *   v30.3    → major = 30   (production release)
 *   v30.3.1  → major = 30   (production release)
 *   v0.x.y   → ignored      (test/legacy builds — leading 0 means pre-production)
 *
 * Requires: Bootstrap 5
 */

(() => {
  "use strict";

  const REPO         = "bitweb-project/bitweb";
  const API_URL      = `https://api.github.com/repos/${REPO}/releases`;
  const RELEASES_URL = `https://github.com/${REPO}/releases`;

  // ── Parse major version from tag ───────────────────────────
  const parseMajor = (tag) => {
    const s = tag.replace(/^v/, "");
    const first = parseInt(s.split(".")[0], 10);
    if (!first || first === 0) return -1;   // v0.x.y = test release, skip
    return first;
  };

  // ── Filter: keep only releases from the last 2 major series ─
  const filterToTop2Majors = (releases) => {
    const majors = [
      ...new Set(
        releases
          .map((r) => parseMajor(r.tag_name))
          .filter((m) => m >= 0)
      ),
    ].sort((a, b) => b - a);

    const top2 = new Set(majors.slice(0, 2));
    return releases.filter((r) => top2.has(parseMajor(r.tag_name)));
  };

  // ── Safe DOM helpers (no XSS) ─────────────────────────────
  const el = (tag, attrs = {}, ...children) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "cls") e.className = v;
      else if (k === "text") e.textContent = v;
      else e.setAttribute(k, v);
    }
    for (const child of children) {
      if (child)
        e.appendChild(
          typeof child === "string" ? document.createTextNode(child) : child
        );
    }
    return e;
  };

  // ── OS detection from filename ─────────────────────────────
  const osInfo = (name) => {
    if (/win64/.test(name))
      return { icon: "fa-brands fa-windows", label: "Windows" };
    if (/arm64-apple-darwin|x86_64-apple-darwin/.test(name))
      return { icon: "fa-brands fa-apple", label: "macOS" };
    if (/aarch64-linux/.test(name))
      return { icon: "fa-brands fa-linux", label: "Linux arm64" };
    if (/arm-linux/.test(name))
      return { icon: "fa-brands fa-linux", label: "Linux armhf" };
    if (/x86_64-linux/.test(name))
      return { icon: "fa-brands fa-linux", label: "Linux x86_64" };
    if (/powerpc64-linux/.test(name))
      return { icon: "fa-brands fa-linux", label: "Linux ppc64" };
    if (/riscv64-linux/.test(name))
      return { icon: "fa-brands fa-linux", label: "Linux riscv64" };
    if (/\.tar\.gz$/.test(name) && !/linux|darwin/.test(name))
      return { icon: "fa-solid fa-file-zipper", label: "Source" };
    return { icon: "fa-solid fa-file-arrow-down", label: "Other" };
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const isDebug  = (name) => /-debug\./.test(name);
  const isSource = (name) =>
    name === "SHA256SUMS" ||
    name === "SHA256SUMS.asc" ||
    (/\.tar\.gz$/.test(name) && !/linux|darwin/.test(name));
  const isSums = (name) =>
    name === "SHA256SUMS" || name === "SHA256SUMS.asc";

  // ── Copy to clipboard ─────────────────────────────────────
  const copyText = async (text, btn) => {
    try {
      await navigator.clipboard.writeText(text);
      const orig = btn.textContent;
      btn.textContent = "✓";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove("copied");
      }, 1800);
    } catch (_) {
      /* clipboard not available */
    }
  };

  // ── Build a single download card ──────────────────────────
  const buildCard = (asset, sha256, dlLabel) => {
    const { icon, label } = osInfo(asset.name);
    const sizeStr = formatSize(asset.size);

    const nameSpan = el("span", { cls: "bwc-dl-filename", text: asset.name });
    const sizeSpan = el("span", { cls: "bwc-dl-size", text: sizeStr });
    const osIcon   = el("i", { cls: `${icon} bwc-dl-os-icon`, title: label });

    const dlBtn = el("a", {
      cls:  "btn btn-bwc-primary btn-sm ms-auto flex-shrink-0",
      href: asset.browser_download_url,
      rel:  "noopener noreferrer",
      text: dlLabel,
    });

    const card = el("div", { cls: "bwc-dl-card" }, osIcon, nameSpan, sizeSpan);

    if (sha256) {
      const hashBox = el("code", { cls: "bwc-hash", title: "Click to copy SHA256" });
      hashBox.textContent = sha256;
      hashBox.addEventListener("click", () => copyText(sha256, hashBox));
      card.appendChild(hashBox);
    }

    card.appendChild(dlBtn);
    return card;
  };

  // ── Parse SHA256SUMS asset content ────────────────────────
  const fetchSums = async (sumsAsset) => {
    const map = new Map();
    if (!sumsAsset) return map;
    try {
      const res  = await fetch(sumsAsset.browser_download_url);
      const text = await res.text();
      for (const line of text.split("\n")) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          map.set(parts[1].replace(/^\*/, ""), parts[0]);
        }
      }
    } catch (_) {
      /* ignore fetch errors for sums */
    }
    return map;
  };

  // ── Render one release ────────────────────────────────────
  const renderRelease = (release, shaMap, container, showDebug, i18n) => {
    const assets = release.assets ?? [];

    const groups = { windows: [], macos: [], linux: [], other: [] };

    for (const asset of assets) {
      if (isSums(asset.name))                        continue;
      if (isSource(asset.name))                      continue;
      if (isDebug(asset.name) && !showDebug)         continue;

      const { label } = osInfo(asset.name);
      if (/Windows/.test(label))    groups.windows.push(asset);
      else if (/macOS/.test(label)) groups.macos.push(asset);
      else if (/Linux/.test(label)) groups.linux.push(asset);
      else                          groups.other.push(asset);
    }

    for (const [groupName, groupAssets] of Object.entries(groups)) {
      if (!groupAssets.length) continue;

      const groupEl = el("div", { cls: "mb-3" });
      groupEl.appendChild(
        el("div", {
          cls:  "small text-secondary fw-semibold mb-2 text-uppercase",
          text: groupName,
        })
      );

      for (const asset of groupAssets) {
        const sha = shaMap.get(asset.name) ?? null;
        groupEl.appendChild(buildCard(asset, sha, i18n.dlBtn));
      }

      container.appendChild(groupEl);
    }
  };

  // ── Main init ─────────────────────────────────────────────
  const init = async () => {
    const wrapper = document.getElementById("bwc-download-root");
    if (!wrapper) return;

    // Read i18n strings from data-* attributes (set in full-node.njk template)
    const ds   = wrapper.dataset;
    const i18n = {
      loading:    ds.i18nLoading    ?? "Loading releases…",
      error:      ds.i18nError      ?? "Failed to load releases. Visit",
      debug:      ds.i18nDebug      ?? "Show debug builds",
      version:    ds.i18nVersion    ?? "Version",
      latest:     ds.i18nLatest     ?? "latest",
      notes:      ds.i18nNotes      ?? "↗ Release notes on GitHub",
      noReleases: ds.i18nNoReleases ?? "No releases found.",
      dlBtn:      ds.i18nDlBtn      ?? "↓ Download",
    };

    // Skeleton
    for (let i = 0; i < 3; i++) {
      wrapper.appendChild(el("div", { cls: "bwc-skeleton" }));
    }
    const statusEl = el("p", { cls: "text-secondary small", text: i18n.loading });
    wrapper.appendChild(statusEl);

    let allReleases;
    try {
      const res = await fetch(API_URL, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allReleases = await res.json();
    } catch {
      wrapper.innerHTML = "";
      const msg  = el("div", { cls: "alert alert-warning" });
      const link = el("a", { href: RELEASES_URL, target: "_blank", rel: "noopener" });
      link.textContent = RELEASES_URL;
      msg.appendChild(document.createTextNode(`${i18n.error} `));
      msg.appendChild(link);
      wrapper.appendChild(msg);
      return;
    }

    // Clear skeletons
    wrapper.innerHTML = "";

    if (!allReleases.length) {
      wrapper.appendChild(el("p", { cls: "text-secondary", text: i18n.noReleases }));
      return;
    }

    // Filter to last 2 major version series
    const releases = filterToTop2Majors(allReleases);
    if (!releases.length) {
      wrapper.appendChild(el("p", { cls: "text-secondary", text: i18n.noReleases }));
      return;
    }

    const latest = releases[0];

    // ── Version selector ──────────────────────────────────
    const selectorRow  = el("div", { cls: "d-flex align-items-center gap-3 mb-4 flex-wrap" });
    const versionLabel = el("span", { cls: "fw-semibold", text: `${i18n.version}:` });
    const select       = el("select", {
      cls:         "bwc-version-select",
      id:          "bwc-version-select",
      "aria-label": "Select version",
    });

    for (const rel of releases) {
      const opt = el("option", { value: rel.id });
      opt.textContent =
        rel.tag_name +
        (rel.id === latest.id ? ` (${i18n.latest})` : "");
      select.appendChild(opt);
    }

    const debugToggle  = el("div", { cls: "form-check form-switch mb-0 ms-auto" });
    const debugInput   = el("input", {
      cls:  "form-check-input",
      type: "checkbox",
      id:   "bwc-debug-toggle",
      role: "switch",
    });
    const debugLabelEl = el("label", {
      cls:  "form-check-label small text-secondary",
      for:  "bwc-debug-toggle",
      text: i18n.debug,
    });
    debugToggle.appendChild(debugInput);
    debugToggle.appendChild(debugLabelEl);

    selectorRow.appendChild(versionLabel);
    selectorRow.appendChild(select);
    selectorRow.appendChild(debugToggle);
    wrapper.appendChild(selectorRow);

    const releaseContainer = el("div", { id: "bwc-release-content" });
    wrapper.appendChild(releaseContainer);

    // ── Render selected version ────────────────────────────
    const renderSelected = async () => {
      const selectedId = parseInt(select.value, 10);
      const rel        = releases.find((r) => r.id === selectedId) ?? latest;
      const showDebug  = debugInput.checked;

      releaseContainer.innerHTML = "";

      // Version header
      const hdr    = el("div", { cls: "d-flex align-items-center gap-2 mb-3 flex-wrap" });
      const nameEl = el("span", { cls: "fw-bold", text: rel.name || rel.tag_name });
      hdr.appendChild(nameEl);

      if (rel.id === latest.id) {
        hdr.appendChild(el("span", { cls: "bwc-badge-latest", text: i18n.latest }));
      }

      if (rel.published_at) {
        hdr.appendChild(
          el("span", {
            cls:  "text-secondary small",
            text: new Date(rel.published_at).toLocaleDateString(),
          })
        );
      }

      releaseContainer.appendChild(hdr);

      // Release notes link
      if (rel.html_url) {
        const notesLink = el("a", {
          href:   rel.html_url,
          target: "_blank",
          rel:    "noopener noreferrer",
          cls:    "small text-secondary d-inline-block mb-3",
          text:   i18n.notes,
        });
        releaseContainer.appendChild(notesLink);
      }

      // Fetch SHA256SUMS
      const sumsAsset = (rel.assets ?? []).find((a) => a.name === "SHA256SUMS");
      const shaMap    = await fetchSums(sumsAsset);

      renderRelease(rel, shaMap, releaseContainer, showDebug, i18n);
    };

    select.addEventListener("change", renderSelected);
    debugInput.addEventListener("change", renderSelected);

    await renderSelected();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
