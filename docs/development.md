# Working on the site

## Running it locally

Any static server will do. From the project root:

```bash
python -m http.server 8000
# then open http://127.0.0.1:8000
```

You can also open the `.html` files directly from disk — everything is
relative-pathed and there is no fetch — but a server is closer to production.

## Deploying

Copy the repository as-is to any static host (Netlify, Vercel, GitHub Pages, S3,
nginx). There is nothing to build.

Exclude `assets/img/originals/` from the upload — 2.3 GB of full-resolution
masters, never served.

```bash
# example: everything the browser needs, nothing it doesn't
rsync -av --exclude 'assets/img/originals' --exclude 'docs' \
      ./ user@host:/var/www/silk/
```

Keep `docs/` if you want the brand-system page reachable at `/docs/brand-system.html`;
the site footer links to it.

## Images

Photographs live in two places:

| Folder | What | Served? |
|--------|------|---------|
| `assets/img/originals/` | Camera masters, ~18 MB each | No |
| `assets/img/photos/` | Web derivatives at 800 px and 1600 px | Yes |

Every photograph in the library is **2:3 portrait**. Sections that need a
landscape band crop with `object-fit: cover` and an explicit height — do not
assume a landscape source.

### Adding a photograph

1. Put the master in `assets/img/originals/` as `IMG<number>.jpg`.
2. Generate the two derivatives:

```bash
python - <<'PY'
from PIL import Image, ImageOps
ids = ['6421']            # <- the numbers you added
for i in ids:
    im = ImageOps.exif_transpose(Image.open(f'assets/img/originals/IMG{i}.jpg')).convert('RGB')
    for w in (1600, 800):
        c = im.copy(); c.thumbnail((w, w * 2), Image.LANCZOS)
        c.save(f'assets/img/photos/img{i}-{w}.jpg', 'JPEG',
               quality=76, optimize=True, progressive=True)
PY
```

3. Reference it with both widths:

```html
<img src="assets/img/photos/img6421-800.jpg"
     srcset="assets/img/photos/img6421-800.jpg 800w,
             assets/img/photos/img6421-1600.jpg 1600w"
     sizes="(max-width: 900px) 100vw, 34vw"
     alt="…" loading="lazy" width="800" height="1200">
```

Always set `width`/`height` (800×1200 or 1600×2400) so the page does not shift
while images load, and `loading="lazy"` on everything below the fold.

### Adding a gallery frame

Add an entry to `FRAMES` in [`assets/js/gallery.js`](../assets/js/gallery.js).
That one manifest drives the grid and the lightbox, so they cannot drift apart.
`span` is how many of the twelve columns the tile occupies; keep each row of the
desktop grid summing to twelve.

### Adding a journal post

Add an entry to `POSTS` in [`assets/js/blog.js`](../assets/js/blog.js), then copy
`article.html` for the article itself and edit the prose. Point the entry's
`href` at the new file.

## Wiring the reservation form

The form currently validates in the browser and reports back in place — nothing
is sent anywhere. To make it real, give the `<form data-reservation>` element an
`action` (and `method="post"`). `booking.js` still validates, then stands aside
when it finds one, so the browser posts normally:

```html
<form class="booking" id="booking" data-reservation novalidate
      action="https://formspree.io/f/xxxxxxx" method="post">
```

The available times live in the markup (the `data-service` ledgers), so
changing opening hours means editing them on both pages.

The form appears on **two** pages — `index.html` and `contacts.html`. Wire both.

## Adding a page

1. Copy the closest existing page.
2. Update `<title>`, `<meta name="description">`, and the `og:` tags.
3. Swap the page stylesheet link, and create `assets/css/<page>.css`.
4. Add the link to the nav **in all nine existing pages** plus the footer, and
   set `aria-current="page"` on the new page's own nav entry.

Step 4 is the tax for having no build step. See
[architecture.md](architecture.md#shared-chrome).

## Checking your work

There is no test suite. Before shipping a change, walk this list:

- [ ] No horizontal scrollbar at 390 px, 768 px and 1440 px
- [ ] Console is clean and no request 404s
- [ ] EN and RU both render, and the choice survives a page navigation
- [ ] Keyboard: skip link, nav toggle, filters, lightbox arrows, Escape
- [ ] With JavaScript disabled the page still reads (English, no reveal)
- [ ] `prefers-reduced-motion` kills the animation, not the content

A quick automated sweep for the first two, if you have Playwright available:

```js
// node check.mjs — expects a server on :8000
import { chromium } from 'playwright';
const pages = ['index','about','menu','chef','gallery','blog','article','reviews','contacts'];
const browser = await chromium.launch();
for (const w of [390, 768, 1440]) for (const name of pages) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(`http://127.0.0.1:8000/${name}.html`, { waitUntil: 'networkidle' });
  const over = await p.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(w, name, over > 0 ? `OVERFLOW ${over}px` : 'ok', errs.join(' | '));
  await p.close();
}
await browser.close();
```
