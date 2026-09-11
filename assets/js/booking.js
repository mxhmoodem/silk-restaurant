/* ==========================================================================
   SILK — Booking panel
   Builds the day strip, dims times that have already passed today, reads the
   choice back on the ticket line, validates in place and shows the sent
   state. Loaded by the two pages that carry the form (index, contacts).

   Without this file the form still works: the day is a native date field and
   time and guests are plain radios.

   A static site has nowhere to post to. When the form has no `action` it
   reports back in place; give it one (see docs/development.md) and a valid
   form posts normally.
   ========================================================================== */

(function () {
  'use strict';

  var TZ = 'Asia/Makassar';   // Bali — "today" and "passed" are the restaurant's clock
  var DAYS = 7;               // cells in the strip; the eighth opens the picker
  var HORIZON = 120;          // how far ahead the picker reaches, in days
  var LEAD = 30;              // minutes of notice a same-day time needs

  var LOCALES = { en: 'en-GB', ru: 'ru-RU' };

  var TEXT = {
    en: {
      today: 'Today', tomorrow: 'Tomorrow', more: 'More', dates: 'dates',
      day: 'Day', time: 'Time',
      guests: { one: 'guest', other: 'guests' }
    },
    ru: {
      today: 'Сегодня', tomorrow: 'Завтра', more: 'Ещё', dates: 'даты',
      day: 'День', time: 'Время',
      guests: { one: 'гость', few: 'гостя', many: 'гостей', other: 'гостя' }
    }
  };

  function lang() {
    return document.documentElement.getAttribute('lang') === 'ru' ? 'ru' : 'en';
  }

  /* Dates are handled as UTC midnights so arithmetic never trips over the
     visitor's own time zone or a daylight-saving change. */

  function baliNow() {
    try {
      var parts = {};
      new Intl.DateTimeFormat('en-GB', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      return {
        date: Date.UTC(+parts.year, +parts.month - 1, +parts.day),
        minutes: (+parts.hour % 24) * 60 + (+parts.minute)
      };
    } catch (e) {
      var d = new Date();
      return { date: Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  var DAY_MS = 86400000;

  function iso(utc) { return new Date(utc).toISOString().slice(0, 10); }

  function parseIso(value) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
  }

  function fmt(utc, opts) {
    opts.timeZone = 'UTC';
    return new Intl.DateTimeFormat(LOCALES[lang()], opts).format(new Date(utc));
  }

  /* "00:00" is the last seating of the night, not the first of the morning. */
  function slotMinutes(value) {
    var hm = value.split(':');
    var mins = (+hm[0]) * 60 + (+hm[1]);
    return mins < 6 * 60 ? mins + 24 * 60 : mins;
  }

  function plural(n) {
    var forms = TEXT[lang()].guests;
    var key = 'other';
    try { key = new Intl.PluralRules(LOCALES[lang()]).select(n); } catch (e) { key = n === 1 ? 'one' : 'other'; }
    return n + ' ' + (forms[key] || forms.other);
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ------------------------------------------------------------------------ */

  function Booking(form) {
    this.form = form;
    this.days = form.querySelector('[data-booking-days]');
    this.ticket = form.querySelector('[data-booking-ticket]');
    this.done = form.querySelector('[data-booking-done]');
    this.now = baliNow();
    this.picked = null;   // a date chosen from the picker, beyond the strip

    this.buildDays();
    this.bind();
    this.placeholders();
    this.sync();
  }

  Booking.prototype.value = function (name) {
    var checked = this.form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : '';
  };

  /* Day strip ---------------------------------------------------------------- */

  Booking.prototype.buildDays = function () {
    var self = this;
    var keep = this.value('date');
    var t = TEXT[lang()];

    var ledger = el('div', 'ledger ledger--days');
    for (var i = 0; i < DAYS; i++) {
      var utc = this.now.date + i * DAY_MS;
      ledger.appendChild(this.dayCell(utc, iso(utc) === keep, i === 0));
    }

    // The eighth cell: "More dates", or the far date once one is picked.
    var more = el('label', 'ledger__cell ledger__cell--more');
    var radio = el('input');
    radio.type = 'radio';
    radio.name = 'date';
    radio.value = this.picked ? iso(this.picked) : '';
    radio.checked = !!this.picked && keep === radio.value;
    more.appendChild(radio);

    if (this.picked) {
      this.fillDay(more, this.picked);
      radio.setAttribute('aria-label', fmt(this.picked, { weekday: 'long', day: 'numeric', month: 'long' }));
    } else {
      more.appendChild(el('span', 'day__dow', t.more)).setAttribute('aria-hidden', 'true');
      more.appendChild(el('span', 'day__more', '+')).setAttribute('aria-hidden', 'true');
      more.appendChild(el('span', 'day__mon', t.dates)).setAttribute('aria-hidden', 'true');
      radio.setAttribute('aria-label', t.more + ' ' + t.dates);
    }

    var picker = el('input', 'booking__picker');
    picker.type = 'date';
    picker.tabIndex = -1;
    picker.setAttribute('aria-hidden', 'true');
    picker.min = iso(this.now.date);
    picker.max = iso(this.now.date + HORIZON * DAY_MS);
    more.appendChild(picker);
    ledger.appendChild(more);

    // Without showPicker() the field itself is laid over the cell, so a tap
    // lands on it and opens the browser's own picker.
    if (typeof picker.showPicker !== 'function') {
      picker.classList.add('booking__picker--overlay');
      picker.removeAttribute('tabindex');
      picker.removeAttribute('aria-hidden');
      picker.setAttribute('aria-label', radio.getAttribute('aria-label'));
      radio.tabIndex = -1;
    }

    // Opening the picker must not select an empty date on the way.
    radio.addEventListener('click', function (event) {
      if (typeof picker.showPicker !== 'function') return;
      event.preventDefault();
      if (self.picked) picker.value = iso(self.picked);
      try { picker.showPicker(); } catch (e) { /* not a user gesture — ignore */ }
    });

    picker.addEventListener('change', function () {
      var utc = parseIso(picker.value);
      if (utc === null) return;
      var offset = Math.round((utc - self.now.date) / DAY_MS);
      self.picked = offset >= DAYS ? utc : null;
      self.buildDays();
      var target = self.form.querySelector('input[name="date"][value="' + iso(utc) + '"]');
      if (target) { target.checked = true; target.focus(); }
      self.sync();
    });

    this.days.textContent = '';
    this.days.appendChild(ledger);
  };

  Booking.prototype.dayCell = function (utc, checked, isToday) {
    var cell = el('label', 'ledger__cell' + (isToday ? ' ledger__cell--today' : ''));
    var radio = el('input');
    radio.type = 'radio';
    radio.name = 'date';
    radio.value = iso(utc);
    radio.checked = checked;
    var long = fmt(utc, { weekday: 'long', day: 'numeric', month: 'long' });
    radio.setAttribute('aria-label', isToday ? TEXT[lang()].today + ', ' + long : long);
    cell.appendChild(radio);
    this.fillDay(cell, utc);
    return cell;
  };

  /* Weekday, date, month. English abbreviations are cut to three letters
     (en-GB writes "Sept"); Russian keeps its own, minus the full stop. */
  Booking.prototype.fillDay = function (cell, utc) {
    var en = lang() === 'en';
    [['day__dow', { weekday: 'short' }], ['day__num', { day: 'numeric' }], ['day__mon', { month: 'short' }]]
      .forEach(function (part) {
        var text = fmt(utc, part[1]).replace('.', '');
        if (en && part[0] === 'day__mon') text = text.slice(0, 3);
        cell.appendChild(el('span', part[0], text)).setAttribute('aria-hidden', 'true');
      });
  };

  /* Times that have passed ---------------------------------------------------- */

  Booking.prototype.syncTimes = function () {
    var form = this.form;
    var isToday = this.value('date') === iso(this.now.date);
    var cutoff = this.now.minutes + LEAD;
    var open = {};

    var slots = form.querySelectorAll('input[name="time"]');
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      var past = isToday && slotMinutes(slot.value) < cutoff;
      slot.disabled = past;
      if (past && slot.checked) slot.checked = false;
      var service = slot.closest('[data-service]').getAttribute('data-service');
      open[service] = open[service] || !past;
    }

    // A service with nothing left today is dimmed; if it was the one showing,
    // move on to the next service that still has a table.
    var tabs = form.querySelectorAll('input[name="service"]');
    var current = null, firstOpen = null;
    for (var j = 0; j < tabs.length; j++) {
      tabs[j].disabled = !open[tabs[j].value];
      if (tabs[j].checked) current = tabs[j];
      if (!firstOpen && open[tabs[j].value]) firstOpen = tabs[j];
    }
    if (current && current.disabled && firstOpen) firstOpen.checked = true;
  };

  /* Ticket line ---------------------------------------------------------------- */

  Booking.prototype.describeDate = function (value) {
    var utc = parseIso(value);
    if (utc === null) return '';
    var t = TEXT[lang()];
    var offset = Math.round((utc - this.now.date) / DAY_MS);
    if (offset === 0) return t.today;
    if (offset === 1) return t.tomorrow;
    return fmt(utc, { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '').replace('Sept', 'Sep');
  };

  Booking.prototype.parts = function () {
    var t = TEXT[lang()];
    var date = this.describeDate(this.value('date'));
    var time = this.value('time');
    return [
      { text: date || t.day, empty: !date },
      { text: time || t.time, empty: !time },
      { text: plural(+this.value('guests') || 2), empty: false }
    ];
  };

  Booking.prototype.renderTicket = function () {
    if (!this.ticket) return;
    this.ticket.textContent = '';
    var self = this;
    this.parts().forEach(function (part, i) {
      if (i) self.ticket.appendChild(document.createTextNode(' · '));
      self.ticket.appendChild(el('span', part.empty ? 'is-empty' : '', part.text));
    });
  };

  Booking.prototype.sync = function () {
    this.syncTimes();
    this.renderTicket();
  };

  /* Validation ------------------------------------------------------------------- */

  Booking.prototype.checks = function () {
    var form = this.form;
    var name = form.querySelector('[name="name"]');
    var phone = form.querySelector('[name="phone"]');
    var visibleSlot = form.querySelector('[data-service="' + this.value('service') + '"] input:not(:disabled)');

    // `target` takes focus when the check fails; `mark` is what gets flagged —
    // aria-invalid on a text field, data-invalid on a ledger of radios.
    return [
      { key: 'date', ok: !!this.value('date'), target: form.querySelector('input[name="date"]'), mark: form.querySelector('.ledger--days') },
      { key: 'time', ok: !!this.value('time'), target: visibleSlot, mark: form.querySelector('[data-step="time"]') },
      { key: 'name', ok: !!(name && name.value.trim()), target: name, mark: name },
      { key: 'phone', ok: !!(phone && phone.value.replace(/\D/g, '').length >= 7), target: phone, mark: phone }
    ];
  };

  Booking.prototype.showError = function (check, on) {
    var msg = this.form.querySelector('[data-error="' + check.key + '"]');
    if (msg) msg.hidden = !on;
    if (!check.mark) return;
    var attr = check.mark.matches('input, textarea') ? 'aria-invalid' : 'data-invalid';
    if (on) check.mark.setAttribute(attr, 'true');
    else check.mark.removeAttribute(attr);
  };

  Booking.prototype.validate = function () {
    var self = this;
    var first = null;
    this.checks().forEach(function (check) {
      self.showError(check, !check.ok);
      if (!check.ok && !first) first = check;
    });
    if (first && first.target) first.target.focus();
    this.validated = true;
    return !first;
  };

  /* Once a submit has flagged errors, each one clears as soon as it is fixed. */
  Booking.prototype.revalidate = function () {
    if (!this.validated) return;
    var self = this;
    this.checks().forEach(function (check) { if (check.ok) self.showError(check, false); });
  };

  /* Sent state --------------------------------------------------------------------- */

  /* The form keeps its values while the sent state shows, so the recap can
     be re-read in the other language. */
  Booking.prototype.renderRecap = function () {
    var recap = this.form.querySelector('[data-booking-recap]');
    if (recap && this.sent) {
      recap.textContent = this.parts().map(function (p) { return p.text; }).join(' · ');
    }
  };

  Booking.prototype.showSent = function () {
    var name = this.form.querySelector('[name="name"]').value.trim().split(/\s+/)[0];
    var slots = this.form.querySelectorAll('[data-booking-name]');
    for (var i = 0; i < slots.length; i++) slots[i].textContent = name ? ', ' + name : '';

    this.sent = true;
    this.renderRecap();
    this.form.setAttribute('data-state', 'sent');
    this.done.hidden = false;
    this.done.focus({ preventScroll: true });
    this.form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  Booking.prototype.reset = function () {
    this.form.reset();
    this.picked = null;
    this.sent = null;
    this.validated = false;
    this.form.removeAttribute('data-state');
    this.done.hidden = true;
    var self = this;
    this.checks().forEach(function (check) { self.showError(check, false); });
    this.now = baliNow();
    this.buildDays();
    this.sync();
    var first = this.form.querySelector('input[name="date"]');
    if (first) first.focus();
  };

  /* Bilingual placeholders --------------------------------------------------------- */

  Booking.prototype.placeholders = function () {
    var fields = this.form.querySelectorAll('[data-ph-en]');
    for (var i = 0; i < fields.length; i++) {
      fields[i].placeholder = fields[i].getAttribute('data-ph-' + lang()) || '';
    }
  };

  /* Wiring ----------------------------------------------------------------------------- */

  Booking.prototype.bind = function () {
    var self = this;
    var form = this.form;

    form.addEventListener('change', function (event) {
      if (event.target.name === 'service') {
        // A time from another service would stay checked out of sight.
        var hidden = form.querySelector('input[name="time"]:checked');
        if (hidden && hidden.closest('[data-service]').getAttribute('data-service') !== event.target.value) {
          hidden.checked = false;
        }
      }
      self.sync();
      self.revalidate();
    });

    form.addEventListener('input', function () { self.revalidate(); });

    form.addEventListener('submit', function (event) {
      if (!self.validate()) { event.preventDefault(); return; }
      if (form.getAttribute('action')) return;   // a real endpoint is configured
      event.preventDefault();
      self.showSent();
    });

    var again = form.querySelector('[data-booking-again]');
    if (again) again.addEventListener('click', function () { self.reset(); });

    document.addEventListener('silk:langchange', function () {
      self.buildDays();
      self.placeholders();
      self.sync();
      self.renderRecap();
    });
  };

  function boot() {
    var forms = document.querySelectorAll('[data-reservation]');
    for (var i = 0; i < forms.length; i++) {
      if (forms[i].querySelector('[data-booking-days]')) new Booking(forms[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
