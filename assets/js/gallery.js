/* ==========================================================================
   SILK — Gallery
   One manifest drives both the grid and the lightbox. Filters and captions
   are bilingual; the grid repaints on a language change.

   To add a photograph: generate the two derivatives (see docs/development.md),
   then add an entry below. `span` sets how many grid columns the tile takes.
   ========================================================================== */

(function () {
  'use strict';

  var grid = document.querySelector('[data-gallery-grid]');
  if (!grid) return;

  var FRAMES = [
    { id: 'img5432', cat: 'table',  span: 5, rows: 2, en: 'Long table, set for sixteen',       ru: 'Длинный стол на шестнадцать' },
    { id: 'img6039', cat: 'mangal', span: 4, rows: 2, en: 'Mangal, second turn',               ru: 'Мангал, второй заход' },
    { id: 'img6079', cat: 'bar',    span: 3, rows: 2, en: 'Bar, last light',                   ru: 'Бар, последний свет' },
    { id: 'img6582', cat: 'table',  span: 4, rows: 2, en: 'Mezze, five hands',                 ru: 'Мезе, пять рук' },
    { id: 'img5875', cat: 'mangal', span: 4, rows: 2, en: 'Skewers off the coals',             ru: 'Шампуры с углей' },
    { id: 'img6090', cat: 'bar',    span: 4, rows: 2, en: 'Citrus, built to order',            ru: 'Цитрус, собранный на заказ' },
    { id: 'img6552', cat: 'table',  span: 4, rows: 2, en: 'The spread, before anyone sits',    ru: 'Стол, пока никто не сел' },
    { id: 'img6559', cat: 'mangal', span: 3, rows: 2, en: 'Corn, straight off the skewer',     ru: 'Кукуруза прямо с шампура' },
    { id: 'img6730', cat: 'bar',    span: 5, rows: 2, en: 'Smoke under the cloche',            ru: 'Дым под клошем' },
    { id: 'img6294', cat: 'table',  span: 4, rows: 2, en: 'Breakfast, nine in the morning',    ru: 'Завтрак, девять утра' },
    { id: 'img5365', cat: 'table',  span: 4, rows: 2, en: 'Herbs and pomegranate',             ru: 'Зелень и гранат' },
    { id: 'img6951', cat: 'bar',    span: 4, rows: 2, en: 'Green, against turquoise tile',     ru: 'Зелёный на бирюзовой плитке' },
    { id: 'img5735', cat: 'table',  span: 4, rows: 2, en: 'Manti, hand-pleated',               ru: 'Манты, слеплены руками' },
    { id: 'img6412', cat: 'table',  span: 4, rows: 2, en: 'Plated, late service',              ru: 'Подача, поздний сервис' },
    { id: 'img6442', cat: 'bar',    span: 4, rows: 2, en: 'Berry and mint, tall glass',        ru: 'Ягода и мята, высокий бокал' },
    { id: 'img5457', cat: 'table',  span: 6, rows: 2, en: 'Flatbread out of the tandoor',      ru: 'Лепёшка из тандыра' },
    { id: 'img6905', cat: 'bar',    span: 3, rows: 2, en: 'Sour, with a cardamom crown',       ru: 'Сауэр с кардамоновой шапкой' },
    { id: 'img5773', cat: 'table',  span: 3, rows: 2, en: 'Dumplings on painted cloth',        ru: 'Пельмени на расписной ткани' }
  ];

  var CAT_NAMES = {
    all:    { en: 'All',       ru: 'Все' },
    table:  { en: 'The table', ru: 'Стол' },
    mangal: { en: 'Mangal',    ru: 'Мангал' },
    bar:    { en: 'Bar',       ru: 'Бар' }
  };

  var filters = document.querySelector('[data-gallery-filters]');
  var count = document.querySelector('[data-gallery-count]');
  var box = document.querySelector('[data-lightbox]');
  var boxImg = box.querySelector('[data-lightbox-img]');
  var boxCaption = box.querySelector('[data-lightbox-caption]');
  var boxCat = box.querySelector('[data-lightbox-cat]');
  var boxCounter = box.querySelector('[data-lightbox-counter]');

  var category = 'all';
  var open = -1;
  var lastFocus = null;

  function lang() {
    return document.documentElement.getAttribute('lang') === 'ru' ? 'ru' : 'en';
  }

  function visible() {
    return FRAMES.filter(function (f) {
      return category === 'all' || f.cat === category;
    });
  }

  /* ---------------------------------------------------------------- grid -- */

  function paintGrid() {
    var L = lang();
    var frames = visible();

    grid.innerHTML = '';

    frames.forEach(function (frame, index) {
      var li = document.createElement('li');
      li.className = 'gallery-tile';
      li.style.setProperty('--span', frame.span);
      li.style.setProperty('--rows', frame.rows);

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-tile__btn';
      button.setAttribute('data-index', index);

      var img = document.createElement('img');
      img.src = 'assets/img/photos/' + frame.id + '-800.jpg';
      img.alt = frame[L];
      img.loading = 'lazy';
      img.width = 800;
      img.height = 1200;

      var caption = document.createElement('span');
      caption.className = 'gallery-tile__caption';
      caption.textContent = frame[L];

      button.appendChild(img);
      button.appendChild(caption);
      li.appendChild(button);
      grid.appendChild(li);
    });

    count.textContent = L === 'ru'
      ? frames.length + ' кадров'
      : frames.length + (frames.length === 1 ? ' frame' : ' frames');

    // Each paint uncovers the tiles in a cascade (site.js; no-op without motion).
    if (window.SILK) window.SILK.reveal(grid.children, 'reveal--media', true);
  }

  /* ------------------------------------------------------------ lightbox -- */

  function paintBox() {
    var L = lang();
    var frames = visible();
    var frame = frames[open];
    if (!frame) return;

    // Restart the crossfade for the incoming frame (gallery.css).
    boxImg.removeAttribute('data-entering');
    void boxImg.offsetWidth;
    boxImg.setAttribute('data-entering', '');
    boxImg.src = 'assets/img/photos/' + frame.id + '-1600.jpg';
    boxImg.alt = frame[L];
    boxCaption.textContent = frame[L];
    boxCat.textContent = CAT_NAMES[frame.cat][L];
    boxCounter.textContent = (open + 1) + ' / ' + frames.length;
  }

  function openBox(index) {
    lastFocus = document.activeElement;
    open = index;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    paintBox();
    box.querySelector('[data-lightbox-next]').focus();
  }

  function closeBox() {
    box.hidden = true;
    open = -1;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function step(direction) {
    var total = visible().length;
    if (!total) return;
    open = (open + direction + total) % total;
    paintBox();
  }

  /* --------------------------------------------------------------- wire -- */

  grid.addEventListener('click', function (event) {
    var button = event.target.closest('.gallery-tile__btn');
    if (button) openBox(Number(button.getAttribute('data-index')));
  });

  filters.addEventListener('click', function (event) {
    var button = event.target.closest('.filter');
    if (!button) return;

    category = button.getAttribute('data-cat');

    var all = filters.querySelectorAll('.filter');
    for (var i = 0; i < all.length; i++) {
      all[i].setAttribute('aria-pressed', all[i] === button ? 'true' : 'false');
    }
    paintGrid();
  });

  box.addEventListener('click', function (event) {
    if (event.target.closest('[data-lightbox-close]')) closeBox();
    if (event.target.closest('[data-lightbox-prev]')) step(-1);
    if (event.target.closest('[data-lightbox-next]')) step(1);
  });

  document.addEventListener('keydown', function (event) {
    if (box.hidden) return;
    if (event.key === 'Escape') closeBox();
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });

  document.addEventListener('silk:langchange', function () {
    paintGrid();
    if (!box.hidden) paintBox();
  });

  paintGrid();
})();
