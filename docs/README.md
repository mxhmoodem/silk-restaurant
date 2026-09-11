# SILK — documentation

| Document | Read it when |
|----------|--------------|
| **[brand-system.md](brand-system.md)** | You need the rules: type, colour, pattern, buttons, spacing. |
| **[brand-system.html](brand-system.html)** | You'd rather *see* the system. Open in a browser — it renders every specimen with the live site stylesheets. |
| **[architecture.md](architecture.md)** | You need to know how the site is put together before changing it. |
| **[development.md](development.md)** | You are running it locally, deploying, adding images, or wiring the form. |
| **[content.md](content.md)** | You need to know what is real copy and what is still placeholder. **Read before launch.** |
| **[Silk_brandbook.pdf](Silk_brandbook.pdf)** | The original brand book the v4 system descends from. |

## The short version

- Design tokens live in `assets/css/tokens.css`. Nothing else defines a colour
  or a type size.
- There is no build step. The `.html` files in the project root *are* the site.
- Navigation and footer are duplicated across nine pages. Change one, change all.
- Both languages ship in the markup; `<html lang>` decides which is shown.
- `assets/img/originals/` is 2.3 GB and must never be deployed.

## Known gaps before launch

Full list in [content.md](content.md). The headlines:

1. No interior or event photography exists — the gallery uses categories the
   library can actually fill.
2. The chef portrait is a stand-in.
3. Menu dish names are English-only; the source design had no Russian menu copy.
4. The reservation form posts nowhere yet.
5. Contact details, social links and the address are placeholders.
