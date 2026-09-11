/* ==========================================================================
   SILK — Homepage menu book
   The pages, in both languages, are in the markup; this only binds them.
   StPageFlip (vendor/page-flip.min.js, MIT) sizes the pages and draws the
   curl. If it is missing the pages stay in a row you scroll sideways.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.querySelector('[data-viewer]');
  if (!root || !window.St || !window.St.PageFlip) return;

  var TURN = 900;    // ms for one page turn — mirrors --dur-page

  var book    = root.querySelector('[data-book]');
  var pages   = book.querySelectorAll('.book__page');
  var prev    = root.querySelector('[data-book-prev]');
  var next    = root.querySelector('[data-book-next]');
  var bar     = root.querySelector('[data-book-bar]');
  var counter = root.querySelector('[data-book-counter]');
  var still   = window.matchMedia('(prefers-reduced-motion: reduce)');

  var flip = new St.PageFlip(book, {
    width: 400,              // a 5:7 page; 'stretch' scales it to the column
    height: 560,
    size: 'stretch',
    minWidth: 220,           // below two of these side by side, one page at a time
    maxWidth: 480,
    minHeight: 308,
    maxHeight: 672,
    showCover: true,
    flippingTime: TURN,
    maxShadowOpacity: 0.45,
    showPageCorners: !still.matches
  });

  /* Where the reader is, as spreads: in landscape the covers stand alone and
     everything between comes in pairs; in portrait every page is its own. */
  function position() {
    var index = flip.getCurrentPageIndex();
    var count = flip.getPageCount();
    if (flip.getOrientation() !== 'landscape') return { at: index, of: count, index: index };
    return { at: index === 0 ? 0 : Math.floor((index + 1) / 2), of: Math.floor(count / 2) + 1, index: index };
  }

  function closedSide(where) {
    if (flip.getOrientation() !== 'landscape') return 'open';
    if (where.at === 0) return 'front';
    if (where.at === where.of - 1 && flip.getPageCount() % 2 === 0) return 'back';
    return 'open';
  }

  function paint() {
    var where = position();
    book.setAttribute('data-book-at', closedSide(where));
    counter.textContent = (where.at + 1) + ' / ' + where.of;
    bar.style.width = ((where.at + 1) / where.of * 100) + '%';
    prev.disabled = where.at === 0;
    next.disabled = where.at === where.of - 1;
    warm(where.index);
  }

  /* Pages out of view are display:none, so their lazy photos never start.
     Once the book is near the screen, fetch the next spread or two ahead. */
  var near = false;

  function warm(index) {
    if (!near) return;
    for (var i = Math.max(0, index - 2); i < Math.min(pages.length, index + 6); i++) {
      var img = pages[i].querySelector('img');
      if (img) img.loading = 'eager';
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries, observer) {
      if (!entries[0].isIntersecting) return;
      near = true;
      warm(flip.getCurrentPageIndex());
      observer.disconnect();
    }, { rootMargin: '400px 0px' }).observe(root);
  } else {
    near = true;
  }

  function turn(direction) {
    // StPageFlip's instant turn walks off the end of the book, so stop here.
    var where = position();
    if (where.at + direction < 0 || where.at + direction >= where.of) return;

    if (still.matches) {
      if (direction > 0) flip.turnToNextPage(); else flip.turnToPrevPage();
      paint();
    } else if (direction > 0) {
      flip.flipNext();
    } else {
      flip.flipPrev();
    }
  }

  flip.on('init', paint);
  flip.on('flip', paint);
  flip.on('changeOrientation', paint);
  flip.on('changeState', function (event) {
    // Opening or closing: glide to the middle while the page is still turning,
    // not after it lands. 'read' means it settled — or sprang back.
    if (event.data === 'flipping') book.setAttribute('data-book-at', 'open');
    if (event.data === 'read') paint();
  });

  flip.loadFromHTML(pages);
  paint();

  prev.addEventListener('click', function () { turn(-1); });
  next.addEventListener('click', function () { turn(1); });

  root.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); turn(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); turn(1); }
  });

  var chrome = root.querySelectorAll('[data-book-controls]');
  for (var i = 0; i < chrome.length; i++) chrome[i].hidden = false;
})();
