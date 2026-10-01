import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
mkdirSync(out, { recursive: true });
const manifest = JSON.parse(readFileSync(path.join(root, '.openai/hosting.json'), 'utf8'));
const origin = process.env.SITE_URL || '';
const business = 'Sunil Automobile and Electrician';
const address = 'A48 Ayodhya Nagar Ghandi Path Test, Vaishali Nagar, Jaipur, Rajasthan, 302021';
const phone = '094146 06756';
const phoneHref = 'tel:+919414606756';
const email = 'sunilautomobile896@gmail.com';
const mapQuery = encodeURIComponent(address);
const maps = 'https://maps.google.com/?q=A48%20Ayodhya%20Nagar%20Ghandi%20Path%20Test%2C%20Vaishali%20Nagar%2C%20%0AJaipur%2C%20%0ARajasthan%2C%20%0A302021';
const directions = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
const icons = {
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  wrench: '<path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18a2.1 2.1 0 0 0 3 3l5.3-5.3a5 5 0 0 0 6.4-6.4l-3.3 3.3-3-3Z"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  engine: '<path d="M3 10h3l3-3h7l3 3h2v8h-4l-2 3H7v-3H3Z M9 3h7 M12 3v4 M1 11v6"/>',
  snow: '<path d="M12 2v20 M3.3 7l17.4 10 M3.3 17 20.7 7 M9 4l3 3 3-3 M9 20l3-3 3 3 M3 10l4-1-1-4 M21 14l-4 1 1 4 M6 19l1-4-4-1 M18 5l-1 4 4 1"/>',
  brake: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3 M3 12h3 M12 18v3 M18 12h3"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
  battery: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M7 7V4h3v3 M14 7V4h3v3 M6 14h4 M16 12v4 M14 14h4"/>',
  oil: '<path d="M12 2S4 11 4 15a8 8 0 1 0 16 0c0-4-8-13-8-13Z M8 15a4 4 0 0 0 4 4"/>',
  car: '<path d="m5 8 2-5h10l2 5 M3 9h18v9H3Z M5 18v3 M19 18v3 M6 12h2 M16 12h2"/>',
  filter: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 6v12 M12 6v12 M16 6v12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  menu: '<path d="M4 6h16 M4 12h16 M4 18h16"/>',
  close: '<path d="m6 6 12 12 M18 6 6 18"/>',
  plus: '<path d="M12 4v16 M4 12h16"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.wrench}</svg>`;
const services = [
  ['auto-repair','Auto Repair','Complete automotive repair and maintenance to help keep your vehicle running reliably.','wrench','auto-repair','General repair work','Vehicle inspection','Routine maintenance'],
  ['filters','Air & Cabin Filter Replacement','Air and cabin filter replacement for your engine and interior ventilation.','filter','workshop-service','Air filter replacement','Cabin filter replacement','Ventilation care'],
  ['air-conditioning','Air Conditioning','Automotive AC service to help keep your journeys comfortable.','snow','workshop-service','AC system inspection','Cooling concerns','Climate system service'],
  ['diagnostics','Vehicle Engine Diagnostic','Engine diagnostics to investigate warning lights and running concerns.','engine','engine-detail','Engine warning lights','Running concerns','Diagnostic inspection'],
  ['battery','Battery','Battery service for starting and vehicle power concerns.','battery','vehicle-inspection','Starting concerns','Battery inspection','Vehicle power concerns'],
  ['brakes','Brakes','Brake inspection and maintenance for your vehicle.','brake','engine-detail','Brake inspection','Brake maintenance','Braking concerns'],
  ['electrical','Electrical','Automotive electrical service for vehicle systems and electrical faults.','bolt','vehicle-inspection','Electrical inspection','Fault investigation','Vehicle electrical systems'],
  ['oil-change','Oil Change','Vehicle oil changes as part of regular engine maintenance.','oil','auto-repair','Engine oil change','Routine engine care','Maintenance enquiry'],
  ['suspension','Steering & Suspension Repair','Repair for steering and suspension concerns, handling and ride comfort.','car','mechanic-engine','Steering concerns','Suspension inspection','Ride and handling'],
  ['transmission','Transmission','Service and repair enquiries for transmission-related concerns.','engine','mechanic-engine','Transmission concerns','Gear change issues','Service enquiries'],
];
const img = (name, alt, attrs = '') => `<img src="/assets/${name}.webp" alt="${alt}" width="1000" height="667" loading="lazy" decoding="async" ${attrs}>`;
const btn = (href, text, type = '', external = false) => `<a class="button ${type}" href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
const dirButton = (type = '') => btn(directions, `${icon('pin')}Get Directions`, type, true);
const eyebrow = text => `<p class="eyebrow">${text}</p>`;
const logo = `<span class="brand-mark">${icon('wrench')}</span><span class="brand-wordmark">SUNIL AUTOMOBILE<span>and Electrician</span></span>`;
const nav = [['/','Home'],['/services/','Services'],['/about/','About'],['/gallery/','Gallery'],['/contact/','Contact']];
const serviceLabel = s => s[0] === 'air-conditioning' ? 'AC Service' : s[0] === 'diagnostics' ? 'Engine Diagnostics' : s[0] === 'filters' ? 'Air & Cabin Filters' : s[0] === 'suspension' ? 'Steering & Suspension' : s[1];
function header(route) {
  const navLinks = nav.map(([href,label]) => {
    const link = `<a href="${href}"${route===href?' class="active" aria-current="page"':''}>${label}</a>`;
    if(label !== 'Services') return link;
    return `<div class="nav-services">${link}<button class="services-menu-toggle" type="button" aria-expanded="false" aria-controls="header-services" aria-label="Show all services">${icon('chevron')}</button><div id="header-services" class="services-dropdown" hidden><span class="dropdown-heading">VEHICLE CARE</span>${services.map(s=>`<a href="/services/#${s[0]}">${icon(s[3])}${serviceLabel(s)}</a>`).join('')}</div></div>`;
  }).join('');
  return `<header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="${business} home">${logo}</a><nav class="desktop-nav" aria-label="Main navigation">${navLinks}</nav><div class="header-actions"><a class="header-phone" href="${phoneHref}">${icon('phone')}<span>${phone}</span></a>${dirButton('button-small')}<button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav">${icon('menu')}</button></div></div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden>${nav.map(([href,label])=>`<a href="${href}"${route===href?' aria-current="page"':''}>${label}</a>${label==='Services'?`<details class="mobile-services"><summary>Explore all services</summary>${services.map(s=>`<a href="/services/#${s[0]}">${serviceLabel(s)}</a>`).join('')}</details>`:''}`).join('')}</nav><div class="scroll-progress" aria-hidden="true"></div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="container footer-grid"><div><a class="brand" href="/">${logo}</a><p>Automotive repair, electrical and AC services.<br>Vehicle care in Vaishali Nagar, Jaipur.</p><a href="${phoneHref}" class="footer-contact">${icon('phone')} ${phone}</a><a href="mailto:${email}" class="footer-contact">${icon('mail')} ${email}</a></div><div><h3>Explore</h3>${nav.map(([h,l])=>`<a href="${h}">${l}</a>`).join('')}</div><div><h3>Our Services</h3>${services.slice(0,5).map(s=>`<a href="/services/#${s[0]}">${serviceLabel(s)}</a>`).join('')}</div><div><h3>Vehicle Care</h3>${services.slice(5).map(s=>`<a href="/services/#${s[0]}">${serviceLabel(s)}</a>`).join('')}<a href="/contact/#office">Visit the workshop</a></div></div><div class="container footer-bottom"><p>© 2026 ${business}. All rights reserved.</p><span>Vaishali Nagar · Jaipur</span><a href="#top">Back to top ${icon('chevron')}</a></div></footer>`;
}
function pageHero(label,title,desc,image='auto-repair',extra='') {
  return `<section class="page-hero"><div class="page-hero-image">${img(image,'Automotive service detail')}</div><div class="container">${eyebrow(label)}<h1>${title}</h1><p>${desc}</p>${extra}</div><span class="hero-index" aria-hidden="true">SUNIL / AUTOMOTIVE CARE</span></section>`;
}
function trust() {
  return `<section class="trust-strip" aria-label="Workshop services and contact"><div class="container trust-grid">${[['wrench','Repair & Maintenance','Care for your vehicle'],['bolt','Electrical & Diagnostics','Find the service you need'],['pin','Vaishali Nagar','Jaipur, Rajasthan'],['phone',phone,'Talk to the workshop']].map(([i,n,l])=>`<div class="trust-item">${icon(i)}<div>${i==='phone'?`<a href="${phoneHref}"><strong>${n}</strong></a>`:`<strong>${n}</strong>`}<span>${l}</span></div></div>`).join('')}</div></section>`;
}
function featured() {
  return `<section class="featured-section container" aria-label="Featured services"><div class="featured-grid">${[
    ['diagnostics','Engine Diagnostics','Understand what your engine is telling you.','engine-detail','01 / PRECISION'],
    ['air-conditioning','Air Conditioning','Comfort for every kilometre.','workshop-service','02 / COMFORT'],
    ['suspension','Brakes & Suspension','Care for the way your vehicle moves.','vehicle-inspection','03 / CONTROL'],
  ].map(([id,title,text,image,label])=>`<a class="feature-panel reveal" href="/services/#${id}">${img(image,`${title} automotive detail`)}<div class="feature-content"><span class="eyebrow">${label}</span><h3>${title}</h3><p>${text}</p><span class="text-link">Explore service ${icon('plus')}</span></div></a>`).join('')}</div></section>`;
}
function processSection() {
  return `<section class="section process-section"><div class="container"><div class="section-heading reveal"><div>${eyebrow('THE WAY WE WORK')}<h2>A little care.<br>A better journey.</h2></div><p>From your first visit to getting back on the road.<br>Four straightforward steps.</p></div><ol class="process-grid reveal">${[['pin','Visit','Bring your vehicle to our workshop.'],['engine','Inspect','Discuss the concern and inspect your vehicle.'],['wrench','Service','Get the required service for your vehicle.'],['car','Back on the Road','Continue your journey with your vehicle cared for.']].map(([i,t,d],n)=>`<li><span class="step-icon">${icon(i)}</span><span class="step-number">0${n+1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol></div></section>`;
}
function guidance() {
  const questions = [
    ['What services can I ask about?', 'Auto repair, engine diagnostics, air conditioning, electrical work, battery, brakes, oil changes, air and cabin filters, steering and suspension, and transmission.'],
    ['How do I discuss a vehicle concern?', `Call ${phone} or email ${email}. Tell us your vehicle model, the symptoms and any warning lights so we can understand your concern.`],
    ['Where is the workshop?', address + '. Open the Contact page for the map and directions.'],
    ['What should I bring when I visit?', 'Bring your vehicle details and note any unusual sounds, warning lights or recent issues. Call before visiting to discuss availability.'],
  ];
  return `<section class="section guidance-section"><div class="container guidance-grid"><div class="reveal">${eyebrow('BEFORE YOU VISIT')}<h2>A clear start.<br>A better journey.</h2><p>Useful answers before you bring your vehicle in.</p><a class="text-link" href="${phoneHref}">${icon('phone')} Talk to the workshop</a></div><div class="faq-list reveal">${questions.map(([q,a])=>`<details><summary>${q}<span>${icon('plus')}</span></summary><p>${a}</p></details>`).join('')}</div></div></section>`;
}
function finalCta() {
  return `<section class="final-cta"><div class="final-image">${img('hero-workshop','Automotive workshop interior')}</div><div class="container final-inner reveal"><div>${eyebrow('FOR EVERY JOURNEY AHEAD')}<h2>Keep your<br>vehicle moving.</h2><p>${business}<br>Vaishali Nagar, Jaipur.</p></div><div class="button-group">${btn(phoneHref,`${icon('phone')} Call the Workshop`)}${btn('/contact/','Contact & Directions','button-outline')}</div></div></section>`;
}
const galleryItems = [
  ['hero-workshop','Workshop','Workshop interior and engine service','workshop'],
  ['auto-repair','Hands-on care','Hands working on a vehicle engine','service'],
  ['engine-detail','Under the hood','Close-up automotive engine components','details'],
  ['workshop-service','Vehicle service','Mechanic inspecting a vehicle under the hood','service'],
  ['mechanic-engine','Engine maintenance','Engine being serviced in a workshop','workshop'],
  ['vehicle-inspection','The details matter','Vehicle engine inspection and maintenance','details'],
];
function galleryGrid(limit=6) {
  return `<div class="gallery-grid">${galleryItems.slice(0,limit).map(([image,title,alt,cat],n)=>`<button class="gallery-item reveal" type="button" data-category="${cat}" data-gallery-index="${n}" data-image="/assets/${image}.webp" data-caption="${title}" aria-label="View ${alt}">${img(image,alt)}<span class="gallery-caption">${title} ${icon('plus')}</span></button>`).join('')}</div>`;
}
function lightbox() {
  return `<dialog id="lightbox" class="lightbox" aria-labelledby="lightbox-caption"><button class="lightbox-close" type="button" aria-label="Close image">${icon('close')}</button><button class="lightbox-prev" type="button" aria-label="Previous image">${icon('chevron')}</button><figure><img id="lightbox-image" alt="" width="1000" height="667"><figcaption id="lightbox-caption"></figcaption></figure><button class="lightbox-next" type="button" aria-label="Next image">${icon('chevron')}</button></dialog>`;
}
function home() {
  return `<section class="hero"><div class="hero-visual"><img src="/assets/auto-repair.webp" alt="A mechanic carefully working on a vehicle engine" width="1000" height="1500" fetchpriority="high" decoding="async"></div><div class="hero-shade"></div><div class="container hero-content">${eyebrow('AUTO REPAIR <span>·</span> ELECTRICAL <span>·</span> AC')}<h1><span>Complete Care</span><span>for Your <em>Vehicle.</em></span></h1><p>Automotive repair, diagnostics, AC, electrical<br class="desktop-break"> and maintenance services in Vaishali Nagar, Jaipur.</p><div class="button-group">${btn(phoneHref,`${icon('phone')} Call the Workshop`)}${btn('/services/','Explore Services','button-outline')}</div><a class="hero-location" href="/contact/#office">${icon('pin')} Vaishali Nagar, Jaipur</a></div><div class="hero-bottom"><span>AUTOMOTIVE CARE. PERSONAL ATTENTION.</span><a href="#services">SCROLL TO EXPLORE <span class="scroll-line"></span></a></div></section>${trust()}
  <section id="services" class="section home-service-overview"><div class="container"><div class="section-heading reveal"><div>${eyebrow('CARE FOR EVERY SYSTEM')}<h2>Automotive services.<br><em>Done right.</em></h2></div><div class="overview-intro"><p>From everyday maintenance to diagnostics and repair. Explore care for the systems that keep you moving.</p><a class="text-link" href="/services/">Explore our services ${icon('plus')}</a></div></div><div class="home-service-grid">${services.map((s,n)=>`<a class="service-overview-item reveal" href="/services/#${s[0]}"><div class="overview-photo">${img(s[4],`${s[1]} automotive service detail`)}</div><div class="overview-copy"><h3>${s[1]==='Vehicle Engine Diagnostic'?'Engine Diagnostics':s[1]==='Air & Cabin Filter Replacement'?'Air & Cabin Filters':s[1]==='Steering & Suspension Repair'?'Steering & Suspension':s[1]}</h3><p>${s[2]}</p></div></a>`).join('')}</div></div></section>${featured()}
  <section class="section about-preview"><div class="container split-section"><div class="about-image reveal">${img('workshop-service','Hands-on automotive inspection')}<span class="image-label">PRECISION IN EVERY DETAIL</span></div><div class="reveal">${eyebrow('YOUR NEIGHBOURHOOD WORKSHOP')}<h2>More than a repair.<br>Care for your journey.</h2><p>At ${business}, vehicle care brings together repair, engine diagnostics, AC and automotive electrical services.</p><p>Tell us what your vehicle needs, or visit the workshop at A48 Ayodhya Nagar in Vaishali Nagar, Jaipur.</p>${btn('/about/','Get to Know Us','button-dark')}</div></div></section>${processSection()}
  <section class="section gallery-section"><div class="container"><div class="section-heading reveal"><div>${eyebrow('A CLOSER LOOK')}<h2>The work.<br>The care. The details.</h2></div><a class="text-link" href="/gallery/">Explore the gallery ${icon('plus')}</a></div>${galleryGrid(3)}<p class="image-disclaimer">Illustrative automotive photography.</p></div></section>${guidance()}${finalCta()}${lightbox()}`;
}
function servicesPage() {
  return `${pageHero('OUR SERVICES','The right care.<br>For every part of your vehicle.','Repair, diagnostics, electrical and maintenance. Choose a service below to explore what your vehicle needs.','engine-detail')}
  <section class="section services-workspace"><div class="container"><nav class="service-tabs" aria-label="Browse automotive services">${services.map((s,n)=>`<a href="#${s[0]}" data-service-tab="${s[0]}" aria-controls="${s[0]}"${n===0?' aria-current="true"':''}>${icon(s[3])}${serviceLabel(s)}</a>`).join('')}</nav><div class="service-panels">${services.map((s,n)=>`<article id="${s[0]}" class="service-panel" data-service-panel="${s[0]}" aria-labelledby="title-${s[0]}"><div class="service-panel-image">${img(s[4],`${s[1]} automotive detail`)}<span class="service-photo-label">${icon(s[3])}<span>${String(n+1).padStart(2,'0')} / VEHICLE CARE</span></span>${s[0]==='diagnostics'?'<span class="scan-line" aria-hidden="true"></span>':''}</div><div class="service-panel-copy">${eyebrow('SUNIL AUTOMOBILE AND ELECTRICIAN')}<h2 id="title-${s[0]}">${s[1]}</h2><p>${s[2]}</p><ul>${s.slice(5).map(p=>`<li>${icon('check')}${p}</li>`).join('')}</ul><div class="button-group">${btn(phoneHref,`${icon('phone')} Discuss This Service`)}${btn('/contact/','Contact the Workshop','button-light')}</div><p class="small muted">Tell us your vehicle model and the concern you’d like checked.</p></div></article>`).join('')}</div></div></section>
  <section class="service-assist"><div class="container service-assist-inner"><div>${icon('phone')}<span><strong>Not sure which service you need?</strong><p>Tell us what your vehicle is doing. Start with a conversation.</p></span></div><a href="${phoneHref}">${phone}</a></div></section>${guidance()}${finalCta()}`;
}
function aboutPage() {
  return `${pageHero('ABOUT US','Vehicle care.<br>Close to home.','Automotive repair, diagnostics, AC and electrical services in Vaishali Nagar, Jaipur.','workshop-service')}${trust()}<section class="section"><div class="container split-section"><div class="reveal">${eyebrow('SUNIL AUTOMOBILE AND ELECTRICIAN')}<h2>One workshop.<br>Connected care.</h2><p>${business} is an auto repair workshop at A48 Ayodhya Nagar Ghandi Path Test, Vaishali Nagar, Jaipur.</p><p>Our services cover auto repair, engine diagnostics, air conditioning, electrical, battery, brakes, oil changes, filter replacement, steering and suspension, and transmission.</p><p>Call to discuss a concern or visit the workshop for your vehicle’s maintenance needs.</p>${btn('/contact/','Talk to the Workshop')}</div><div class="about-image reveal">${img('auto-repair','Mechanic working carefully on automotive components')}<span class="image-label">CARE FOR THE ROAD AHEAD</span></div></div></section><section class="section care-section"><div class="container"><div class="section-heading reveal"><div>${eyebrow('BUILT AROUND YOUR VEHICLE')}<h2>Care that connects<br>every part.</h2></div><p>From the engine to the road,<br>explore the services your vehicle needs.</p></div><div class="care-grid">${[['wrench','Repair & Maintenance','General vehicle repair, oil changes and routine care.'],['bolt','Engine & Electrical','Diagnostics, battery and automotive electrical services.'],['snow','Cabin Comfort','Air conditioning and air & cabin filter replacement for your vehicle.'],['brake','Ride & Control','Brakes, steering, suspension and transmission services.']].map(([i,t,d])=>`<div class="care-item reveal">${icon(i)}<h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>${processSection()}${finalCta()}`;
}
function galleryPage() {
  return `${pageHero('THE GALLERY','The details behind<br>every journey.','A closer look at automotive care, workshop life and the systems that keep vehicles moving.','engine-detail')}<section class="section"><div class="container"><div class="gallery-filters" aria-label="Filter gallery">${[['all','All'],['workshop','Workshop'],['service','Service'],['details','Details']].map(([id,t],n)=>`<button type="button" data-gallery-filter="${id}" class="${n===0?'active':''}" aria-pressed="${n===0}">${t}</button>`).join('')}</div>${galleryGrid()}<p class="image-disclaimer">Illustrative automotive photography, sourced from Pexels. These images do not depict the Sunil Automobile workshop.</p></div></section>${finalCta()}${lightbox()}`;
}
function contactPage() {
  return `${pageHero('LET’S TALK VEHICLE CARE','A conversation.<br>Then a better journey.','Give us a ring, send an email or visit the workshop. Find all the details right here.','auto-repair')}
  <section class="section contact-direct"><div class="container"><div class="contact-introduction reveal">${eyebrow('CONTACT SUNIL AUTOMOBILE AND ELECTRICIAN')}<h2>We’re easy to reach.</h2><p>Tell us about your vehicle and the service you need.</p></div><div class="contact-details-grid"><article class="contact-info-card reveal"><span class="contact-card-icon">${icon('phone')}</span><p class="contact-card-label">Give us a ring</p><a class="contact-main-value" href="${phoneHref}">${phone}</a><p>Discuss your vehicle’s concern<br>directly with the workshop.</p><a class="text-link" href="${phoneHref}">Call the workshop ${icon('phone')}</a></article><article class="contact-info-card reveal"><span class="contact-card-icon">${icon('pin')}</span><p class="contact-card-label">Office location</p><a href="${maps}" target="_blank" rel="noopener noreferrer"><address>${address}</address></a><a class="text-link" href="#office">See the map ${icon('pin')}</a></article><article class="contact-info-card reveal"><span class="contact-card-icon">${icon('mail')}</span><p class="contact-card-label">Send us an email</p><a class="contact-email-value" href="mailto:${email}">${email}</a><p>Share your vehicle details<br>and the service you’re looking for.</p><a class="text-link" href="mailto:${email}">Write an email ${icon('mail')}</a></article></div></div></section>
  <section id="office" class="section contact-office"><div class="container office-layout"><div class="office-copy reveal">${eyebrow('COME SAY HELLO')}<h2>Find us in<br>Vaishali Nagar.</h2><address>${address}</address><p>Call before you visit to discuss your vehicle and workshop availability.</p><div class="button-group">${dirButton()}${btn(phoneHref,`${icon('phone')} Call Us`,'button-light')}</div></div><div class="map-wrap reveal"><iframe title="Map of the Sunil Automobile and Electrician office in Vaishali Nagar, Jaipur" src="https://maps.google.com/maps?q=${mapQuery}&amp;t=&amp;z=16&amp;ie=UTF8&amp;iwloc=&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><a class="map-external" href="${maps}" target="_blank" rel="noopener noreferrer">${icon('pin')} Open in Google Maps</a></div></div></section>`;
}
const pages = [
  ['/', 'Auto Repair & Electrical Services in Vaishali Nagar, Jaipur', 'Sunil Automobile and Electrician provides auto repair, diagnostics, AC, electrical and maintenance in Vaishali Nagar, Jaipur. Call 094146 06756.', home],
  ['/services/', 'Automotive Repair & Electrical Services in Jaipur', 'Explore auto repair, diagnostics, air conditioning, electrical, brakes, battery, oil changes, filters, suspension and transmission at Sunil Automobile and Electrician, Jaipur.', servicesPage],
  ['/about/', 'About Sunil Automobile and Electrician', 'Learn about Sunil Automobile and Electrician, an auto repair workshop at A48 Ayodhya Nagar Ghandi Path Test, Vaishali Nagar, Jaipur.', aboutPage],
  ['/gallery/', 'Automotive Service Gallery', 'Explore automotive repair and maintenance photography illustrating vehicle care, engine systems and workshop service.', galleryPage],
  ['/contact/', 'Contact, Phone & Directions · Vaishali Nagar, Jaipur', 'Call 094146 06756 or email sunilautomobile896@gmail.com. Visit Sunil Automobile and Electrician at A48 Ayodhya Nagar, Vaishali Nagar, Jaipur 302021.', contactPage],
];
const escape = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const clientPages = {};
for (const [route,title,desc,content] of pages) {
  const canonical = origin ? origin.replace(/\/$/,'')+route : '';
  const schema = {'@context':'https://schema.org','@type':'AutoRepair',name:business,description:'Automotive repair, electrical, AC and maintenance services in Vaishali Nagar, Jaipur.',telephone:'+919414606756',email,address:{'@type':'PostalAddress',streetAddress:'A48 Ayodhya Nagar Ghandi Path Test, Vaishali Nagar',addressLocality:'Jaipur',addressRegion:'Rajasthan',postalCode:'302021',addressCountry:'IN'},hasMap:maps,areaServed:{'@type':'City',name:'Jaipur'},...(origin?{url:origin}:{}),hasOfferCatalog:{'@type':'OfferCatalog',name:'Automotive services',itemListElement:services.map(s=>({'@type':'Offer',itemOffered:{'@type':'Service',name:s[1]}}))}};
  const pageContent = content();
  clientPages[route] = {html:pageContent,title:title+' | '+business,ogTitle:title,description:desc,canonical,schema};
  const html = `<!doctype html><html lang="en-IN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} | Sunil Automobile and Electrician</title><meta name="description" content="${escape(desc)}"><meta name="theme-color" content="#ffffff"><meta name="robots" content="index,follow"><meta property="og:type" content="website"><meta property="og:locale" content="en_IN"><meta property="og:site_name" content="Sunil Automobile and Electrician"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(desc)}">${canonical?`<link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}">`:''}<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/assets/style.css"><link rel="preload" href="/assets/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>${route==='/'?'<link rel="preload" href="/assets/auto-repair.webp" as="image">':''}<script type="application/ld+json">${JSON.stringify(schema)}</script><script src="/assets/app.js" defer></script></head><body id="top" data-page="${route}"><a href="#main" class="skip-link">Skip to content</a>${header(route)}<main id="main">${pageContent}</main>${footer()}</body></html>`;
  const dir = path.join(out, route === '/' ? '' : route.slice(1));
  mkdirSync(dir, {recursive:true});
  writeFileSync(path.join(dir,'index.html'), html);
}
writeFileSync(path.join(out,'assets','pages.json'),JSON.stringify({version:1,pages:clientPages}));
for (const file of ['style.css','app.js']) copyFileSync(path.join(root,'src',file),path.join(out,'assets',file));
writeFileSync(path.join(out,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#ed171f"/><path d="M22 7a7 7 0 0 0-9 9l-6 6 3 3 6-6a7 7 0 0 0 9-9l-4 4-3-3Z" fill="white"/></svg>');
writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n${origin?`Sitemap: ${origin.replace(/\/$/,'')}/sitemap.xml\n`:''}`);
if(origin) writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([route])=>`<url><loc>${escape(origin.replace(/\/$/,'')+route)}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${pages.length} static pages. ${origin?'Canonical URLs and sitemap included.':'Set SITE_URL to add production canonical URLs and sitemap.'} Site identity: ${manifest.project_id || 'local'}`);
