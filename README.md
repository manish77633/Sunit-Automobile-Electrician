# Sunil Automobile

A six-page, white-theme automotive website based on the supplied visual reference. Built as static HTML with self-hosted Manrope, optimized WebP photographs, CSS animations and small progressive-enhancement JavaScript. No production JavaScript dependencies.

## Run locally

```powershell
$env:SITE_URL = 'https://sunil-automobile-jaipur.a3logics-2296.chatgpt.site'
npm run build
npm run dev
```

Open http://127.0.0.1:4173. `build.mjs` generates crawlable pages in `dist/`; edit page content there in the source generator, and edit appearance/behavior in `src/style.css` and `src/app.js`.

## Pages and behavior

- Home, Services, About, Gallery, Location and Contact.
- Ten services with keyboard-accessible selection and shareable fragment links.
- Gallery category filters and native dialog lightbox with Escape, arrow navigation and restored focus.
- Google Maps address search, directions and embedded map.
- Enquiry validation, service prefill and a text-file download. **No delivery backend is connected; enquiries are never marked as sent.** No personal data is persisted.
- Hero sequence, subtle desktop scroll parallax, viewport reveals, diagnostic scan, airflow/electrical accents and timeline entrance. Reduced-motion support and readable content without JavaScript.

## Accuracy and assets

Business name, address, ten services, 3.7/5 rating, three reviews and truncated review excerpt come from the user-supplied brief. They have not been independently verified. The supplied opening status is labelled as listing information, not a live status. No telephone, email, certifications, prices, pickup/drop or guarantees were invented.

Photographs are illustrative stock images, **not photographs of this business**. Replace them with authorized original workshop photographs when available. Image sources:

- https://www.pexels.com/photo/a-mechanic-fixing-a-car-engine-8985456/
- https://www.pexels.com/photo/person-in-black-long-sleeves-repairing-the-car-engine-4315574/
- https://www.pexels.com/photo/close-up-shot-of-a-car-engine-4116195/
- https://www.pexels.com/photo/a-man-working-on-a-car-8478254/
- https://www.pexels.com/photo/a-mechanic-working-on-a-car-engine-8986041/
- https://www.pexels.com/photo/person-looking-at-the-engine-of-a-car-8478213/

Pexels license: https://www.pexels.com/license/ . Manrope is distributed under the SIL Open Font License; font license and attribution are included with the assets.

## SEO

Static page content, one H1 per page, unique titles/descriptions, canonical URLs, Open Graph text, robots.txt, sitemap.xml and factual AutoRepair JSON-LD. No unverified review structured data, coordinates or opening schedule. Set `SITE_URL` to the actual final origin before rebuilding for another host.

The Sites publication begins private. **Search indexing requires a public website**; metadata alone does not guarantee ranking or indexing.

## Validation

`npm run check` validates JavaScript syntax. `qa.mjs` uses Playwright with installed Google Chrome to verify six pages at 360, 390, 430, 768, 1024, 1280, 1440 and 1920 pixels. It checks overflow, metadata, page headings, runtime errors and key interactions. Google Maps is replaced by a clearly labelled test placeholder during automated local screenshots; the third-party map itself is not covered by those screenshots. Results are stored in ignored `.qa/`.

The advanced 3D vehicle disassembly/video phase is not implemented; it requires suitable authorized layered/3D/video assets. The complete website and lightweight motion remain usable without those assets.
