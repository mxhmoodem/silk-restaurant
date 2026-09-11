# SILK — Brand system

**Version 4.** This is the written specification. `brand-system.html` is the same
system rendered in the browser, using the real site stylesheets — open that when
you need to see a colour or a button rather than read about it.

Every value here exists as a token in [`assets/css/tokens.css`](../assets/css/tokens.css).
Change it there and it changes everywhere. Do not hard-code a hex value or a
type size in a page stylesheet.

---

## The one-paragraph version

Two voices and one motif carry the whole brand: **Cormorant Garamond italic** for
everything expressive, **Oswald** for everything functional, and the **eight-point
square star** for everything in between.

The cusped cartouche, the scalloped pill and the sunburst dial are retired — see
[Retired in v4](#retired-in-v4).

---

## 1. Typography

### Display — expressive

**Cormorant Garamond.** Headlines, pull quotes, dish names, the one line per
section that has to carry feeling.

Always italic, always 400 or 600, never below 24 px, never for interface text.
Set it large, give it room, and keep the measure under 640 px.

### Text — functional

**Oswald.** Body copy, navigation, labels, prices, captions, buttons. Condensed
and quiet — it never competes with the display face.

300 for body, 400 for buttons and hard-working labels, 500 only for uppercase
micro-labels under 12 px. Cyrillic is covered, which is what makes the RU
edition possible.

### Scale contrast — the house move

One display line at 100 px or more, answered by tracked caps at 10–11 px.
Nothing in between on a hero: the middle sizes belong to body copy, not to
headlines.

### The scale

| Role | Size / line-height / weight | Token |
|------|------------------------------|-------|
| Hero | 132 / 0.92 / italic 600 | `--t-hero` |
| H1 | 72 / 1.02 / italic 600 | `--t-h1` |
| H2 | 46 / 1.14 / italic 400 | `--t-h2` |
| H3 | 32 / 1.2 / italic 400 | `--t-h3` |
| Quote | 30 / 1.42 / italic 400 | `--t-quote` |
| Body | 16.5 / 1.75 / 300 | `--t-body` |
| Small | 13.5 / 1.63 / 300 | `--t-small` |
| Label | 12.5 / 400 / .20em caps | `--t-label` |
| Eyebrow | 10.5 / 500 / .34em caps | `--t-eyebrow` |

Display sizes are fluid (`clamp()`), so they shrink to the mobile end of the
ramp without a breakpoint. The printed numbers above are the desktop maximums.

### Editorial rhythm

Copy runs on a 4 px baseline grid: body 16.5/28, small print 13.5/22, labels
12.5/20. A column never exceeds 640 px (`--measure`).

**Set one drop cap per page at most** — the opening paragraph of the longest
story — and never inside a card. Use `.drop-cap`.

Section numbers are set in the display italic in copper at 46–52 px. They are
ornament, not labels. Never letterspace the italic beyond 0.06em.

---

## 2. Pattern — the eight-point square star

A square and its 45° twin, single-weight, no fill.

**Three scales only:**

| Scale | Size | Stroke | Use |
|-------|------|--------|-----|
| Structural | 160 px | 1.6 | One field per page |
| Field | 64 px | 1.0 | Copper on bone, copper soft on teal, silk sand on spice |
| Hairline | 34 px | 0.7 | Texture, dividers, safe behind body copy at 16% |

One structural field per page; everywhere else the pattern sits under 20%
opacity and never behind body copy at full strength.

**The pattern frames the copy; it does not run through it.** A field on a teal
or spice band is masked to full strength in the gutters, thinning to a trace
behind the text column. A structural wash on bone is a soft bloom that
dissolves before it reaches an edge, so the next section never cuts it off.
Both are handled in `components.css` — do not re-add a flat field by hand.

**Do** — bleed the structural field off at least two edges. Let type sit on the
pattern. Align the tile to the page gutter so the lattice reads as architecture.

**Don't** — no second scale in the same section. No pattern inside a card,
button or photo mask. No rotation, no gradient fills, no stroke weights other
than 0.7 / 1 / 1.6.

Classes: `.pattern`, `.pattern--structural`, `.pattern--hairline`,
`.pattern--on-dark`, `.pattern--on-spice`, `.pattern-band`, `.pattern-gutter`.

---

## 3. Buttons — block and inset rule

The scalloped pill is gone. A SILK button is a hard-edged block with a hairline
rule set 4 px inside its edge — a printed label, not a UI chip.

**Three ranks:**

| Rank | Class | Use |
|------|-------|-----|
| Filled | `.btn.btn--filled` | The one action per section |
| Outlined | `.btn.btn--outlined` | The alternative |
| Ruled text | `.btn-text` | Everything tertiary |

Oswald 400, 12.5 px, 0.2em, uppercase; minimum 56 px tall. **No rounded corners
anywhere in the system.**

Every button rests on its own opaque ground — an outlined button is bone-light
on bone, teal-deep on teal, spice-deep on spice — so a pattern never shows
through the label. Its outer edge is 70% of the text colour, which clears 3:1.

On hover: a filled block catches a sheen of light; an outlined block fills from
the floor up; a ruled text link draws a darker stroke across its rule. The inset
rule steps in from 4 px to 6 px on both block ranks.

On teal and spice grounds the ranks invert automatically — bone fill, bone
outline. That is handled by `.ground--teal` / `.ground--spice`; do not restyle
buttons per page.

Related but *not* buttons:

- `.status` — a status block ("Open now · until 01:00"). Information, not an action.
- `.filter` — filter chips, 2 px seam, no inset rule.
- `.field__input` — form fields, underline only, jade on focus.

---

## 4. Colour

### Primary ground — Bone

`--bone` **#EFE9E0** · `--bone-light` #F5F0E8 · `--bone-shade` #E6DED0

Assume a section is bone unless there is a reason otherwise.

### Banded punctuation — Deep Teal

`--teal` **#0E3A37** · `--teal-deep` #0A2B29

Full-width bands every two or three sections, the footer, filled CTAs, and
every heading on bone.

### Accent — Copper

`--copper` **#B87446** · `--copper-soft` #C89A6E · `--copper-deep` #8C4E28

Pattern linework, eyebrows, numerals, rules. **Never a ground, never body copy.**

### Feature band — Leather Spice

`--spice` **#523322**, text `--silk-sand` **#FFDACB**

One deep band per page, never adjacent to teal.

### Utility

- `--ink` **#4A443C** — body text on bone. Never pure black.
- `--jade` **#016C81** — focus states and form underlines only.
- `--alert` **#A1391D** / `--alert-on-dark` #F2B49B — form error messages and
  the edge of the field they belong to. Nothing else.

### Control edges

Lines that mark something you type into or press must clear 3:1 against their
ground (WCAG 1.4.11). Decorative rules (`--rule`, `--rule-soft`) stay soft;
these do not:

| Token | Value | Use |
|-------|-------|-----|
| `--line-ui` | #A47354 | Field underlines on any bone |
| `--line-ui-strong` | teal 58% | Filter chips on bone |
| `--line-ui-teal` | bone 45% | Field underlines, arrow buttons on teal |
| `--line-ui-spice` | sand 50% | The same on spice |

### Gradients

Grounds carry light, never a second colour. Bone grounds start and end on
`--bone` and lift to `--bone-light` in the middle, so two bone sections meet
without a seam. Teal pools `--teal-glow` in its upper corner and falls to
`--teal-deep`; spice pools `--spice-light` low and falls to `--spice-deep`.
No copper on teal — it muddies to brown.

`.ground--blush` warms bone toward silk sand (`--sand-blush`). Use it for the
closing call to action on a page, where the gradient is the only ornament.

**Two grounds per page maximum.**

---

## 5. Logo and lockups

The wordmark is artwork, never set type — no tracking, no italicising, no
recolouring beyond the four approved fills. Clear space equals the height of the
S on every side. Minimum width 96 px for the lockup, 24 px for the sun.

The marks are injected as an SVG sprite by
[`assets/js/silk-marks.js`](../assets/js/silk-marks.js), which is loaded as the
first element in `<body>` on every page. Reference them with `<use>`:

```html
<svg class="mark mark--word" viewBox="0 0 180.03 142.78" aria-hidden="true">
  <use href="#silk-word--0E3A37"></use>
</svg>
```

Colour is baked per variant, because inherited colour does not cross the `<use>`
shadow boundary reliably.

- Sun: `#silk-sun--B87446`, `--EFE9E0`, `--FFDACB`, `--0E3A37`, `--C89A6E`
- Wordmark: `#silk-word--0E3A37`, `--EFE9E0`, `--B87446`, `--FFDACB`

---

## 6. Spacing and rhythm

Scale: **4 · 8 · 12 · 20 · 32 · 52 · 84 · 136** (`--s-1` … `--s-8`).

- Page gutters: 128 desktop / 24 mobile (`--gutter`, fluid between)
- Section padding: 104–150 desktop, 44–54 mobile (`--section-y`)
- One CTA per section
- At most two grounds per page
- One structural pattern field per page

---

## 7. Motion

Slow, soft landings — `--ease-out`, roughly a second. Nothing loops, nothing
bounces, and nothing moves at all under `prefers-reduced-motion`.

- **Entrance.** The first screen rises in on load: eyebrow, headline, lede,
  actions, a beat apart. Hero photographs settle from a slight zoom.
- **Reveal.** Below the fold, text and cards rise 28 px out of transparency,
  display type out of a slight blur, photographs are uncovered from the floor
  up, and rules draw themselves from the left. Things that arrive together
  cascade 90 ms apart in reading order. `site.js` tags these automatically.
- **Parallax.** Hero and band photographs drift against their frames; pattern
  fields and washes drift slower than the page. Photographs are overscanned so
  no edge ever shows.
- **Hover.** Buttons as in §3. Photographs lean in 4.5%. Nav links draw their
  underline from the centre; the sun in the nav turns half a revolution.
- **Chrome.** The nav lifts off the page once you scroll, tucks away while
  you read down, and returns on any scroll up.

---

## Retired in v4

These are gone. If you find one in an old file, replace it.

| Retired | Replacement |
|---------|-------------|
| Cartouche shapes (`silkTag`, `silkTagTall`, `silkBadge`) | Rectangular containers, photo crops and labels. The hairline and the pattern do the decorating. |
| Scalloped pill (`silkPill`) | The block button with its 4 px inset rule. No rounded corners anywhere. |
| CSS sunburst and letterspaced "SILK" stand-ins | The real artwork: the drawn sun and the SILK RESTAURANT lockup. |
| Interlaced star tile, jade linework | The square star. Jade Night #016C81 survives for focus states and form underlines only. |

---

## Where the system lives in code

| Layer | File | Holds |
|-------|------|-------|
| Tokens | `assets/css/tokens.css` | Every colour, size, space and duration |
| Elements | `assets/css/base.css` | Reset, element defaults, type primitives, EN/RU switching |
| Components | `assets/css/components.css` | Grounds, pattern, buttons, forms, media, reveal |
| Chrome | `assets/css/layout.css` | Navigation, footer, action bar |
| Page | `assets/css/<page>.css` | Layout unique to one page, nothing else |

A page stylesheet may not define a colour or a type size — only layout. If you
need a new value, add a token.
