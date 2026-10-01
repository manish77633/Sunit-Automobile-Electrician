# Sunil Automobile and Electrician

A lightweight, white automotive single-page application with five prerendered routes: Home, Services, About, Gallery and Contact. The name and contact information follow the latest user instructions.

## Local development

```powershell
$env:SITE_URL = 'https://sunil-automobile-jaipur.a3logics-2296.chatgpt.site'
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Edit content in `build.mjs`, appearance in `src/style.css`, and interactions in `src/app.js`. Generated pages and local assets live in `dist/`.

## Navigation architecture

The browser keeps one persistent application shell and switches main content through the History API, without full page reloads. A small route bundle is prefetched during idle time and on navigation intent, then cached in memory. Revisited routes use cached templates. Header, footer, fonts and shared assets persist. Browser Back/Forward, service fragments, focus and scroll restoration are supported. Page observers/listeners are cleaned up on navigation.

Each route also has complete prerendered HTML, unique metadata and a direct-load URL for SEO and no-JavaScript/fetch-failure fallbacks. No production framework or navigation dependency was added. The static host needs no catch-all routing rule.

## Current content

- Name: Sunil Automobile and Electrician. The business name and logo omit the service suffix; air conditioning remains an offered service.
- Homepage service cards use automotive photographs in place of service icons.
- Telephone: 094146 06756; click-to-call uses +91 94146 06756.
- Email: sunilautomobile896@gmail.com.
- Supplied address, preserved as written: A48 Ayodhya Nagar Ghandi Path Test, Vaishali Nagar, Jaipur, Rajasthan, 302021.
- Ten services: Auto Repair; Air & Cabin Filter Replacement; Air Conditioning; Vehicle Engine Diagnostic; Battery; Brakes; Electrical; Oil Change; Steering & Suspension Repair; Transmission.
- Contact combines direct phone/email links, office address, map and directions. No enquiry form.
- Services use top navigation and one selected detail, with no duplicate left list. The services are also accessible from the header dropdown and mobile navigation.
- Before You Visit FAQs, gallery filtering/lightbox, accessible navigation, scroll reveals and reduced-motion support.

The old standalone location route was removed. Supplied contact details have not been independently verified; no opening hours, certifications, prices or guarantees were invented.

## SEO and verification

Unique titles/descriptions, static content, canonical URLs, Open Graph text, factual AutoRepair structured data with telephone/email and the current address, and a five-page sitemap. Set SITE_URL to the final origin before rebuilding for another host. Search indexing requires a public website.

`npm run check` checks JavaScript syntax. `qa.mjs` uses Playwright and installed Chrome to verify five pages at eight widths from 360 to 1920 pixels, service selection, contact links, removed routes and no-JavaScript fallbacks. `qa-spa.mjs` verifies persistent shell/document identity, route caching and metadata, repeated gallery mounts, service deep links, mobile navigation, Back/Forward scroll, rapid-click races, reduced motion and failed-prefetch fallback. Google Maps is replaced with a labelled placeholder during tests; third-party map rendering is not covered by those screenshots. Results are in ignored `.qa/`. The QA scripts require Playwright and a running local server.

## Photography and font

Photographs are illustrative stock images, not photographs of this business. Replace them with authorized original workshop photography when available.

- https://www.pexels.com/photo/a-mechanic-fixing-a-car-engine-8985456/
- https://www.pexels.com/photo/person-in-black-long-sleeves-repairing-the-car-engine-4315574/
- https://www.pexels.com/photo/close-up-shot-of-a-car-engine-4116195/
- https://www.pexels.com/photo/a-man-working-on-a-car-8478254/
- https://www.pexels.com/photo/a-mechanic-working-on-a-car-engine-8986041/
- https://www.pexels.com/photo/person-looking-at-the-engine-of-a-car-8478213/

Pexels license: https://www.pexels.com/license/ . Manrope uses the SIL Open Font License, included in `dist/assets/Manrope-OFL.txt`.
