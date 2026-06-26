/**
 * rpc-sidebar.js — accordion, search, version switcher
 */
(() => {
  "use strict";

  const init = () => {
    const nav    = document.getElementById("rpcNav");
    const search = document.getElementById("rpcSearch");
    if (!nav) return;

    const openCat = (btn) => {
      const list = btn.nextElementSibling;
      if (list) list.style.display = "block";
      btn.classList.remove("collapsed");
    };

    const closeCat = (btn) => {
      const list = btn.nextElementSibling;
      if (list) list.style.display = "none";
      btn.classList.add("collapsed");
    };

    nav.querySelectorAll(".rpc-cat-toggle").forEach((btn) => {
      if (btn.nextElementSibling?.querySelector(".active")) {
        openCat(btn);
      } else {
        closeCat(btn);
      }
      btn.addEventListener("click", () => {
        btn.classList.contains("collapsed") ? openCat(btn) : closeCat(btn);
      });
    });

    if (search) {
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        nav.querySelectorAll(".rpc-category").forEach((cat) => {
          const links = cat.querySelectorAll(".rpc-method-link");
          let visible = 0;
          links.forEach((link) => {
            const match = !q || link.textContent.toLowerCase().includes(q);
            link.closest("li").style.display = match ? "" : "none";
            if (match) visible++;
          });
          const btn  = cat.querySelector(".rpc-cat-toggle");
          const list = cat.querySelector(".rpc-method-list");
          if (q) {
            cat.style.display = visible ? "" : "none";
            if (visible && list) list.style.display = "block";
            if (btn) btn.classList.remove("collapsed");
          } else {
            cat.style.display = "";
            cat.querySelector(".active") ? openCat(btn) : closeCat(btn);
          }
        });
      });
    }

    // Version switcher: if on a method page, jump to same method in new version
    document.querySelectorAll(".rpc-ver-item").forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetVer = link.dataset.rpcVer;
        if (!targetVer) return;

        const active = nav.querySelector(".rpc-method-link.active");
        if (!active) return;

        const method = active.dataset.rpcMethod;
        if (!method) return;

        const parts = window.location.pathname.split("/").filter(Boolean);
        // URL: /locale/development/rpc/VERSION/method/
        if (parts.length >= 4 && parts[2] === "rpc") {
          e.preventDefault();
          parts[3] = targetVer;
          window.location.href = "/" + parts.join("/") + "/";
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
