# Sunil Automobile and Electrician

A white automotive website with five static pages: Home, Services, About, Gallery and Contact. The name and contact information follow the latest user instructions.

## Local development

```powershell
$env:SITE_URL = 'https://sunil-automobile-jaipur.a3logics-2296.chatgpt.site'
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Edit content in `build.mjs`, appearance in `src/style.css`, and interactions in `src/app.js`. Generated pages and local assets live in `dist/`.

## Current content

- Name: Sunil Automobile and Electrician.
- Telephone: 094146 06756; click-to-call uses +91 94146 06756.
- Email: sunilautomobile896@gmail.com.
- Supplied address, preserved as written: A48 Ayodhya Nagar Ghandi Path Test, Vaishali Nagar, Jaipur, Rajasthan, 302021.
- Nine services: Auto Repair; Air & Cabin Filter Replacement; Vehicle Engine Diagnostic; Battery; Brakes; Electrical; Oil Change; Steering & Suspension Repair; Transmission.
- Contact combines direct phone/email links, office address, map and directions. No enquiry form.
- Services use top navigation and one selected detail, with no duplicate left list. The services are also accessible from the header dropdown and mobile navigation.
- Before You Visit FAQs, gallery filtering/lightbox, accessible navigation, scroll reveals and reduced-motion support.

The old standalone location route was removed. Supplied contact details have not been independently verified; no opening hours, certifications, prices or guarantees were invented.

## SEO and verification

Unique titles/descriptions, static content, canonical URLs, Open Graph text, factual AutoRepair structured data with telephone/email and the current address, and a five-page sitemap. Set SITE_URL to the final origin before rebuilding for another host. Search indexing requires a public website.

`npm run check` checks JavaScript syntax. `qa.mjs` uses Playwright and installed Chrome to verify five pages at eight widths from 360 to 1920 pixels, service selection, contact links, removed routes and no-JavaScript fallbacks. Google Maps is replaced with a labelled placeholder during screenshots; third-party map rendering is not covered by those screenshots. Results are in ignored `.qa/`.

## Photography and font

Photographs are illustrative stock images, not photographs of this business. Replace them with authorized original workshop photography when available.

- https://www.pexels.com/photo/a-mechanic-fixing-a-car-engine-8985456/
- https://www.pexels.com/photo/person-in-black-long-sleeves-repairing-the-car-engine-4315574/
- https://www.pexels.com/photo/close-up-shot-of-a-car-engine-4116195/
- https://www.pexels.com/photo/a-man-working-on-a-car-8478254/
- https://www.pexels.com/photo/a-mechanic-working-on-a-car-engine-8986041/
- https://www.pexels.com/photo/person-looking-at-the-engine-of-a-car-8478213/

Pexels license: https://www.pexels.com/license/ . Manrope uses the SIL Open Font License, included in `dist/assets/Manrope-OFL.txt`.
