/* ==========================================================================
   SILK — Site behaviour
   Language switching, mobile navigation, motion (reveals, parallax, nav
   scroll state). No dependencies. Every page loads this file; the booking
   form has its own, booking.js.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     Language — EN / RU
     Both languages are in the markup. The <html lang> attribute decides which
     set is painted (see base.css), so the page is readable without this file.
     ------------------------------------------------------------------------ */

  var STORE_KEY = 'silk.lang';
  var LANGS = ['en', 'ru'];

  function readStoredLang() {
    try {
      var v = window.localStorage.getItem(STORE_KEY);
      return LANGS.indexOf(v) > -1 ? v : null;
    } catch (e) {
      return null; // private mode, blocked storage — fall through to the default
    }
  }

  function storeLang(lang) {
    try {
      window.localStorage.setItem(STORE_KEY, lang);
    } catch (e) {
      /* not fatal — the choice simply will not survive the next page load */
    }
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    document.documentElement.setAttribute('lang', lang);
    storeLang(lang);

    var buttons = document.querySelectorAll('[data-set-lang]');
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-set-lang') === lang;
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    document.dispatchEvent(new CustomEvent('silk:langchange', { detail: { lang: lang } }));
  }

  function initLang() {
    setLang(readStoredLang() || document.documentElement.getAttribute('lang') || 'en');

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-set-lang]');
      if (!trigger) return;
      event.preventDefault();
      setLang(trigger.getAttribute('data-set-lang'));
    });
  }

  /* ------------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------------ */

  function initNav() {
    var burger = document.querySelector('[data-nav-toggle]');
    var panel = document.getElementById('nav-links');
    if (!burger || !panel) return;

    var desktop = window.matchMedia('(min-width: 1081px)');

    function open(state) {
      burger.setAttribute('aria-expanded', state ? 'true' : 'false');
      panel.hidden = !state && !desktop.matches;
    }

    function sync() {
      // Above the breakpoint the list is always laid out inline, never hidden.
      panel.hidden = desktop.matches ? false : burger.getAttribute('aria-expanded') !== 'true';
    }

    burger.addEventListener('click', function () {
      open(burger.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (event) {
      if (event.target.tagName === 'A' && !desktop.matches) open(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        open(false);
        burger.focus();
      }
    });

    desktop.addEventListener('change', sync);
    sync();
  }

  /* ------------------------------------------------------------------------
     Motion — reveals, parallax, the nav's scroll state.
     All of it is decoration. With script off, or with reduced motion asked
     for, nothing is hidden and nothing moves.
     ------------------------------------------------------------------------ */

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var canAnimate = !reducedMotion.matches && 'IntersectionObserver' in window;

  var STAGGER = 90;       // ms between elements that arrive together — mirrors --stagger
  var STAGGER_CAP = 7;    // the eighth element onward waits no longer than the seventh
  var REVEAL_MS = 1900;   // longest reveal transition, used to clean up after it

  var VARIANTS = ['reveal--heading', 'reveal--line', 'reveal--media'];

  /* Reveal on scroll ------------------------------------------------------
     Pages carry a few hand-placed .reveal classes; the rest are tagged here,
     so a new section picks the motion up without touching its markup.
     Order matters: containers are claimed before the text inside them, and
     anything inside a claimed element is left to move with it. Lines and
     photographs are exempt — their effect is a wipe, not a fade, so it reads
     cleanly inside a container that is fading. */

  var AUTO_REVEAL = [
    ['', '.viewer, .carrier, .position, .kitchen, .review, .featured-review, .locations__card, ' +
         '.contact-card, .note-card, .side-card, .dish, .geography__list > div, .mascot__acts > li, ' +
         '.prose__steps > li, .prose__quote, .pull-quote, .article-aside, .chapter-index li, ' +
         '.contacts-map, .footer__top > div, .footer__bottom, .booking, .reserve__facts'],
    ['reveal--heading', 'main .hero-type, main .h1, main .h2, main .quote-type, .chef-philosophy__quote, .rating'],
    ['', 'main .chapter-numeral, main .eyebrow, main .body, main .small, main .btn-row, main .btn-text, ' +
         'main .caption, main .status, main .reserve__phone, main .geography__title'],
    ['reveal--line', '.section-mark__rule, .chapter__rule'],
    ['reveal--media', 'main .media']
  ];

  var revealObserver = null;

  function finishReveal(el) {
    // Once it has landed, hand the element back to its own styles so hover
    // transitions (which .reveal's transition list would mask) work again.
    el.classList.remove('reveal', 'is-visible');
    for (var i = 0; i < VARIANTS.length; i++) el.classList.remove(VARIANTS[i]);
    el.style.removeProperty('--reveal-delay');
  }

  function onReveal(entries) {
    var arriving = [];
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      arriving.push.apply(arriving, entry.target.__silkReveal || []);
      entry.target.__silkReveal = null;
    });
    if (!arriving.length) return;

    // Elements that arrive in the same frame cascade in reading order.
    arriving.sort(function (a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return (ra.top - rb.top) || (ra.left - rb.left);
    });

    arriving.forEach(function (el, i) {
      var delay = Math.min(i, STAGGER_CAP) * STAGGER;
      el.style.setProperty('--reveal-delay', delay + 'ms');
      el.classList.add('is-visible');
      window.setTimeout(function () { finishReveal(el); }, delay + REVEAL_MS);
    });
  }

  /* A rule scaled to zero width has no area to intersect, so its parent is
     watched on its behalf. Each watched element keeps the list of reveals
     it releases. */
  function observeReveal(el) {
    if (!revealObserver) {
      // No bottom inset: the last row of a page can never scroll above one.
      revealObserver = new IntersectionObserver(onReveal, { threshold: 0.06 });
    }
    var watched = el.classList.contains('reveal--line') && el.parentElement ? el.parentElement : el;
    if (!watched.__silkReveal) {
      watched.__silkReveal = [];
      revealObserver.observe(watched);
    }
    watched.__silkReveal.push(el);
  }

  function inViewNow(el) {
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return true;   // display:none — the other language
    return r.top < window.innerHeight && r.bottom > 0;
  }

  /* Tag and watch a set of elements. Scripts that paint their own lists
     (gallery, journal) call this after each paint with force = true, so a
     freshly filtered grid cascades in even though it is already on screen. */
  function reveal(nodes, variant, force) {
    if (!canAnimate) return;
    var take = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.classList.contains('reveal')) continue;
      if (!force && inViewNow(el)) continue;
      take.push(el);
    }
    if (!take.length) return;

    // Drop into the hidden state instantly — with the transition live, every
    // element below the fold would first spend a second fading out.
    var frozen = [];
    take.forEach(function (el) {
      frozen.push(el);
      if (variant === 'reveal--media') frozen.push.apply(frozen, el.querySelectorAll('img'));
    });
    frozen.forEach(function (el) { el.style.transition = 'none'; });
    take.forEach(function (el) {
      el.classList.add('reveal');
      if (variant) el.classList.add(variant);
    });
    void document.body.offsetWidth;
    frozen.forEach(function (el) { el.style.removeProperty('transition'); });
    take.forEach(observeReveal);
  }

  function initReveal() {
    var marked = document.querySelectorAll('.reveal');

    if (!canAnimate) {
      for (var i = 0; i < marked.length; i++) marked[i].classList.add('is-visible');
      return;
    }

    for (var j = 0; j < marked.length; j++) observeReveal(marked[j]);

    AUTO_REVEAL.forEach(function (group) {
      var variant = group[0];
      var exempt = variant === 'reveal--line' || variant === 'reveal--media';
      var found = document.querySelectorAll(group[1]);
      var take = [];
      for (var k = 0; k < found.length; k++) {
        var el = found[k];
        if (el.closest('[data-parallax], .gallery-tile, .post-row')) continue;
        if (!exempt && el.parentElement && el.parentElement.closest('.reveal')) continue;
        take.push(el);
      }
      reveal(take, variant, false);
    });
  }

  /* Parallax --------------------------------------------------------------
     Each layer drifts against its frame at `speed` × the frame's distance
     from the middle of the viewport. Photographs are overscanned in CSS
     (scale), and `limit` — a share of the frame's height, or pixels for the
     pattern layers — keeps the drift inside that overscan. */

  var PARALLAX = [
    { sel: '.hero__media img',            speed: 0.14,  limit: 0.06 },
    { sel: '.atmosphere__media img',      speed: 0.22,  limit: 0.09 },
    { sel: '.article-hero img',           speed: 0.22,  limit: 0.09 },
    { sel: '.chef-hero__media img',       speed: 0.10,  limit: 0.045 },
    { sel: '.menu-hero__strip .media:nth-child(1)', speed: -0.04, px: 60 },
    { sel: '.menu-hero__strip .media:nth-child(2)', speed: -0.09, px: 90 },
    { sel: '.menu-hero__strip .media:nth-child(3)', speed: -0.15, px: 120 },
    { sel: '.ground > .pattern--structural, .ground--bone > .pattern--structural', speed: 0.2, px: 160 },
    { sel: '.ground--teal > .pattern, .ground--spice > .pattern', speed: 0.12, px: 110 }
  ];

  var layers = [];

  function initParallax() {
    if (!canAnimate) return;

    PARALLAX.forEach(function (spec) {
      var found = document.querySelectorAll(spec.sel);
      for (var i = 0; i < found.length; i++) {
        found[i].setAttribute('data-parallax', '');
        layers.push({ el: found[i], frame: found[i].parentElement, spec: spec, live: false });
      }
    });
    if (!layers.length) return;

    // Only frames on or near the screen are measured each frame.
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        layers.forEach(function (layer) {
          if (layer.frame === entry.target) layer.live = entry.isIntersecting;
        });
      });
      paintParallax();
    }, { rootMargin: '20% 0px' });

    layers.forEach(function (layer) { watch.observe(layer.frame); });
  }

  function paintParallax() {
    var mid = window.innerHeight / 2;
    var live = layers.filter(function (layer) { return layer.live; });

    // Measure everything first, then write, so no read forces a restyle.
    var offsets = live.map(function (layer) {
      var r = layer.frame.getBoundingClientRect();
      var limit = layer.spec.px || r.height * layer.spec.limit;
      var y = -(r.top + r.height / 2 - mid) * layer.spec.speed;
      return Math.max(-limit, Math.min(limit, y));
    });

    live.forEach(function (layer, i) {
      layer.el.style.setProperty('--py', offsets[i].toFixed(1) + 'px');
    });
  }

  /* Scroll state ----------------------------------------------------------
     .is-scrolled lifts the nav off the page. .nav-tucked slides it away
     while reading downward and brings it back on any upward scroll — never
     while the mobile menu is open or focus is inside the bar. The article
     also gets a reading-progress rule along the nav's lower edge. */

  var TUCK_AFTER = 480;

  function initScrollState() {
    var root = document.documentElement;
    var nav = document.querySelector('.nav');
    var burger = document.querySelector('[data-nav-toggle]');
    var isArticle = document.body.getAttribute('data-page') === 'article';
    var lastY = window.scrollY;
    var queued = false;

    function paint() {
      queued = false;
      var y = window.scrollY;
      root.classList.toggle('is-scrolled', y > 8);

      if (nav && canAnimate) {
        var menuOpen = burger && burger.getAttribute('aria-expanded') === 'true';
        var focused = nav.contains(document.activeElement);
        if (y <= TUCK_AFTER || y < lastY - 4 || menuOpen || focused) {
          root.classList.remove('nav-tucked');
        } else if (y > lastY + 4) {
          root.classList.add('nav-tucked');
        }
      }

      if (isArticle && nav) {
        var span = document.documentElement.scrollHeight - window.innerHeight;
        nav.style.setProperty('--read', span > 0 ? Math.min(1, y / span).toFixed(4) : '0');
      }

      paintParallax();
      lastY = y;
    }

    function queue() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(paint);
    }

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    if (nav) nav.addEventListener('focusin', function () { root.classList.remove('nav-tucked'); });
    paint();
  }

  /* The headline rating counts up to its value once, when first seen. The
     real figure is in the markup, so without script it simply reads 4.9. */
  function initCountUp() {
    var el = document.querySelector('.rating__score');
    if (!el || !canAnimate) return;

    var target = parseFloat(el.textContent);
    if (isNaN(target)) return;
    var decimals = (el.textContent.split('.')[1] || '').length;

    var watch = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      watch.disconnect();
      var start = null;
      var DURATION = 1600;
      function step(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / DURATION);
        var eased = 1 - Math.pow(1 - t, 4);
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    });
    watch.observe(el);
  }

  window.SILK = { reveal: reveal };

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */

  function boot() {
    initLang();
    initNav();
    initParallax();
    initReveal();
    initScrollState();
    initCountUp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
