document.addEventListener('DOMContentLoaded', function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* year */
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  /* nav: background, progress bar, active link */
  var nav = document.getElementById('siteNav');
  var bar = document.getElementById('progress');
  var sections = document.querySelectorAll('main section[id], header#top, footer#contact');
  var links = document.querySelectorAll('.nav-link');
  function onScroll() {
    var st = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', st > 24);
    bar.style.width = (max > 0 ? (st / max) * 100 : 0) + '%';
    var pos = st + 160, cur = null;
    sections.forEach(function (s) { if (pos >= s.offsetTop) cur = s.id; });
    links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + cur); });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var toggle = document.getElementById('navToggle'), menu = document.getElementById('navLinks');
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); });
  });

  /* scroll reveal + stat counters */
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10), n = 0;
    if (reduce) { el.textContent = target; return; }
    var step = setInterval(function () { n++; el.textContent = n; if (n >= target) clearInterval(step); }, 260);
  }
  var revealItems = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in-view');
        e.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('in-view'); });
    document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* rotating research keywords in the hero */
  var rot = document.getElementById('rotator');
  if (rot && !reduce) {
    var words = ['computational intelligence', 'deep learning', 'sustainable finance', 'optimization'], i = 0;
    setInterval(function () {
      rot.classList.add('is-out');
      setTimeout(function () { i = (i + 1) % words.length; rot.textContent = words[i]; rot.classList.remove('is-out'); }, 420);
    }, 2800);
  }

  /* photo strip: duplicate items for a seamless loop */
  var track = document.getElementById('stripTrack');
  if (track) {
    Array.prototype.slice.call(track.children).forEach(function (n) {
      var c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; track.appendChild(c);
    });
    if (reduce) track.style.animation = 'none';
  }

  /* hero parallax (desktop pointer only) */
  var field = document.querySelector('.hero-field'), hero = document.querySelector('.hero');
  if (field && !reduce && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 18, yy = (e.clientY / window.innerHeight - 0.5) * 18;
      field.style.transform = 'translate(' + x + 'px,' + yy + 'px)';
    });
  }

  /* lightbox for photos and certificates */
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lightboxImg'), lbCap = document.getElementById('lightboxCap');
  function openLb(src, cap) { lbImg.src = src; lbImg.alt = cap || ''; lbCap.textContent = cap || ''; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); }
  function closeLb() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-full]');
    if (t) { openLb(t.dataset.full, t.dataset.caption); return; }
    if (e.target === lb || e.target.id === 'lightboxClose') closeLb();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });

  /* custom cursor: dot + trailing ring + soft petal trail (desktop pointers only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.documentElement.classList.add('has-cursor');
    var mx = -100, my = -100, rx = -100, ry = -100, lastT = 0;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      document.documentElement.classList.add('cursor-on');
      var now = performance.now();
      if (now - lastT > 55) {
        lastT = now;
        var t = document.createElement('span'); t.className = 'cursor-trail';
        t.style.left = mx + 'px'; t.style.top = my + 'px';
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 820);
      }
      var el = e.target.closest ? e.target.closest('[data-full], .cert-thumb, .strip-item, a, button, .pill') : null;
      var photo = el && (el.hasAttribute('data-full'));
      ring.classList.toggle('is-photo', !!photo);
      ring.classList.toggle('is-link', !!el && !photo);
      ring.setAttribute('data-label', photo ? 'View' : '');
      dot.classList.toggle('is-hidden', !!photo);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { document.documentElement.classList.remove('cursor-on'); });
    document.addEventListener('mouseenter', function () { document.documentElement.classList.add('cursor-on'); });
    window.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
  }
});
