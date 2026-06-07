(function () {
  const content = document.getElementById('wpContent');
  const toc = document.getElementById('wpToc');
  if (!content || !toc) return;

  const headings = content.querySelectorAll('h2, h3');
  if (!headings.length) return;

  const ul = document.createElement('ul');
  ul.className = 'list-unstyled wp-toc-list mb-0';

  headings.forEach(function (h) {
    if (!h.id) {
      h.id = h.textContent.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.trim();
    a.className = 'wp-toc-link' + (h.tagName === 'H3' ? ' wp-toc-h3' : '');

    a.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.getElementById(h.id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    li.appendChild(a);
    ul.appendChild(li);
  });

  toc.appendChild(ul);

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      const id = entry.target.id;
      const link = toc.querySelector('a[href="#' + id + '"]');
      if (!link) return;
      if (entry.isIntersecting) {
        toc.querySelectorAll('.wp-toc-link').forEach(function (l) {
          l.classList.remove('active');
        });
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-10% 0px -80% 0px', threshold: 0 });

  headings.forEach(function (h) { observer.observe(h); });
})();
