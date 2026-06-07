/**
 * rpc-sidebar.js — accordion + search for RPC docs
 * No var, no innerHTML with user data.
 */
(() => {
  "use strict";

  const init = () => {
    const nav     = document.getElementById("rpcNav");
    const search  = document.getElementById("rpcSearch");
    if (!nav) return;

    // ── Build accordion behaviour ────────────────────────
    const toggles = nav.querySelectorAll(".rpc-cat-toggle");

    const openCategory = (btn) => {
      const list = btn.nextElementSibling;
      if (!list) return;
      list.style.display = "block";
      btn.classList.remove("collapsed");
    };

    const closeCategory = (btn) => {
      const list = btn.nextElementSibling;
      if (!list) return;
      list.style.display = "none";
      btn.classList.add("collapsed");
    };

    toggles.forEach((btn) => {
      // Start: check if active link is inside this category
      const activeLink = btn.nextElementSibling?.querySelector(".active");
      if (activeLink) {
        openCategory(btn);
      } else {
        closeCategory(btn);
      }

      btn.addEventListener("click", () => {
        const isOpen = !btn.classList.contains("collapsed");
        if (isOpen) {
          closeCategory(btn);
        } else {
          openCategory(btn);
        }
      });
    });

    // ── Search ───────────────────────────────────────────
    if (!search) return;

    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      const categories = nav.querySelectorAll(".rpc-category");

      categories.forEach((cat) => {
        const links = cat.querySelectorAll(".rpc-method-link");
        let visibleCount = 0;

        links.forEach((link) => {
          const text = link.textContent.toLowerCase();
          const match = !query || text.includes(query);
          link.closest("li").style.display = match ? "" : "none";
          if (match) visibleCount++;
        });

        const btn  = cat.querySelector(".rpc-cat-toggle");
        const list = cat.querySelector(".rpc-method-list");

        if (query) {
          // Always show categories with matching results
          cat.style.display = visibleCount ? "" : "none";
          if (visibleCount && list) list.style.display = "block";
          if (btn) btn.classList.remove("collapsed");
        } else {
          cat.style.display = "";
          // Restore original state: only active-containing stays open
          const hasActive = cat.querySelector(".active");
          if (hasActive) {
            openCategory(btn);
          } else {
            closeCategory(btn);
          }
        }
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
