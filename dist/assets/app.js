(() => {
  'use strict';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  function closeMenu() { if(!menu) return; menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); mobileNav.hidden=true; }
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');mobileNav.hidden=!open;});
  $$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  window.matchMedia('(min-width:1001px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:.06,rootMargin:'0px 0px -20px 0px'});
    $$('.reveal').forEach(el=>observer.observe(el));
    document.documentElement.classList.add('motion-ready');
  }
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)document.documentElement.classList.remove('motion-ready');});
  const hero = $('.hero');
  const heroImg = $('.hero-visual img');
  const progress = $('.scroll-progress');
  let ticking = false;
  function scrollUpdate() {
    ticking=false;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    if(progress)progress.style.transform=`scaleX(${max>0?Math.min(1,window.scrollY/max):0})`;
    if(hero&&heroImg&&!reducedMotion.matches&&window.innerWidth>=1001){const rect=hero.getBoundingClientRect();if(rect.bottom>0){const p=Math.max(0,Math.min(1,-rect.top/rect.height));heroImg.style.transform=`translateY(${p*45}px) scale(${1+p*.055})`;}}
  }
  window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(scrollUpdate);}},{passive:true});
  scrollUpdate();

  const serviceDropdown = $('#header-services');
  const serviceToggle = $('.services-menu-toggle');
  function closeServicesMenu() {
    if(!serviceDropdown) return;
    serviceDropdown.hidden=true;
    serviceToggle.setAttribute('aria-expanded','false');
  }
  serviceToggle?.addEventListener('click',()=>{
    const open=serviceToggle.getAttribute('aria-expanded')!=='true';
    serviceToggle.setAttribute('aria-expanded',String(open));
    serviceDropdown.hidden=!open;
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.nav-services'))closeServicesMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&serviceToggle?.getAttribute('aria-expanded')==='true'){closeServicesMenu();serviceToggle.focus();}});
  $$('.services-dropdown a').forEach(a=>a.addEventListener('click',closeServicesMenu));
  const tabs=$$('[data-service-tab]');
  const panels=$$('[data-service-panel]');
  if(tabs.length){
    const validIds=tabs.map(t=>t.dataset.serviceTab);
    function selectService(id,scroll=false){
      if(!validIds.includes(id))id=validIds[0];
      tabs.forEach(t=>{const active=t.dataset.serviceTab===id;if(active)t.setAttribute('aria-current','true');else t.removeAttribute('aria-current');});
      panels.forEach(panel=>{
        const active=panel.dataset.servicePanel===id;panel.hidden=!active;
        if(active&&!reducedMotion.matches){panel.classList.remove('panel-enter');requestAnimationFrame(()=>panel.classList.add('panel-enter'));}
      });
      if(scroll)document.querySelector('.service-tabs').scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
    }
    function hashService(){let id='';try{id=decodeURIComponent(location.hash.slice(1));}catch{}selectService(id);}
    tabs.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();history.replaceState(null,'','#'+t.dataset.serviceTab);selectService(t.dataset.serviceTab);if(innerWidth<768)t.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'nearest',inline:'nearest'});}));
    window.addEventListener('hashchange',hashService);
    hashService();
  }
  const lightbox=$('#lightbox');
  if(lightbox){
    let galleryIndex=0;
    let lastTrigger=null;
    let items=$$('.gallery-item');
    function showImage(index){if(!items.length)return;galleryIndex=(index+items.length)%items.length;const item=items[galleryIndex];$('#lightbox-image').src=item.dataset.image;$('#lightbox-image').alt=$('img',item).alt;$('#lightbox-caption').textContent=item.dataset.caption+' · '+(galleryIndex+1)+' / '+items.length;}
    $$('.gallery-item').forEach(item=>item.addEventListener('click',()=>{lastTrigger=item;items=$$('.gallery-item').filter(x=>!x.hidden);showImage(items.indexOf(item));lightbox.showModal();}));
    $('.lightbox-close').addEventListener('click',()=>lightbox.close());
    $('.lightbox-prev').addEventListener('click',()=>showImage(galleryIndex-1));
    $('.lightbox-next').addEventListener('click',()=>showImage(galleryIndex+1));
    lightbox.addEventListener('click',e=>{if(e.target===lightbox){const r=lightbox.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)lightbox.close();}});
    lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showImage(galleryIndex+1);}if(e.key==='ArrowLeft'){e.preventDefault();showImage(galleryIndex-1);}});
    lightbox.addEventListener('close',()=>lastTrigger?.focus());
    $$('[data-gallery-filter]').forEach(b=>b.addEventListener('click',()=>{const category=b.dataset.galleryFilter;$$('[data-gallery-filter]').forEach(x=>{const a=x===b;x.classList.toggle('active',a);x.setAttribute('aria-pressed',String(a));});$$('.gallery-item').forEach(item=>{item.hidden=category!=='all'&&item.dataset.category!==category;item.classList.add('is-visible');});}));
  }
})();
