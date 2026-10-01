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
  const serviceData=$('#service-data');
  if(serviceData){
    const services=JSON.parse(serviceData.textContent);
    const detail=$('#service-detail');
    let activeId='auto-repair';
    function selectService(id,{updateUrl=false,focusPanel=false}={}){
      const service=services.find(s=>s.id===id);if(!service)return;
      const changed=activeId!==id;activeId=id;
      $$('[data-service]').forEach(b=>{const active=b.dataset.service===id;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
      $$('[data-service-shortcut]').forEach(b=>{const active=b.dataset.serviceShortcut===id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
      detail.dataset.active=id;
      $('#service-title').textContent=service.title;
      $('#service-description').textContent=service.description;
      $('#service-detail-number').textContent=String(service.number).padStart(2,'0')+' / VEHICLE CARE';
      $('#service-icon').innerHTML=service.icon;
      const picture=$('#service-image');picture.src='/assets/'+service.image+'.webp';picture.alt=service.title+' automotive detail';
      $('#service-points').replaceChildren(...service.points.map(text=>{const li=document.createElement('li');li.innerHTML='<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>';li.append(document.createTextNode(text));return li;}));
      $('#service-enquiry').href='/contact/?service='+service.id;
      if(changed&&!reducedMotion.matches){picture.classList.remove('image-changing');detail.classList.remove('is-switching');requestAnimationFrame(()=>{picture.classList.add('image-changing');detail.classList.add('is-switching');});}
      if(updateUrl)history.replaceState(null,'','#'+id);
      if(focusPanel&&window.innerWidth<768)detail.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
    }
    $$('[data-service]').forEach(b=>b.addEventListener('click',()=>selectService(b.dataset.service,{updateUrl:true,focusPanel:true})));
    $$('[data-service-shortcut]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.serviceShortcut;if(id==='all'){selectService('auto-repair',{updateUrl:true});$$('[data-service-shortcut]').forEach(x=>{const a=x.dataset.serviceShortcut==='all';x.classList.toggle('active',a);x.setAttribute('aria-pressed',String(a));});}else selectService(id,{updateUrl:true,focusPanel:true});}));
    const fromHash=()=>{const id=decodeURIComponent(location.hash.slice(1));if(services.some(s=>s.id===id))selectService(id);};
    window.addEventListener('hashchange',fromHash);fromHash();
    const hashService=services.some(s=>s.id===location.hash.slice(1));
    if(hashService)requestAnimationFrame(()=>detail.scrollIntoView({behavior:'auto',block:'start'}));
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
  const form=$('#enquiry-form');
  if(form){
    $('.form-submit',form).disabled=false;
    const service=new URLSearchParams(location.search).get('service');if(service&&$$('#service option').some(o=>o.value===service))$('#service').value=service;
    const phone=$('#phone');
    function validatePhone(){const digits=phone.value.replace(/\D/g,'');phone.setCustomValidity(digits.length>=10&&digits.length<=15?'':'Enter a phone number with 10–15 digits.');}
    phone.addEventListener('input',validatePhone);
    let draft='';
    form.addEventListener('submit',e=>{
      e.preventDefault();validatePhone();if(!form.reportValidity())return;
      const data=new FormData(form);
      draft=['SERVICE ENQUIRY — SUNIL AUTOMOBILE','Not sent — prepared locally in your browser','',`Name: ${data.get('name').trim()}`,`Phone: ${data.get('phone').trim()}`,`Vehicle: ${data.get('vehicle').trim()}`,`Service: ${$('#service').selectedOptions[0].textContent}`,`Message: ${data.get('message').trim()}`,'','Workshop: Gandhi Path Rd, Lalarpura, Jaipur, Rajasthan 302021'].join('\r\n');
      $('#form-result').hidden=false;$('#form-result').scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'nearest'});
    });
    form.addEventListener('input',()=>{$('#form-result').hidden=true;draft='';});
    $('#download-enquiry').addEventListener('click',()=>{if(!draft)return;const url=URL.createObjectURL(new Blob([draft],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='sunil-automobile-service-enquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  }
})();
