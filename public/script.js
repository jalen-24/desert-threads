/* Desert Threads — ~70 lines of vanilla JS. No libraries, no build step. */
(function () {
  'use strict';

  var hdr = document.getElementById('hdr');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  /* — sticky header shadow — */
  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      hdr.classList.toggle('stuck', scrollY > 12);
      ticking = false;
    });
  }, { passive: true });

  /* — mobile menu — */
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () {
    setMenu(!hdr.classList.contains('open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* — scroll reveal, staggered per group — */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var groups = new Map();
    items.forEach(function (el) {
      var key = el.parentElement;
      var n = groups.get(key) || 0;
      groups.set(key, n + 1);
      el.style.setProperty('--d', Math.min(n, 5) * 80 + 'ms');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* — quote form: hands off to the shop's inbox — */
  var form = document.getElementById('qform');
  var ok = document.getElementById('qformOk');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var f = new FormData(form);
    var body = [
      'Name: ' + (f.get('name') || ''),
      'Email: ' + (f.get('email') || ''),
      'Phone: ' + (f.get('phone') || '—'),
      'Item: ' + (f.get('item') || ''),
      'Quantity: ' + (f.get('qty') || '—'),
      '',
      f.get('msg') || ''
    ].join('\n');
    location.href = 'mailto:desertthreadsemb@gmail.com'
      + '?subject=' + encodeURIComponent('Quote request — ' + (f.get('name') || 'website'))
      + '&body=' + encodeURIComponent(body);
    ok.textContent = 'Opening your email app with the details filled in. Prefer to talk? (602) 836-1703.';
    ok.hidden = false;
  });

  /* — footer year — */
  document.getElementById('yr').textContent = new Date().getFullYear();
})();
