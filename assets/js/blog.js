/* ==========================================================================
   SILK — Journal index
   One bilingual manifest drives the list; the filter chips narrow it.
   Every post currently points at article.html, the long-form template.
   ========================================================================== */

(function () {
  'use strict';

  var list = document.querySelector('[data-blog-list]');
  if (!list) return;

  var POSTS = [
    {
      cat: 'recipes', href: 'article.html', img: 'img5663',
      en: { date: '12 Aug 2026', cat: 'Recipes', read: '6 min',
            title: 'Lagman pulled by hand, twice',
            excerpt: 'Two pulls, one rest. Why the second one is the only one that matters.' },
      ru: { date: '12 авг 2026', cat: 'Рецепты', read: '6 мин',
            title: 'Лагман, тянутый руками, дважды',
            excerpt: 'Две протяжки, один отдых. Почему значение имеет только вторая.' }
    },
    {
      cat: 'ingredients', href: 'article.html', img: 'img6403',
      en: { date: '04 Aug 2026', cat: 'Ingredients', read: '5 min',
            title: 'Saffron: how to buy it without being robbed',
            excerpt: 'Threads, not powder. Colour is a lie; smell is not.' },
      ru: { date: '04 авг 2026', cat: 'Ингредиенты', read: '5 мин',
            title: 'Шафран: как купить и не быть обманутым',
            excerpt: 'Нити, а не порошок. Цвет обманывает, запах — нет.' }
    },
    {
      cat: 'history', href: 'article.html', img: 'img6582',
      en: { date: '27 Jul 2026', cat: 'History', read: '9 min',
            title: 'The caravanserai was the first restaurant',
            excerpt: 'Beds, stables and a communal pot — the format has barely changed.' },
      ru: { date: '27 июл 2026', cat: 'История', read: '9 мин',
            title: 'Караван-сарай был первым рестораном',
            excerpt: 'Постели, конюшня и общий котёл — формат почти не изменился.' }
    },
    {
      cat: 'ingredients', href: 'article.html', img: 'img6250',
      en: { date: '19 Jul 2026', cat: 'Ingredients', read: '4 min',
            title: 'Yellow carrot, and why we ship it',
            excerpt: 'Orange carrot is sweeter and wetter. Both are wrong for a kazan.' },
      ru: { date: '19 июл 2026', cat: 'Ингредиенты', read: '4 мин',
            title: 'Жёлтая морковь и почему мы её везём',
            excerpt: 'Оранжевая слаще и водянистее. Для казана не годится ни та, ни та.' }
    },
    {
      cat: 'recipes', href: 'article.html', img: 'img5418',
      en: { date: '08 Jul 2026', cat: 'Recipes', read: '7 min',
            title: 'Flatbread in a tandoor at 400 degrees',
            excerpt: 'Slapped on the wall, off in ninety seconds. Timing is the whole recipe.' },
      ru: { date: '08 июл 2026', cat: 'Рецепты', read: '7 мин',
            title: 'Лепёшка в тандыре при 400 градусах',
            excerpt: 'Хлопок по стенке, снять через девяносто секунд. Весь рецепт — во времени.' }
    },
    {
      cat: 'history', href: 'article.html', img: 'img6337',
      en: { date: '30 Jun 2026', cat: 'History', read: '8 min',
            title: 'How pomegranate reached the steppe',
            excerpt: 'A fruit that travelled better as syrup than as fruit.' },
      ru: { date: '30 июн 2026', cat: 'История', read: '8 мин',
            title: 'Как гранат добрался до степи',
            excerpt: 'Фрукт, который путешествовал лучше в виде сиропа, чем в виде фрукта.' }
    }
  ];

  var filters = document.querySelector('[data-blog-filters]');
  var count = document.querySelector('[data-blog-count]');
  var category = 'all';

  function lang() {
    return document.documentElement.getAttribute('lang') === 'ru' ? 'ru' : 'en';
  }

  function paint() {
    var L = lang();
    var posts = POSTS.filter(function (p) {
      return category === 'all' || p.cat === category;
    });

    list.innerHTML = '';

    posts.forEach(function (post) {
      var copy = post[L];

      var li = document.createElement('li');
      li.className = 'post-row';

      var link = document.createElement('a');
      link.className = 'post-row__link';
      link.href = post.href;

      link.innerHTML =
        '<div class="media media--1x1 post-row__media media--zoom">' +
          '<img src="assets/img/photos/' + post.img + '-800.jpg" alt="" loading="lazy" width="800" height="1200">' +
        '</div>' +
        '<div class="post-row__copy">' +
          '<p class="post-meta">' +
            '<span class="post-meta__cat"></span>' +
            '<span class="post-meta__date"></span>' +
            '<span class="post-meta__read"></span>' +
          '</p>' +
          '<h2 class="post-row__title"></h2>' +
          '<p class="small post-row__excerpt"></p>' +
        '</div>' +
        '<span class="post-row__arrow" aria-hidden="true">&#8594;</span>';

      link.querySelector('.post-meta__cat').textContent = copy.cat;
      link.querySelector('.post-meta__date').textContent = copy.date;
      link.querySelector('.post-meta__read').textContent = copy.read;
      link.querySelector('.post-row__title').textContent = copy.title;
      link.querySelector('.post-row__excerpt').textContent = copy.excerpt;

      li.appendChild(link);
      list.appendChild(li);
    });

    count.textContent = L === 'ru'
      ? posts.length + ' из ' + POSTS.length + ' статей'
      : posts.length + ' of ' + POSTS.length + ' articles';

    // Each paint brings the rows in as a cascade (site.js; no-op without motion).
    if (window.SILK) window.SILK.reveal(list.children, '', true);
  }

  filters.addEventListener('click', function (event) {
    var button = event.target.closest('.filter');
    if (!button) return;

    category = button.getAttribute('data-cat');

    var all = filters.querySelectorAll('.filter');
    for (var i = 0; i < all.length; i++) {
      all[i].setAttribute('aria-pressed', all[i] === button ? 'true' : 'false');
    }
    paint();
  });

  document.addEventListener('silk:langchange', paint);
  paint();
})();
