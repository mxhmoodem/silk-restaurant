# SILK — Canggu, Bali

A static website for a Silk Road restaurant in Bali. Nine pages, two languages,
no build step, nothing to install. The one library (StPageFlip, for the
homepage menu book) is vendored in `assets/js/vendor/`.

```bash
python -m http.server 8000
# http://127.0.0.1:8000
```

## What's here

| Page | File |
|------|------|
| Home | `index.html` |
| About — the five-chapter story | `about.html` |
| Menu — eight courses | `menu.html` |
| The chef | `chef.html` |
| Gallery — filters and lightbox | `gallery.html` |
| Journal | `blog.html` |
| Article template | `article.html` |
| Reviews | `reviews.html` |
| Contacts — hours, reservations, legal | `contacts.html` |
| Brand system | `docs/brand-system.html` |

```
assets/css/     tokens → base → components → layout → one sheet per page
assets/js/      site.js everywhere, plus one script per interactive page
assets/img/     photos/ is served; originals/ is 2.3 GB and is not
docs/           brand system, architecture, development, content status
```

## Before you change anything

- **Colours and sizes live in `assets/css/tokens.css`.** A page stylesheet may
  define layout and nothing else.
- **The nav and footer are duplicated in all nine pages.** No build step means no
  partials; change one, change all nine.
- **Both languages are in the markup.** `<html lang>` decides which set is
  painted, so the page reads correctly with JavaScript disabled.

Details in [docs/architecture.md](docs/architecture.md).

## Before you launch

[docs/content.md](docs/content.md) lists what is real and what is still
placeholder. In short: the reservation form posts nowhere, contact details and
social links are dummies, there is no interior or event photography, and the
chef portrait is a stand-in.

## Deploying

Copy the folder to any static host. Exclude `assets/img/originals/` — the
full-resolution photo masters are source material, not site assets.
