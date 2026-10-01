(() => {
  'use strict';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const main = $('#main');
  const routes = new Set(['/', '/services/', '/about/', '/gallery/', '/contact/']);
  const normalizePath = path => path === '/' ? '/' : path.replace(/\/+$/, '') + '/';
  let mountedPath = normalizePath(location.pathname);
  let pageLifetime, revealObserver, pageSyncHash = () => {};
  let hero, heroImage, ticking = false, navigationSequence = 0, pagesRequest;
  const templates = new Map();
  const pages = new Map();
  const progress = $('.scroll-progress');
  const announcer = document.createElement('div');
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  document.body.append(announcer);
  main.tabIndex = -1;

  // Keep an initial server-rendered page as a usable route before prefetching.
  pages.set(mountedPath, {
    html: main.innerHTML,
    title: document.title,
    description: $('meta[name="description"]')?.content || '',
    ogTitle: $('meta[property="og:title"]')?.content || document.title,
    canonical: $('link[rel="canonical"]')?.href || '',
    schema: JSON.parse($('script[type="application/ld+json"]').textContent),
  });

  function closeMobileMenu() {
    const menu = $('.menu-toggle');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    $('#mobile-nav').hidden = true;
  }
  function closeServicesMenu() {
    $('#header-services').hidden = true;
    $('.services-menu-toggle').setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    if (target.closest('.menu-toggle')) {
      const menu = $('.menu-toggle');
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      $('#mobile-nav').hidden = !open;
    }
    if (target.closest('.services-menu-toggle')) {
      const button = $('.services-menu-toggle');
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      $('#header-services').hidden = !open;
    } else if (!target.closest('.nav-services') || target.closest('.services-dropdown a')) closeServicesMenu();
    if (target.closest('#mobile-nav a')) closeMobileMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if ($('.menu-toggle').getAttribute('aria-expanded') === 'true') { closeMobileMenu(); $('.menu-toggle').focus(); }
    if ($('.services-menu-toggle').getAttribute('aria-expanded') === 'true') { closeServicesMenu(); $('.services-menu-toggle').focus(); }
  });
  matchMedia('(min-width:1001px)').addEventListener('change', event => { if (event.matches) closeMobileMenu(); });

  function observePage() {
    revealObserver?.disconnect();
    document.documentElement.classList.toggle('motion-ready', !reducedMotion.matches && 'IntersectionObserver' in window);
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .06, rootMargin: '0px 0px -20px 0px' });
    $$('.reveal', main).forEach(element => revealObserver.observe(element));
  }
  reducedMotion.addEventListener('change', observePage);
  function scrollUpdate() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    if (hero && heroImage && !reducedMotion.matches && innerWidth >= 1001) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0) { const p = Math.max(0, Math.min(1, -rect.top / rect.height)); heroImage.style.transform = `translateY(${p * 45}px) scale(${1 + p * .055})`; }
    }
  }
  let scrollSaveTimer;
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(scrollUpdate); }
    clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(() => {
      if (normalizePath(location.pathname) === mountedPath && !main.hasAttribute('aria-busy')) saveScroll();
    }, 150);
  }, { passive: true });

  function mountPage() {
    pageLifetime?.abort();
    pageLifetime = new AbortController();
    const options = { signal: pageLifetime.signal };
    hero = $('.hero', main);
    heroImage = $('.hero-visual img', main);
    pageSyncHash = () => {};
    const tabs = $$('[data-service-tab]', main);
    const panels = $$('[data-service-panel]', main);
    if (tabs.length) {
      const ids = tabs.map(tab => tab.dataset.serviceTab);
      function selectService(id) {
        if (!ids.includes(id)) id = ids[0];
        tabs.forEach(tab => { if (tab.dataset.serviceTab === id) tab.setAttribute('aria-current', 'true'); else tab.removeAttribute('aria-current'); });
        panels.forEach(panel => {
          const active = panel.dataset.servicePanel === id;
          panel.hidden = !active;
          if (active && !reducedMotion.matches) { panel.classList.remove('panel-enter'); requestAnimationFrame(() => { if (!options.signal.aborted) panel.classList.add('panel-enter'); }); }
        });
      }
      pageSyncHash = () => { let id = ''; try { id = decodeURIComponent(location.hash.slice(1)); } catch {} selectService(id); };
      tabs.forEach(tab => tab.addEventListener('click', event => {
        event.preventDefault();
        navigationSequence++;
        main.removeAttribute('aria-busy');
        history.replaceState(history.state, '', '#' + tab.dataset.serviceTab);
        selectService(tab.dataset.serviceTab);
        if (innerWidth < 768) tab.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
      }, options));
      pageSyncHash();
    }
    const lightbox = $('#lightbox', main);
    if (lightbox) {
      let index = 0, lastTrigger, items = $$('.gallery-item', main);
      function showImage(next) {
        if (!items.length) return;
        index = (next + items.length) % items.length;
        const item = items[index];
        $('#lightbox-image', main).src = item.dataset.image;
        $('#lightbox-image', main).alt = $('img', item).alt;
        $('#lightbox-caption', main).textContent = `${item.dataset.caption} · ${index + 1} / ${items.length}`;
      }
      $$('.gallery-item', main).forEach(item => item.addEventListener('click', () => {
        lastTrigger = item; items = $$('.gallery-item', main).filter(element => !element.hidden);
        showImage(items.indexOf(item)); lightbox.showModal();
      }, options));
      $('.lightbox-close', main).addEventListener('click', () => lightbox.close(), options);
      $('.lightbox-prev', main).addEventListener('click', () => showImage(index - 1), options);
      $('.lightbox-next', main).addEventListener('click', () => showImage(index + 1), options);
      lightbox.addEventListener('click', event => {
        if (event.target === lightbox) { const rect = lightbox.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close(); }
      }, options);
      lightbox.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); showImage(index + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(index - 1); }
      }, options);
      lightbox.addEventListener('close', () => lastTrigger?.focus(), options);
      $$('[data-gallery-filter]', main).forEach(button => button.addEventListener('click', () => {
        const category = button.dataset.galleryFilter;
        $$('[data-gallery-filter]', main).forEach(element => { element.classList.toggle('active', element === button); element.setAttribute('aria-pressed', String(element === button)); });
        $$('.gallery-item', main).forEach(item => { item.hidden = category !== 'all' && item.dataset.category !== category; item.classList.add('is-visible'); });
      }, options));
    }
    observePage(); scrollUpdate();
  }
  addEventListener('hashchange', () => { navigationSequence++; main.removeAttribute('aria-busy'); pageSyncHash(); });

  function loadPages() {
    if (pagesRequest) return pagesRequest;
    pagesRequest = fetch('/assets/pages.json', { cache: 'no-cache', credentials: 'same-origin' })
      .then(response => { if (!response.ok) throw Error('Page preload unavailable'); return response.json(); })
      .then(bundle => {
        if (bundle.version !== 1 || !bundle.pages) throw Error('Invalid page data');
        for (const path of routes) {
          const page = bundle.pages[path];
          if (!page || typeof page.html !== 'string' || typeof page.title !== 'string') throw Error('Incomplete page data');
        }
        for (const path of routes) pages.set(path, bundle.pages[path]);
        return pages;
      }).catch(error => { pagesRequest = undefined; throw error; });
    return pagesRequest;
  }
  const warmPages = () => { loadPages().catch(() => {}); };
  function updateHead(page) {
    document.title = page.title;
    for (const [attribute, key, value] of [['name', 'description', page.description], ['property', 'og:title', page.ogTitle], ['property', 'og:description', page.description], ['property', 'og:url', page.canonical]]) {
      let meta = $(`meta[${attribute}="${key}"]`);
      if (!value) { meta?.remove(); continue; }
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute(attribute, key); document.head.append(meta); }
      meta.content = value;
    }
    let canonical = $('link[rel="canonical"]');
    if (page.canonical) { if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); } canonical.href = page.canonical; }
    else canonical?.remove();
    $('script[type="application/ld+json"]').textContent = JSON.stringify(page.schema);
  }
  function updateNavigation(path) {
    $$('.desktop-nav > a, .nav-services > a, #mobile-nav > a').forEach(link => {
      const active = normalizePath(new URL(link.href).pathname) === path;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }
  function saveScroll() {
    history.replaceState({ ...history.state, sunilSpa: true, scroll: [scrollX, scrollY] }, '', location.href);
  }
  function restoreScroll(url, saved) {
    if (saved) { scrollTo({ left: saved[0], top: saved[1], behavior: 'instant' }); return; }
    let target;
    if (url.hash) { try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch {} }
    if (target && !target.hidden) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    else scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  async function navigate(url, { push = true, scroll } = {}) {
    const sequence = ++navigationSequence;
    const path = normalizePath(url.pathname);
    url.pathname = path;
    if (!routes.has(path)) { location.assign(url.href); return; }
    try {
      if (!pages.has(path)) { main.setAttribute('aria-busy', 'true'); await loadPages(); }
      if (sequence !== navigationSequence) return;
      const page = pages.get(path);
      if (push) { saveScroll(); if (url.href !== location.href) history.pushState({ sunilSpa: true, scroll: [0, 0] }, '', url.href); }
      closeMobileMenu(); closeServicesMenu();
      if (path !== mountedPath) {
        $('dialog[open]', main)?.close();
        pageLifetime?.abort(); revealObserver?.disconnect();
        if (!templates.has(path)) { const template = document.createElement('template'); template.innerHTML = page.html; templates.set(path, template); }
        main.replaceChildren(templates.get(path).content.cloneNode(true));
        mountedPath = path;
        document.body.dataset.page = path;
        document.documentElement.dataset.clientNavigation = 'true';
        updateHead(page); updateNavigation(path); mountPage();
        main.focus({ preventScroll: true });
        announcer.textContent = page.ogTitle;
      } else pageSyncHash();
      main.removeAttribute('aria-busy');
      restoreScroll(url, scroll);
      scrollUpdate();
    } catch {
      if (sequence !== navigationSequence) return;
      main.removeAttribute('aria-busy');
      // Server-rendered URLs remain a working fallback if preload fails.
      location.assign(url.href);
    }
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !routes.has(normalizePath(url.pathname))) return;
    event.preventDefault(); navigate(url);
  });
  for (const type of ['pointerover', 'focusin']) document.addEventListener(type, event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && routes.has(normalizePath(url.pathname))) warmPages();
  }, { passive: true });
  addEventListener('popstate', event => { navigate(new URL(location.href), { push: false, scroll: event.state?.scroll }); });
  history.scrollRestoration = 'manual';
  saveScroll();
  mountPage();
  const connection = navigator.connection;
  if (!connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || '')) {
    if ('requestIdleCallback' in window) requestIdleCallback(warmPages, { timeout: 600 });
    else setTimeout(warmPages, 150);
  }
})();
