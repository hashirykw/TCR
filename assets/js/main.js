/* The Classroom — interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const D = window.TCR;
  let drawerOpen = false;
  if (!reduce) document.documentElement.classList.add('js-motion');
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  /* ---------- Preloader: grade reel climbs E → A*, then a double curtain lifts ---------- */
  const root = document.documentElement, loader = $('.loader');
  const swashOn = () => root.classList.add('swash-on');
  if (root.classList.contains('intro') && loader) {
    lenis && lenis.stop(); loader.classList.add('is-live');
    const pctEl = $('.loader__pct', loader), t0 = performance.now();
    const MIN = 1250, MAX = 3200;
    let shown = 0, loaded = document.readyState === 'complete', done = false;
    addEventListener('load', () => { loaded = true; }, { once: true });
    const grades = 6; // E D C B A A*
    let last = t0;
    const tick = now => {
      if (done) return;
      const el = now - t0, dt = Math.min(64, now - last); last = now;
      // creep toward 88% while loading, run to 100 once loaded and the minimum has passed
      const target = (loaded && el > MIN) || el > MAX ? 100 : Math.min(88, 88 * (1 - Math.pow(1 - Math.min(1, el / MIN), 3)));
      const k = target === 100 ? .22 : .1;
      shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.7)); // frame-rate independent
      if (target === 100 && shown > 99.4) shown = 100;
      const p = shown / 100;
      loader.style.setProperty('--lp', p.toFixed(3));
      loader.style.setProperty('--g', Math.min(grades - 1, Math.floor(p * (grades - 1) + .0001)));
      pctEl.textContent = String(Math.round(shown)).padStart(3, '0');
      if (shown >= 100) return finish();
      requestAnimationFrame(tick);
    };
    const finish = () => {
      if (done) return; done = true;
      try { sessionStorage.setItem('tcr-intro', '1'); } catch (e) {}
      loader.style.setProperty('--lp', 1); loader.style.setProperty('--g', grades - 1); pctEl.textContent = '100';
      loader.classList.add('is-done');
      setTimeout(() => {
        loader.classList.add('is-exit');
        root.classList.add('intro-reveal');
        setTimeout(() => root.classList.remove('intro'), 60);
        setTimeout(swashOn, 600);
      }, 380);
      setTimeout(() => {
        loader.remove(); lenis && lenis.start();
        window.ScrollTrigger && ScrollTrigger.refresh();
      }, 1450);
    };
    // let impatient visitors skip
    const skip = () => { loaded = true; shown = Math.max(shown, 99.5); };
    loader.addEventListener('click', skip); addEventListener('keydown', skip, { once: true });
    requestAnimationFrame(tick);
  } else {
    loader && loader.remove();
    setTimeout(swashOn, 350);
  }

  const scrollTo = (el) => lenis ? lenis.scrollTo(el, { offset: -88 }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault(); closeDrawer();
    if (a.dataset.lvl) setSylLevel(a.dataset.lvl);
    scrollTo(t);
  }));

  /* ---------- Nav: morph, hide on scroll down, active link ---------- */
  const nav = $('#nav'); let lastY = 0;
  const railFill = $('.rail__fill'), railMarks = $$('.rail span');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > 600 && y > lastY + 4 && !drawerOpen);
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    railFill.style.setProperty('--p', p.toFixed(3));
    railMarks.forEach((m, i) => m.classList.toggle('on', p >= i / (railMarks.length - 1) - 0.02));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const sections = $$('main section[id]');
  const links = $$('.nav__links a');
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navIO.observe(s));
  const ind = $('.nav__ind'); let hovered = null;
  function moveInd(a) { if (!ind) return; if (!a) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1; ind.style.width = a.offsetWidth + 'px'; ind.style.transform = `translateX(${a.offsetLeft}px)`; }
  links.forEach(a => { a.addEventListener('pointerenter', () => { hovered = a; moveInd(a); }); });
  $('.nav__links').addEventListener('pointerleave', () => { hovered = null; moveInd($('.nav__links a.is-active')); });
  new MutationObserver(() => { if (!hovered) moveInd($('.nav__links a.is-active')); }).observe($('.nav__links'), { subtree: true, attributes: true, attributeFilter: ['class'] });

  /* ---------- Mobile drawer ---------- */
  const burger = $('.nav__burger'), drawer = $('#drawer');
  function closeDrawer() { if (!drawerOpen) return; drawerOpen = false; drawer.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.focus({ preventScroll: true }); }
  burger.addEventListener('click', () => { drawerOpen = !drawerOpen; drawer.hidden = !drawerOpen; burger.setAttribute('aria-expanded', String(drawerOpen)); if (drawerOpen) $('a', drawer).focus(); });

  /* ---------- Segmented controls ---------- */
  function placeThumb(seg) {
    const on = $('[aria-pressed="true"]', seg), th = $('.seg__thumb', seg);
    if (!on || !th) return;
    th.style.width = on.offsetWidth + 'px';
    th.style.transform = `translateX(${on.offsetLeft}px)`;
  }
  function segSelect(seg, btn) {
    $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    placeThumb(seg);
  }
  const placeAll = () => $$('.seg').forEach(placeThumb);
  addEventListener('resize', placeAll);
  document.fonts && document.fonts.ready.then(placeAll);

  /* ---------- Syllabus explorer ---------- */
  const grid = $('#sylGrid'), search = $('#sylSearch'), sylSeg = $('.syl-tools .seg');
  let sylLvl = 'O';
  function renderSyl() {
    const q = search.value.trim().toLowerCase();
    const list = D.syllabus.filter(s => (q ? true : s.lvl === sylLvl) &&
      (!q || (s.code + ' ' + s.name + ' ' + s.teacher).toLowerCase().includes(q)));
    grid.innerHTML = list.length ? list.map((s, i) => `
      <button class="syl enter" style="animation-delay:${Math.min(i, 14) * 35}ms" data-code="${s.code}" data-cursor="Open" aria-label="${s.code} ${s.name}, open papers and topics">
        ${s.isNew ? '<span class="syl__new">NEW 2027</span>' : ''}
        <span class="syl__code">${s.code}</span>
        <span class="syl__name">${s.name}</span>
        <span class="syl__who">${s.lvl === 'O' ? 'O Level' : 'AS & A Level'} · ${s.teacher}</span><span class="glare"></span>
      </button>`).join('') : `<p class="syl-empty">No subject matches “${search.value}”. Try a code like 5054.</p>`;
  }
  function setSylLevel(l) { sylLvl = l; search.value = ''; segSelect(sylSeg, $(`[data-lvl="${l}"]`, sylSeg)); renderSyl(); }
  $$('button', sylSeg).forEach(b => b.addEventListener('click', () => setSylLevel(b.dataset.lvl)));
  search.addEventListener('input', renderSyl);
  renderSyl();

  const sheet = $('#sheet'), sheetBody = $('#sheetBody'); let lastFocus = null;
  grid.addEventListener('click', e => {
    const b = e.target.closest('.syl'); if (!b) return;
    const s = D.syllabus.find(x => x.code === b.dataset.code);
    lastFocus = b;
    sheetBody.innerHTML = `
      <p class="sh-code">CAMBRIDGE ${s.lvl === 'O' ? 'O LEVEL' : 'AS & A LEVEL'} · ${s.code}</p>
      <h3 class="sh-title" id="sheetTitle">${s.name}</h3>
      <div class="sh-meta"><span>Exams ${s.years}</span><span>June & November</span><span>${s.teacher}</span></div>
      <p class="sh-h">Papers</p>
      <div class="papers">${s.papers.map(p => `<div class="paper"><b>${p[0]}</b><span class="w">${p[3]}</span><small>${p[1]} · ${p[2]} marks</small></div>`).join('')}</div>
      <p class="sh-h">Topics</p>
      <ol class="topics">${s.topics.map(t => `<li>${t}</li>`).join('')}</ol>
      ${s.note ? `<p class="sh-note">${s.note}</p>` : ''}
      <div style="margin-top:28px;display:flex;gap:10px;flex-wrap:wrap">
        <a class="btn btn--red" href="https://wa.me/923111111827?text=${encodeURIComponent(`Hi, I'd like to join the ${s.name} (${s.code}) class.`)}" rel="noopener"><span>Join this class</span></a>
        <button class="btn btn--ghost" data-close><span>Close</span></button>
      </div>`;
    sheet.hidden = false; sheet.classList.remove('closing');
    lenis && lenis.stop(); document.body.style.overflow = 'hidden'; document.body.classList.add('is-locked');
    $('.sheet__close', sheet).focus();
  });
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.add('closing');
    setTimeout(() => { sheet.hidden = true; sheet.classList.remove('closing'); }, reduce ? 0 : 280);
    lenis && lenis.start(); document.body.style.overflow = ''; document.body.classList.remove('is-locked');
    lastFocus && lastFocus.focus({ preventScroll: true });
  }
  sheet.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSheet(); closeDrawer(); return; }
    if (e.key === 'Tab' && !sheet.hidden) {
      const f = $$('a[href],button:not([disabled])', sheet); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Thresholds ---------- */
  const bars = $('#bars'), barRows = $('#barRows'), tSeg = $('.thresh .seg');
  function renderBars(l) {
    bars.classList.remove('in');
    barRows.innerHTML = D.thresholds.filter(t => t.lvl === l).map(t => {
      const lab = r => r[0] === r[1] ? r[0] + '%' : r[0] + '–' + r[1] + '%';
      return `<div class="brow">
        <div class="brow__name"><span class="mono">${t.code}</span><span class="nm">${t.name}</span><span class="val">A* ${lab(t.astar)}</span></div>
        <div class="track" aria-label="${t.name}: A* ${lab(t.astar)}, A ${lab(t.a)}, C ${lab(t.c)}">
          <i class="ts" style="width:100%"></i>
          <i class="ta" style="width:${t.astar[0]}%"></i>
          <i class="tc" style="width:${t.a[0]}%"></i>
          <i class="tz" style="width:${t.c[0]}%"></i>
          <i class="range" style="left:${t.astar[0]}%;width:${t.astar[1] - t.astar[0]}%;transform:none"></i>
          <b style="left:calc(${t.astar[0]}% + 8px)">A* ${lab(t.astar)}</b>
        </div></div>`;
    }).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => barsSeen && bars.classList.add('in')));
  }
  let barsSeen = false;
  $$('button', tSeg).forEach(b => b.addEventListener('click', () => { segSelect(tSeg, b); renderBars(b.dataset.t); }));
  renderBars('O');

  /* ---------- Timetable ---------- */
  const tt = $('#ttTable'), ttSeg = $('.tt-tools .seg'); let ttLvl = 'O', ttDay = 'ALL';
  const dayLabel = { MW: 'Mon · Wed', TT: 'Tue · Thu', FS: 'Fri · Sat', SS: 'Sat · Sun', ON: 'Flexible' };
  function renderTT() {
    const rows = D.timetable[ttLvl].filter(r => ttDay === 'ALL' || r[2] === ttDay || (ttDay === 'ON' && r[4] === 'Online'));
    tt.innerHTML = `<div class="tr tr--head" role="row"><span role="columnheader">Subject</span><span role="columnheader">Teacher</span><span role="columnheader">Days</span><span role="columnheader">Time</span><span role="columnheader">Room</span></div>` +
      (rows.length ? rows.map((r, i) => `<div class="tr enter" role="row" style="animation-delay:${i * 30}ms">
        <span class="subj" role="cell">${r[0]}</span><span class="who" role="cell">${r[1]}</span>
        <span class="pillcell" role="cell"><span class="pill ${r[4] === 'Online' ? 'pill--on' : ''}">${dayLabel[r[2]]}</span></span>
        <span class="when" role="cell">${r[3].includes(' · ') ? r[3].split(' · ').map(x => x.replace(/^(Fri|Sat) /, '<em>$1</em>')).join('<br>') : r[3]}</span><span class="room" role="cell">${r[4]}</span></div>`).join('')
        : `<div class="tr" role="row"><span class="who" role="cell">No ${ttLvl} classes on these days. Try another day pair.</span></div>`);
  }
  $$('button', ttSeg).forEach(b => b.addEventListener('click', () => { segSelect(ttSeg, b); ttLvl = b.dataset.tt; renderTT(); }));
  $$('.day').forEach(b => b.addEventListener('click', () => { $$('.day').forEach(x => x.classList.toggle('is-on', x === b)); ttDay = b.dataset.d; renderTT(); }));
  renderTT();
  { const wd = new Date().getDay(); const key = { 1: 'MW', 3: 'MW', 2: 'TT', 4: 'TT', 5: 'FS', 6: 'FS' }[wd];
    const chip = key && $(`.day[data-d="${key}"]`); chip && chip.classList.add('is-today'); }

  /* ---------- Marquee: duplicate for seamless loop ---------- */
  $$('.marquee').forEach(m => {
    const t = $('.marquee__track', m); const c = t.cloneNode(true); c.setAttribute('aria-hidden', 'true'); m.appendChild(c);
    const w = t.scrollWidth; const speed = +m.dataset.speed || 40;
    m.style.setProperty('--marq', (w / speed).toFixed(1) + 's');
    $$('.marquee__track', m).forEach(x => x.style.setProperty('--marq', (w / speed).toFixed(1) + 's'));
  });

  /* ---------- Counters ---------- */
  const count = el => {
    const to = +el.dataset.to, dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1600;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* ---------- Reveal + one-shot triggers ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('in');
    if (el.classList.contains('count') && !reduce) count(el);
    if (el === bars) { barsSeen = true; }
    if (el.id === 'timeline') el.style.setProperty('--tlp', 1);
    io.unobserve(el);
  }), { rootMargin: '0px 0px -12% 0px', threshold: .12 });
  $$('.count, #bars, #timeline, .ibcc__card').forEach(el => io.observe(el));

  /* ---------- Pointer effects (desktop only) ---------- */
  if (fine && !reduce) {
    document.addEventListener('pointermove', e => {
      const s = e.target.closest && e.target.closest('.spot'); if (!s) return;
      const r = s.getBoundingClientRect();
      s.style.setProperty('--mx', (e.clientX - r.left) + 'px'); s.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    // cursor ring
    const cur = $('.cursor'), curLabel = $('.cursor__label'); let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.remove('is-out');
      const t = e.target, lab = t.closest('[data-cursor]');
      cur.classList.toggle('has-label', !!lab); if (lab) curLabel.textContent = lab.dataset.cursor;
      cur.classList.toggle('is-hover', !lab && !!t.closest('a,button,label.search'));
      cur.classList.toggle('is-text', !!t.closest('input')); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.add('is-out'));
    (function loop() { cx += (tx - cx) * .32; cy += (ty - cy) * .32; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    // syllabus tile tilt + glare
    grid.addEventListener('pointermove', e => { const c = e.target.closest('.syl'); if (!c) return; const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%');
      c.style.transform = `perspective(700px) rotateY(${(x - .5) * 8}deg) rotateX(${(.5 - y) * 8}deg)`; });
    grid.addEventListener('pointerout', e => { const c = e.target.closest('.syl'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
    // hero light follows pointer
    const glowA = $('.hero__glow--a'), glowB = $('.hero__glow--b');
    $('.hero').addEventListener('pointermove', e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      glowA.style.translate = `${x * 60}px ${y * 40}px`; glowB.style.translate = `${-x * 50}px ${-y * 30}px`; });
    // hero medal tilt
    const stage = $('.hero__stage'), medal = $('.medal');
    if (stage) {
      $('.hero').addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
        medal.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
      });
      $('.hero').addEventListener('pointerleave', () => medal.style.transform = '');
    }
    // magnetic buttons
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
  }

  /* ---------- GSAP scroll scenes ---------- */
  window.addEventListener('load', () => {
    placeAll();
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) { lenis.on('scroll', ScrollTrigger.update); }

    // hero parallax
    gsap.to('.hero__glow--a', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__stage', { yPercent: 18, scale: .92, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__grid', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // pinned horizontal programs (desktop)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const rail = $('.programs__rail'), bar = $('.programs__bar i');
      const dist = () => Math.max(0, rail.scrollWidth - innerWidth);
      if (dist() < 40) return;
      gsap.to('.programs__crest', { xPercent: -18, rotate: -6, ease: 'none', scrollTrigger: { trigger: '.programs', start: 'top top', end: () => '+=' + dist(), scrub: 1 } });
      gsap.to(rail, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.programs', start: 'top top', end: () => '+=' + dist(), pin: '.programs__pin', scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: st => bar && (bar.style.transform = `scaleX(${st.progress})`) } });
    });

    // footer motto rise
    gsap.fromTo('.foot__motto', { yPercent: 25, letterSpacing: '0em' }, { yPercent: 0, letterSpacing: '-0.045em', ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 30%', scrub: true } });
    ScrollTrigger.refresh();
  });
})();
