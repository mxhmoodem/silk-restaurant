# Content: what is real, and what still needs filling in

The site was converted from a set of Claude Design canvases. Almost all copy
carried across verbatim in both languages. This file records where the site
**deviates from the mockups**, and what is still placeholder.

Read it before you tell a client the site is finished.

---

## Open gaps

### 1. There is no interior or event photography

The photo library is 145 frames and **every one is food or drink**, shot on a
table. There are no photographs of the room, the bar, the mangal station, the
merchant's stall, guests, or an event.

The mockups' gallery was built around three categories — *Interior*, *Food*,
*Events*. Two of the three had nothing to fill them, so the live gallery uses
categories the library can actually support:

| Mockup | Live site |
|--------|-----------|
| Interior | **The table** — spreads and settings |
| Food | **Mangal** — skewers and the grill |
| Events | **Bar** — cocktails and cold drinks |

**When interior and event photography exists**, restore the original three
categories in [`assets/js/gallery.js`](../assets/js/gallery.js) and update the
chips in `gallery.html`.

### 2. The chef portrait is a stand-in

`chef.html` uses `img7009` — a server carrying a plate, face not visible. It is
the closest thing in the library to a portrait. **A real portrait of Maxim
Fomenkov is needed**, shot vertically, natural light, kitchen behind.

The About page's merchant portrait (chapter V) uses the same frame, so one shoot
fixes both.

### 3. The building's archive photo is a stand-in

Chapter IV of `about.html` calls for an archive photograph of the merchant
house. There isn't one. The slot currently holds a spice box (`img6680`), which
carries the right idea without pretending to be an archive image — the caption
was rewritten accordingly.

### 4. Menu dish names and descriptions are English-only

The Menu canvas had **no Russian content at all** — no dish names, no
descriptions. Rather than invent translations for forty dishes, the page ships
with structural copy (hero, section labels, the closing CTA) in both languages
and the dish list in English.

This is a normal arrangement for a bilingual restaurant menu, but it is a
decision, not an oversight. **To complete it**, add `data-lang` pairs to
`.dish__name` and `.dish__note` in `menu.html`.

### 5. The maps are plates, not maps

`contacts.html` and the footer show a styled plate that links out to Google
Maps. There is no embedded map, because that needs an API key and adds a
third-party script to every page. Swap `.contacts-map` for an `<iframe>` if you
want a live map.

### 6. The reservation form goes nowhere

It validates and reports back in place. See
[development.md](development.md#wiring-the-reservation-form) — it needs an
endpoint, on **both** `index.html` and `contacts.html`.

### 7. Terms and privacy are placeholders

`contacts.html#legal` describes both documents and links to `mailto:`. The
actual documents do not exist. The footer's Terms and Privacy links point at
that section.

---

## Deliberate departures from the mockups

These were changed on purpose; they are not bugs.

**"Load more" removed from the journal.** The canvas showed *"6 of 24 articles"*
with a Load more button, but only six posts exist. A button that loads nothing
is worse than no button, so the count is honest and the slot holds a
*"Suggest a subject"* link instead.

**Every journal post links to the same article.** Only one article was written
(`article.html`, the plov piece). The other five entries point at it as a
template. Give each its own file as the copy is written.

**The canvases' desktop and mobile frames became one responsive page.** The
mockups drew 1440 and 390 side by side as separate artboards. The site is one
fluid layout; mobile compositions follow the 390 frames where they differed
meaningfully.

**Photography is cropped, not re-composed.** Every source frame is 2:3 portrait.
Sections the mockups drew as wide landscape bands — the homepage atmosphere
photograph, the article hero — crop to a fixed height with `object-fit: cover`.

---

## Placeholder values to replace before launch

| Value | Where | Currently |
|-------|-------|-----------|
| Phone | Nav, footer, contacts, action bar | `+62 811 000 000` |
| Email | Footer, contacts | `hello@silk.bali`, `events@silk.bali` |
| Instagram | Footer, contacts, gallery | `https://instagram.com/` |
| Telegram | Footer, contacts | `https://t.me/` |
| WhatsApp | Footer, contacts, delivery link | `https://wa.me/62811000000` |
| TripAdvisor | Contacts | `https://tripadvisor.com/` |
| Address | Footer, contacts, maps links | Jl. Subak Canggu No. 12, Bali 80361 |

The phone number appears in both a display form (`+62 811 000 000`) and an href
(`tel:+62811000000`). Change both.

---

## Content that is real and complete

Everything else. Both languages, all pages:

- The full About story — five chapters, the five carriers, the geography table,
  the neo-modern position, the building legend, the merchant's five acts
- The complete menu — eight courses, forty-one items with prices
- The chef's biography, philosophy quote and three kitchens
- Six journal entries with dates, categories, read times and excerpts
- One complete long-form article, including its pull quote and steps
- Nine guest reviews plus the featured quote and rating
- All contact details, hours, getting-here notes and legal summaries
