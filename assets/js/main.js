/* The Classroom — interactions */
(() => {
  performance.mark('tcr:main');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, D = window.TCR;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const WA = '923111111827';
  const wa = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  if (!RM) root.classList.add('js-motion');
  $('#yr').textContent = new Date().getFullYear();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ================= THEME (two options, remembered) ================= */
  const themeBtns = $$('[data-theme-set]');
  function setTheme(t, save) {
    root.dataset.theme = t;
    themeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === t)));
    $('meta[name="theme-color"]').content = t === 'dark' ? '#0b0f1c' : '#fdfbf8';
    window.TCRGL && TCRGL.setTheme(t);
    if (save) try { localStorage.setItem('tcr-theme', t); } catch (e) {}
  }
  setTheme(root.dataset.theme || 'light');
  themeBtns.forEach(b => b.addEventListener('click', () => setTheme(b.dataset.themeSet, true)));

  /* ================= SMOOTH SCROLL (Lenis on the GSAP ticker) ================= */
  let lenis = null;
  if (!RM && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: x => 1 - Math.pow(1 - x, 4), smoothWheel: true, wheelMultiplier: .95 });
    if (G) { G.ticker.add(time => lenis.raf(time * 1000)); G.ticker.lagSmoothing(0); }
    else { const raf = tm => { lenis.raf(tm); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
    if (ST) lenis.on('scroll', ST.update);
  }
  const lock = on => { if (lenis) on ? lenis.stop() : lenis.start(); document.body.style.overflow = on ? 'hidden' : ''; document.body.classList.toggle('is-locked', !!on); };
  const scrollTo = el => lenis ? lenis.scrollTo(el, { offset: -90, duration: 1.3 }) : el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault(); closeMenu(); closePalette();
    if (a.dataset.lvl) setSylLevel(a.dataset.lvl);
    scrollTo(t);
  });

  /* ================= SPLIT TEXT (headings rise word by word) ================= */
  function splitWords(el) {
    if (el.dataset.split) return; el.dataset.split = '1';
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            const o = document.createElement('span'); o.className = 'sw';
            const i = document.createElement('span'); i.textContent = w; o.appendChild(i); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'svg' && !n.classList.contains('hl')) walk(n);
        else if (n.nodeType === 1 && n.classList.contains('hl')) { // keep the highlight word intact, wrap it whole
          const o = document.createElement('span'); o.className = 'sw'; n.replaceWith(o); const i = document.createElement('span'); i.appendChild(n); o.appendChild(i);
        }
      });
    };
    walk(el);
  }

  /* ================= PRELOADER — CLASSROOM rises, fills, dive through the L ================= */
  function loader() {
    const on = root.classList.contains('ld-on');
    const parts = $$('.ldx-fill,.ldx-ink,.ldx-m');
    const kill = () => { parts.forEach(p => p.remove()); root.classList.remove('ld-on'); };
    try { sessionStorage.setItem('tcr-seen', '1'); } catch (e) {}
    if (!on || RM || !G) { kill(); performance.mark('tcr:usable'); return Promise.resolve(false); }
    lock(true); window.scrollTo(0, 0);
    const fill = $('.ldx-fill'), ink = $('.ldx-ink'), gold = $('.ldx-gold'), N = $('#ldN');
    const L = $$('.ldx-ink .ldx-w i'), sub = $$('.ldx-s span'), metas = $$('.ldx-m');
    G.set(L, { yPercent: 118 }); G.set(sub, { yPercent: 120 }); G.set(metas, { autoAlpha: 0, y: 10 });
    G.set(['.nav', '.dock', '.mbar', '.announce'], { autoAlpha: 0 });
    // hero is staged under the curtain so it can rise as the camera lands
    const ht = $('.hero__title'); splitWords(ht);
    const hw = $$('.sw>span', ht), hb = ['.hero__motto', '.hero__lede', '.hero__actions', '.find', '.hero__stage', '.hstats'];
    G.set(hw, { yPercent: 112 }); G.set(hb, { y: 34, autoAlpha: 0 });
    const st = { lv: 0, ps: 1.32 };
    const paint = () => { gold.style.setProperty('--lv', st.lv.toFixed(2)); gold.style.setProperty('--ps', st.ps.toFixed(3)); fill.querySelector('.ldx-crest').style.setProperty('--lv', st.lv.toFixed(2)); N.textContent = String(Math.round(st.lv)).padStart(3, '0'); };
    const fonts = Promise.race([document.fonts && document.fonts.load ? document.fonts.load('800 100px "Geist"') : Promise.resolve(), new Promise(r => setTimeout(r, 450))]);
    const frames = new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    performance.mark('tcr:loader-wait');
    return Promise.all([fonts, frames]).then(() => new Promise(res => {
      performance.mark('tcr:loader-play');
      const E = 'expo.out';
      const skip = () => tl.timeScale(3.2);
      const tl = G.timeline({ onComplete: () => { kill(); removeEventListener('keydown', skip); } })
        .to(metas, { autoAlpha: 1, y: 0, duration: .5, ease: E, stagger: .04 }, 0)
        .to(L, { yPercent: 0, duration: .75, ease: E, stagger: .035 }, .02)
        .to(sub, { yPercent: 0, duration: .6, ease: E }, .3)
        .to(st, { lv: 100, duration: .82, ease: 'power2.inOut', onUpdate: paint }, .1)
        .to(st, { ps: 1.06, duration: 1.4, ease: 'power1.inOut', onUpdate: paint }, 0)
        .add(() => {
          const I = $('.ldx-ink .ldx-i').getBoundingClientRect();
          const o = (I.left + I.width * .26) + 'px ' + (I.top + I.height * .5) + 'px'; // the stem of the L
          G.set([ink, fill], { transformOrigin: o });
        }, .94)
        .to(metas, { autoAlpha: 0, y: -8, duration: .22, ease: 'power2.in' }, .94)
        .to([ink, fill], { scale: 70, duration: .72, ease: 'expo.in' }, .96)
        .to(fill, { opacity: 0, duration: .26, ease: 'power2.in' }, 1.14)
        .add(() => { lock(false); performance.mark('tcr:usable'); res(true); }, 1.2)
        .to(hw, { yPercent: 0, duration: 1, ease: E, stagger: .05 }, 1.16)
        .to(hb, { y: 0, autoAlpha: 1, duration: .9, ease: E, stagger: .05, clearProps: 'transform,opacity,visibility' }, 1.24)
        .to(['.nav', '.dock', '.mbar', '.announce'], { autoAlpha: 1, duration: .6, ease: 'power2.out', clearProps: 'opacity,visibility' }, 1.26)
        .set(ink, { autoAlpha: 0 }, 1.7);
      tl.timeScale(1.28);
      fill.addEventListener('click', skip); ink.addEventListener('click', skip); addEventListener('keydown', skip, { once: true });
    }));
  }

  /* ================= ANNOUNCEMENT + COUNTDOWNS ================= */
  const announce = $('#announce');
  const days = iso => Math.max(0, Math.ceil((new Date(iso) - Date.now()) / 864e5));
  const dA = days('2027-01-07T00:00:00+05:00'), dO = days('2027-01-14T00:00:00+05:00');
  $('#announceCount').textContent = dA > 0 ? `${dA} days to go` : 'Results are out';
  $('#cdA').textContent = dA; $('#cdO').textContent = dO;
  try { if (sessionStorage.getItem('tcr-ann')) { announce.classList.add('is-gone'); root.classList.add('announce-off'); } } catch (e) {}
  $('.announce__x').addEventListener('click', () => { announce.classList.add('is-gone'); root.classList.add('announce-off'); try { sessionStorage.setItem('tcr-ann', '1'); } catch (e) {} });

  // open-now badge (Karachi time, Mon–Sat 10 AM – 9 PM)
  (() => {
    const el = $('#openNow'); if (!el) return;
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
    const wd = parts.find(p => p.type === 'weekday').value, h = +parts.find(p => p.type === 'hour').value;
    const open = wd !== 'Sun' && h >= 10 && h < 21;
    el.textContent = open ? 'Open now' : 'Closed now'; el.classList.add(open ? 'is-open' : 'is-closed');
  })();

  /* ================= NAV ================= */
  const nav = $('#nav'); let lastY = 0;
  const railEl = $('.rail'), railFill = $('.rail__fill'), railMarks = $$('.rail span');
  const prog = $('.progress i'), topBtn = $('.dock__top'), floor = $('.backdrop__floor');
  const onScroll = () => {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, y / max) : 0;
    nav.classList.toggle('is-scrolled', y > 30);
    nav.classList.toggle('is-hidden', y > 700 && y > lastY + 4 && !menuOpen);
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
    prog.style.transform = `scaleX(${p})`;
    floor && floor.style.setProperty('--floor', (y * .35 % 80).toFixed(1) + 'px');
    railEl.classList.toggle('show', y > innerHeight * .6);
    railFill.style.setProperty('--p', p.toFixed(3));
    railMarks.forEach((m, i) => m.classList.toggle('on', p >= i / (railMarks.length - 1) - .02));
    topBtn.classList.toggle('show', y > innerHeight);
    topBtn.style.setProperty('--rp', (1 - p).toFixed(3));
    maybePromo(p);
  };
  addEventListener('scroll', onScroll, { passive: true });
  topBtn.addEventListener('click', () => lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo(document.body));

  const links = $$('.nav__links a'), ind = $('.nav__ind'); let hovered = null;
  const moveInd = a => { if (!a) { ind.style.opacity = 0; return; } ind.style.opacity = 1; ind.style.width = a.offsetWidth + 'px'; ind.style.transform = `translateX(${a.offsetLeft}px)`; };
  links.forEach(a => a.addEventListener('pointerenter', () => { hovered = a; moveInd(a); }));
  $('.nav__links').addEventListener('pointerleave', () => { hovered = null; moveInd(null); });
  const navIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => navIO.observe(s));

  // small dropdown menu
  const burger = $('.nav__burger'), menu = $('#menu'); let menuOpen = false;
  function openMenu() { menuOpen = true; const r = $('.nav__pill').getBoundingClientRect(); menu.style.setProperty('--menu-top', (r.bottom + 10) + 'px'); menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); $('a', menu).focus({ preventScroll: true }); }
  function closeMenu(focus) { if (!menuOpen) return; menuOpen = false; menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); if (focus) burger.focus({ preventScroll: true }); }
  burger.addEventListener('click', e => { e.stopPropagation(); menuOpen ? closeMenu() : openMenu(); });
  document.addEventListener('click', e => { if (menuOpen && !menu.contains(e.target) && e.target !== burger) closeMenu(); });

  /* ================= SEGMENTED CONTROLS ================= */
  function placeThumb(seg) { const on = $('[aria-pressed="true"]', seg), th = $('.seg__thumb', seg); if (!on || !th) return; th.style.width = on.offsetWidth + 'px'; th.style.transform = `translateX(${on.offsetLeft}px)`; }
  function segSelect(seg, btn) { $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String(b === btn))); placeThumb(seg); }
  const placeAll = () => $$('.seg').forEach(placeThumb);
  addEventListener('resize', placeAll); document.fonts && document.fonts.ready.then(placeAll);

  /* ================= SYLLABUS EXPLORER ================= */
  const grid = $('#sylGrid'), search = $('#sylSearch'), sylSeg = $('.syl-tools .seg'); let sylLvl = 'O';
  const ICO = 'assets/img/icons.svg#';
  const subjIcon = n => { n = n.toLowerCase();
    return /additional|add maths/.test(n) ? 's-addmath' : /math/.test(n) ? 's-math' : /physics/.test(n) ? 's-physics' : /chem/.test(n) ? 's-chem' : /bio/.test(n) ? 's-bio'
      : /computer/.test(n) ? 's-cs' : /account/.test(n) ? 's-acc' : /business/.test(n) ? 's-bus' : /econ/.test(n) ? 's-eco' : /pakistan/.test(n) ? 's-pak'
      : /islam/.test(n) ? 's-isl' : /urdu/.test(n) ? 's-urdu' : /english/.test(n) ? 's-eng' : /psych/.test(n) ? 's-psy' : /socio/.test(n) ? 's-soc' : 's-uni'; };
  const ic = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="${ICO}${id}"/></svg>`;
  function renderSyl() {
    const q = search.value.trim().toLowerCase();
    const list = D.syllabus.filter(s => (q ? true : s.lvl === sylLvl) && (!q || (s.code + ' ' + s.name + ' ' + s.teacher).toLowerCase().includes(q)));
    grid.innerHTML = list.length ? list.map((s, i) => `
      <button class="syl enter" style="animation-delay:${Math.min(i, 14) * 35}ms" data-code="${s.code}" data-cursor="Open" aria-label="${s.code} ${esc(s.name)}, open papers and topics">
        ${s.isNew ? '<span class="syl__new">NEW 2027</span>' : ''}
        <span class="syl__ic">${ic(subjIcon(s.name))}</span>
        <span class="syl__code">${s.code} · ${s.lvl === 'O' ? 'O Level' : 'AS & A'}</span><span class="syl__name">${esc(s.name)}</span>
        <span class="syl__meta"><span class="syl__who">${esc(s.teacher)}</span><span class="syl__go">${ic('arrow-ur')}</span></span>
      </button>`).join('') : `<p class="syl-empty">No subject matches “${esc(search.value)}”. Try a code like 5054.</p>`;
  }
  function setSylLevel(l) { sylLvl = l; search.value = ''; segSelect(sylSeg, $(`[data-lvl="${l}"]`, sylSeg)); renderSyl(); }
  $$('button', sylSeg).forEach(b => b.addEventListener('click', () => setSylLevel(b.dataset.lvl)));
  search.addEventListener('input', renderSyl); renderSyl();
  addEventListener('keydown', e => { if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); } });

  const sheet = $('#sheet'), sheetBody = $('#sheetBody'); let lastFocus = null;
  function openSyl(code, from) {
    const s = D.syllabus.find(x => x.code === code); if (!s) return;
    lastFocus = from || document.activeElement;
    sheetBody.innerHTML = `
      <p class="sh-code">CAMBRIDGE ${s.lvl === 'O' ? 'O LEVEL' : 'AS & A LEVEL'} · ${s.code}</p>
      <h3 class="sh-title" id="sheetTitle">${esc(s.name)}</h3>
      <div class="sh-meta"><span>Exams ${s.years}</span><span>June &amp; November</span><span>${esc(s.teacher)}</span></div>
      <p class="sh-h">Papers</p>
      <div class="papers">${s.papers.map(p => `<div class="paper"><b>${esc(p[0])}</b><span class="w">${p[3]}</span><small>${p[1]} · ${p[2]} marks</small></div>`).join('')}</div>
      <p class="sh-h">Topics</p>
      <ol class="topics">${s.topics.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
      ${s.note ? `<p class="sh-note">${esc(s.note)}</p>` : ''}
      <div class="sh-actions"><button class="btn btn--primary" data-book data-book-level="${s.lvl === 'O' ? 'O' : 'AS'}" data-book-subject="${esc(s.name.replace(/ \(.*\)/, '').replace(' (Syllabus D)', ''))}"><span>Reserve this class</span><svg class="i"><use href="assets/img/icons.svg#arrow"/></svg></button><button class="btn btn--outline" data-close><span>Close</span></button></div>`;
    sheet.hidden = false; sheet.classList.remove('closing'); lock(true);
    $('.sheet__close', sheet).focus();
  }
  function closeSheet() {
    if (sheet.hidden) return; sheet.classList.add('closing');
    setTimeout(() => { sheet.hidden = true; sheet.classList.remove('closing'); }, RM ? 0 : 280);
    lock(false); lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  grid.addEventListener('click', e => { const b = e.target.closest('.syl'); if (b) openSyl(b.dataset.code, b); });
  sheet.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });

  /* ================= THRESHOLDS ================= */
  const bars = $('#bars'), barRows = $('#barRows'), tSeg = $('.thresh .seg'); let barsSeen = false;
  const lab = r => r[0] === r[1] ? r[0] + '%' : r[0] + '–' + r[1] + '%';
  function renderBars(l) {
    bars.classList.remove('in');
    barRows.innerHTML = D.thresholds.filter(t => t.lvl === l).map(t => `<div class="brow">
      <div class="brow__name"><span class="mono">${t.code}</span><span class="nm">${t.name}</span><span class="val">A* ${lab(t.astar)}</span></div>
      <div class="track" role="img" aria-label="${t.name}: A* ${lab(t.astar)}, A ${lab(t.a)}, C ${lab(t.c)}">
        <i class="ts" style="width:100%"></i><i class="ta" style="width:${t.astar[0]}%"></i><i class="tc" style="width:${t.a[0]}%"></i><i class="tz" style="width:${t.c[0]}%"></i>
        <i class="range" style="left:${t.astar[0]}%;width:${t.astar[1] - t.astar[0]}%;transform:none"></i>
        <b style="left:calc(${t.astar[0]}% + 8px)">A* ${lab(t.astar)}</b></div></div>`).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => barsSeen && bars.classList.add('in')));
  }
  $$('button', tSeg).forEach(b => b.addEventListener('click', () => { segSelect(tSeg, b); renderBars(b.dataset.t); }));
  renderBars('O');

  /* ================= GRADE CALCULATOR (3D flip) ================= */
  const cSel = $('#calcSubject'), cMark = $('#calcMark'), cOut = $('#calcOut');
  const flip = $('#calcFlip'), gF = $('#calcGrade'), gB = $('#calcGradeB'), verdict = $('#calcVerdict'), ctrack = $('#calcTrack'), legend = $('#calcLegend');
  cSel.innerHTML = ['O', 'A'].map(l => `<optgroup label="${l === 'O' ? 'O Level' : 'A Level'}">${D.thresholds.filter(t => t.lvl === l).map(t => `<option value="${t.lvl}${t.code}">${t.code} · ${t.name}</option>`).join('')}</optgroup>`).join('');
  let shown = null, face = 'f';
  function calc() {
    const t = D.thresholds.find(x => x.lvl + x.code === cSel.value), m = +cMark.value;
    cOut.textContent = m + '%'; cMark.style.setProperty('--v', m + '%');
    let g, msg, sub;
    if (m >= t.astar[1]) { g = 'A*'; msg = `Comfortably above the A* line.`; sub = `June 2026 A* needed ${lab(t.astar)}.`; }
    else if (m >= t.astar[0]) { g = 'A*'; msg = `A* on some paper variants, A on others.`; sub = `A* ranged ${lab(t.astar)} across variants.`; }
    else if (m >= t.a[1]) { g = 'A'; msg = `A solid A. ${t.astar[0] - m} more marks for an A*.`; sub = `A needed ${lab(t.a)}; A* from ${t.astar[0]}%.`; }
    else if (m >= t.a[0]) { g = 'A'; msg = `A on some variants, B on others.`; sub = `A ranged ${lab(t.a)}.`; }
    else if (m >= t.c[1]) { g = 'B'; msg = `Between C and A, most likely a B.`; sub = `Cambridge publishes A and C here; B sits between ${t.c[1]}% and ${t.a[0]}%.`; }
    else if (m >= t.c[0]) { g = 'C'; msg = `Around the C line on some variants.`; sub = `C ranged ${lab(t.c)}.`; }
    else { g = '—'; msg = `Below the C line.`; sub = `C needed ${lab(t.c)}. A tutor can close that gap.`; }
    verdict.innerHTML = `${msg}<small>${sub}</small>`;
    ctrack.style.cssText = `--c:${t.c[0]}%;--a:${t.a[0]}%;--s:${t.astar[0]}%`;
    $('#calcPin').style.setProperty('--m', m + '%');
    legend.innerHTML = `<div><dt>A*</dt><dd>${lab(t.astar)}</dd></div><div><dt>A</dt><dd>${lab(t.a)}</dd></div><div><dt>C</dt><dd>${lab(t.c)}</dd></div>`;
    if (g !== shown) {
      const next = face === 'f' ? gB : gF; next.textContent = g; next.dataset.g = g;
      if (shown === null) { gF.textContent = g; gF.dataset.g = g; }
      else { face = face === 'f' ? 'b' : 'f'; flip.classList.toggle('is-b', face === 'b'); }
      shown = g;
    }
  }
  cSel.value = 'O5054'; cSel.addEventListener('change', calc); cMark.addEventListener('input', calc); calc();

  /* ================= TIMETABLE ================= */
  const tt = $('#ttTable'), ttSeg = $('.tt-tools .seg'); let ttLvl = 'O', ttDay = 'ALL';
  const dayLabel = { MW: 'Mon · Wed', TT: 'Tue · Thu', FS: 'Fri · Sat', SS: 'Sat · Sun', ON: 'Flexible' };
  function renderTT() {
    const rows = D.timetable[ttLvl].filter(r => ttDay === 'ALL' || r[2] === ttDay || (ttDay === 'ON' && r[4] === 'Online'));
    tt.innerHTML = `<div class="tr tr--head" role="row"><span role="columnheader">Subject</span><span role="columnheader">Teacher</span><span role="columnheader">Days</span><span role="columnheader">Time</span><span role="columnheader">Room</span><span role="columnheader"><span class="sr">Action</span></span></div>` +
      (rows.length ? rows.map((r, i) => `<div class="tr enter" role="row" style="animation-delay:${i * 28}ms">
        <span class="subj" role="cell">${ic(subjIcon(r[0]))}${r[0]}</span><span class="who" role="cell">${r[1]}</span>
        <span class="pillcell" role="cell"><span class="pill ${r[4] === 'Online' ? 'pill--on' : ''}">${dayLabel[r[2]]}</span></span>
        <span class="when" role="cell">${r[3].includes(' · ') ? r[3].split(' · ').map(x => x.replace(/^(Fri|Sat) /, '<em>$1</em>')).join('<br>') : r[3]}</span>
        <span class="room" role="cell">${r[4]}</span>
        <span class="act" role="cell"><button class="btn btn--outline btn--sm" data-book data-book-level="${ttLvl}" data-book-subject="${r[0]}"><span>Reserve</span></button></span></div>`).join('')
        : `<div class="tr" role="row"><span class="who" role="cell">No ${ttLvl} classes on these days. Try another day pair.</span></div>`);
  }
  $$('button', ttSeg).forEach(b => b.addEventListener('click', () => { segSelect(ttSeg, b); ttLvl = b.dataset.tt; renderTT(); }));
  $$('.day').forEach(b => b.addEventListener('click', () => { $$('.day').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); ttDay = b.dataset.d; renderTT(); }));
  renderTT();
  { const key = { 1: 'MW', 3: 'MW', 2: 'TT', 4: 'TT', 5: 'FS', 6: 'FS' }[new Date().getDay()]; const c = key && $(`.day[data-d="${key}"]`); c && c.classList.add('is-today'); }

  /* ================= WEEK BARS (live from timetable) ================= */
  (() => {
    const map = { MW: [0, 2], TT: [1, 3], FS: [4, 5], SS: [5, 6] }, cnt = [0, 0, 0, 0, 0, 0, 0];
    Object.values(D.timetable).flat().forEach(r => (map[r[2]] || []).forEach(d => cnt[d]++));
    const max = Math.max(...cnt), names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    $('#weekBars').innerHTML = cnt.map((n, i) => `<div><i style="--h:${Math.max(8, n / max * 100)}%" data-n="${n}" class="${n === max ? 'peak' : ''}${i === 6 ? ' online' : ''}"></i><span>${names[i]}</span></div>`).join('');
  })();

  /* ================= MARQUEE ================= */
  const idle = (f, timeout = 600) => (window.requestIdleCallback || (g => setTimeout(g, 1)))(f, { timeout });
  idle(() => $$('.marquee').forEach(m => {
    const t = $('.marquee__track', m), c = t.cloneNode(true); c.setAttribute('aria-hidden', 'true'); m.appendChild(c);
    const d = (t.scrollWidth / (+m.dataset.speed || 40)).toFixed(1) + 's';
    $$('.marquee__track', m).forEach(x => x.style.setProperty('--marq', d));
  }));

  /* ================= BOOKING MODAL (3 steps → WhatsApp) ================= */
  const book = $('#book'), form = $('#bookForm'), steps = $$('.step', form), dots = $$('.modal__steps li', book);
  const next = $('#bookNext'), back = $('#bookBack'), hint = $('#bookHint'), stepLabel = $('#bookStepLabel');
  const chipsEl = $('#subjChips'); let step = 1, bookFrom = null, pre = {};
  const subjectsFor = l => [...new Set(D.timetable[l].map(r => r[0]))];
  function renderChips() {
    const l = form.level.value; if (!l) return;
    chipsEl.innerHTML = subjectsFor(l).map(s => `<label><input type="checkbox" name="subj" value="${s}" ${pre.subject && s === pre.subject ? 'checked' : ''}><span>${s}</span></label>`).join('');
  }
  function sel() { return $$('input[name=subj]:checked', form).map(i => i.value); }
  function validStep() {
    if (step === 1) return !!form.level.value;
    if (step === 2) return sel().length > 0;
    return true;
  }
  function paintStep() {
    steps.forEach(s => s.classList.toggle('is-on', +s.dataset.step === step));
    dots.forEach((d, i) => { d.classList.toggle('is-on', i === step - 1); d.classList.toggle('is-done', i < step - 1); });
    stepLabel.textContent = `Step ${step} of 3`; back.hidden = step === 1;
    next.querySelector('span').textContent = step === 3 ? 'Send on WhatsApp' : 'Continue';
    next.disabled = !validStep();
    hint.textContent = step === 1 ? 'Choose one to continue.' : step === 2 ? `${sel().length || 'No'} subject${sel().length === 1 ? '' : 's'} selected` : 'Opens WhatsApp with your request.';
    $('#subjCount').textContent = step === 2 ? `· ${D.timetable[form.level.value] ? subjectsFor(form.level.value).length : 0} on the timetable` : '';
    if (step === 3) {
      const lv = { O: 'O Level', AS: 'AS Level', A2: 'A2 Level' }[form.level.value];
      $('#bookSummary').innerHTML = `<b>${lv}</b> · ${sel().join(', ')}`;
    }
  }
  function openBook(trigger) {
    bookFrom = trigger || document.activeElement; form.reset(); pre = {};
    const lvl = trigger && trigger.dataset.bookLevel, subj = trigger && trigger.dataset.bookSubject;
    if (subj) pre.subject = subj.replace('Additional Mathematics', 'Additional Maths');
    step = 1;
    if (lvl && D.timetable[lvl]) { form.level.value = lvl; renderChips(); step = 2; }
    else if (subj) { // guess the level from the timetable
      const l = ['O', 'AS', 'A2'].find(k => D.timetable[k].some(r => r[0] === pre.subject));
      if (l) { form.level.value = l; renderChips(); step = 2; }
    }
    $$('.field', form).forEach(f => f.classList.remove('is-err'));
    book.hidden = false; book.classList.remove('closing'); closeMenu(); closeBot(); hidePromo(true); lock(true);
    paintStep(); setTimeout(() => (step === 1 ? $('input[name=level]', form) : $('input[name=subj]', form) || next).focus(), 60);
  }
  function closeBook() {
    if (book.hidden) return; book.classList.add('closing');
    setTimeout(() => { book.hidden = true; book.classList.remove('closing'); }, RM ? 0 : 260);
    if (sheet.hidden) lock(false); bookFrom && bookFrom.focus && bookFrom.focus({ preventScroll: true });
  }
  form.addEventListener('change', e => { if (e.target.name === 'level') { pre = {}; renderChips(); } paintStep(); });
  back.addEventListener('click', () => { step = Math.max(1, step - 1); paintStep(); });
  next.addEventListener('click', () => {
    if (step < 3) { step++; paintStep(); setTimeout(() => (step === 2 ? $('input[name=subj]', form) : $('#fName')).focus(), 60); return; }
    const name = $('#fName'), phone = $('#fPhone');
    const okName = name.value.trim().length > 1, okPhone = /^(\+?92|0)?3\d{2}[\s-]?\d{7}$/.test(phone.value.replace(/\s+/g, ''));
    name.closest('.field').classList.toggle('is-err', !okName); phone.closest('.field').classList.toggle('is-err', !okPhone);
    if (!okName) return name.focus(); if (!okPhone) return phone.focus();
    const lv = { O: 'O Level', AS: 'AS Level', A2: 'A2 Level' }[form.level.value];
    const msg = `Assalam o Alaikum, I'd like to reserve a seat at The Classroom.\n\nStudent: ${name.value.trim()}\nPhone: ${phone.value.trim()}\nLevel: ${lv}\nSubjects: ${sel().join(', ')}` + (form.school.value.trim() ? `\nSchool: ${form.school.value.trim()}` : '');
    window.open(wa(msg), '_blank', 'noopener');
    closeBook();
  });
  form.addEventListener('submit', e => { e.preventDefault(); next.click(); });
  book.addEventListener('click', e => { if (e.target.closest('[data-book-close]')) closeBook(); });
  document.addEventListener('click', e => { const b = e.target.closest('[data-book]'); if (!b) return; e.preventDefault(); if (!sheet.hidden) closeSheet(); openBook(b); });

  /* ================= SIDE ADMISSIONS CARD ================= */
  const promo = $('#promo'); let promoState = 'idle';
  const promoBlocked = () => { try { return +localStorage.getItem('tcr-promo') > Date.now(); } catch (e) { return false; } };
  function showPromo() { if (promoState !== 'idle' || promoBlocked() || !book.hidden || root.classList.contains('ld-on')) return; promoState = 'shown'; promo.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => promo.classList.add('show'))); }
  function hidePromo(remember) { if (promoState !== 'shown') { if (remember) promoState = 'done'; return; } promoState = 'done'; promo.classList.remove('show'); setTimeout(() => promo.hidden = true, 800); if (remember) try { localStorage.setItem('tcr-promo', Date.now() + 3 * 864e5); } catch (e) {} }
  function maybePromo(p) { if (p > .42) showPromo(); }
  setTimeout(showPromo, 32000);
  $('.promo__x').addEventListener('click', () => hidePromo(true));

  /* ================= COMMAND PALETTE ================= */
  const pal = $('#palette'), palIn = $('#palInput'), palList = $('#palList'); let palItems = [], palIdx = 0, palFrom = null;
  const INDEX = [
    ...[['Programs', '#programs'], ['Syllabus library', '#syllabus'], ['Grade calculator', '#grades'], ['Timetable', '#timetable'], ['Faculty', '#faculty'], ['Exam calendar', '#calendar'], ['FAQ', '#faq'], ['Visit & directions', '#visit']].map(([t, h]) => ({ k: 'Section', t, sub: '', run: () => scrollTo($(h)) })),
    ...D.syllabus.map(s => ({ k: s.code, t: s.name, sub: (s.lvl === 'O' ? 'O Level' : 'AS & A Level') + ' · ' + s.teacher, run: () => openSyl(s.code) })),
    ...[...new Set(Object.values(D.timetable).flat().map(r => r[1]))].map(n => ({ k: 'Teacher', t: n, sub: [...new Set(Object.values(D.timetable).flat().filter(r => r[1] === n).map(r => r[0]))].join(', '), run: () => { closePalette(); openBot(); ask(n); } })),
    { k: 'Action', t: 'Reserve a seat', sub: 'Three quick steps', run: () => openBook() },
    { k: 'Action', t: 'Ask TCR', sub: 'Instant answers from the timetable', run: () => openBot() }
  ];
  function renderPal() {
    const q = palIn.value.trim().toLowerCase();
    palItems = (q ? INDEX.filter(i => (i.k + ' ' + i.t + ' ' + i.sub).toLowerCase().includes(q)) : INDEX.slice(0, 9)).slice(0, 40);
    palIdx = 0;
    palList.innerHTML = palItems.length ? palItems.map((it, i) => `<li role="option" aria-selected="${i === 0}" data-i="${i}"><span class="pk">${esc(it.k)}</span><span class="pt">${esc(it.t)}${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span><span class="pe">↵</span></li>`).join('') : `<li aria-selected="false"><span class="pt">Nothing found for “${esc(palIn.value)}”</span></li>`;
  }
  function openPalette(q) { palFrom = document.activeElement; pal.hidden = false; palIn.value = typeof q === 'string' ? q : ''; renderPal(); lock(true); palIn.focus({ preventScroll: true }); palIn.setSelectionRange(palIn.value.length, palIn.value.length); }
  function closePalette() { if (pal.hidden) return; pal.hidden = true; if (book.hidden && sheet.hidden) lock(false); palFrom && palFrom.focus && palFrom.focus({ preventScroll: true }); }
  const runPal = i => { const it = palItems[i]; if (!it) return; closePalette(); it.run(); };
  palIn.addEventListener('input', renderPal);
  palIn.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); palIdx = (palIdx + (e.key === 'ArrowDown' ? 1 : -1) + palItems.length) % palItems.length; $$('li', palList).forEach((l, i) => l.setAttribute('aria-selected', String(i === palIdx))); $$('li', palList)[palIdx].scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { e.preventDefault(); runPal(palIdx); }
  });
  palList.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) runPal(+li.dataset.i); });
  pal.addEventListener('click', e => { if (e.target.closest('[data-palette-close]')) closePalette(); });
  $$('[data-palette]').forEach(b => b.addEventListener('click', () => openPalette()));

  /* ================= HERO: find bar, level jump, live next class ================= */
  const findForm = $('#heroFind'), findIn = $('#heroFindIn'), findBar = $('.find__bar');
  findIn.addEventListener('input', () => { const v = findIn.value; if (!v.trim()) return; findIn.value = ''; if (pal.hidden) openPalette(v); else { palIn.value += v; renderPal(); palIn.focus(); } });
  findForm.addEventListener('submit', e => { e.preventDefault(); openPalette(findIn.value); findIn.value = ''; });
  // rotating placeholder: real things students search for
  (() => {
    const tips = ['Try “Physics”', 'Try “9709”', 'Try “Sir Yawar Abbas”', 'Try “Accounting”', 'Try “5054”', 'Try “Grade calculator”'];
    let k = 0; if (RM) return;
    setInterval(() => { if (document.activeElement === findIn) return; findBar.classList.add('swap'); setTimeout(() => { k = (k + 1) % tips.length; findIn.placeholder = tips[k]; findBar.classList.remove('swap'); }, 260); }, 2600);
  })();
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => {
    const l = b.dataset.jump; segSelect(ttSeg, $(`[data-tt="${l}"]`, ttSeg)); ttLvl = l; renderTT(); scrollTo($('#timetable'));
  }));
  // next class: parse the published timetable against Karachi time
  (() => {
    const DAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const days = { MW: [1, 3], TT: [2, 4], FS: [5, 6], SS: [6, 0] };
    const toMin = t => { let [h, m] = t.split(':').map(Number); if (h < 12) h += 12; return h * 60 + (m || 0); }; // every class is afternoon/evening
    const slots = [];
    Object.entries(D.timetable).forEach(([lvl, rows]) => rows.forEach(r => {
      if (!days[r[2]]) return;
      if (r[3].includes('·')) r[3].split('·').forEach(part => { const m = part.trim().match(/^(Fri|Sat)\s+(\d{1,2}:\d{2})/); if (m) slots.push({ d: DAY[m[1]], s: toMin(m[2]), r, lvl }); });
      else { const m = r[3].match(/(\d{1,2}:\d{2})/); if (m) days[r[2]].forEach(d => slots.push({ d, s: toMin(m[1]), r, lvl })); }
    }));
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false });
    const nm = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], LVN = { O: 'O Level', AS: 'AS', A2: 'A2' };
    const clock = m => { const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'); return `${(h % 12) || 12}:${mm} ${h >= 12 ? 'PM' : 'AM'}`; };
    function tick() {
      const p = fmt.formatToParts(new Date()), wd = DAY[p.find(x => x.type === 'weekday').value];
      const now = wd * 1440 + (+p.find(x => x.type === 'hour').value % 24) * 60 + (+p.find(x => x.type === 'minute').value);
      let best = null, bestGap = Infinity;
      slots.forEach(sl => { let g = sl.d * 1440 + sl.s - now; if (g < -10) g += 7 * 1440; if (g < bestGap) { bestGap = g; best = sl; } });
      if (!best) return;
      const card = $('#nextClass'), live = bestGap <= 0;
      $('#ncLabel').textContent = live ? 'In class now' : 'Next class';
      $('#ncSubj').textContent = `${best.r[0]} · ${LVN[best.lvl]}`;
      $('#ncMeta').textContent = `${best.r[1]} · ${best.r[4]}`;
      const h = Math.floor(bestGap / 60), m = bestGap % 60;
      $('#ncWhen').textContent = live ? `Started ${clock(best.s)}` : bestGap < 60 ? `Starts in ${m} min` : bestGap < 1440 ? `${nm[best.d]} ${clock(best.s)} · in ${h}h ${m}m` : `${nm[best.d]} ${clock(best.s)}`;
      card.classList.toggle('is-now', live || bestGap < 60);
      card.setAttribute('aria-label', `${$('#ncLabel').textContent}: ${$('#ncSubj').textContent}, ${$('#ncMeta').textContent}, ${$('#ncWhen').textContent}`);
    }
    tick(); setInterval(tick, 30000);
  })();

  /* ================= ASK TCR (rule-based, answers from the real data) ================= */
  const bot = $('#bot'), log = $('#botLog'), botIn = $('#botIn'), chipsBox = $('#botChips'), askBtns = $$('[data-bot]');
  const SUBJ = [['Additional Maths', /add(itional)?\s*math/], ['Mathematics', /\bmaths?\b|mathematics/], ['Physics', /phy/], ['Chemistry', /chem/], ['Biology', /\bbio/], ['Computer Science', /computer|\bcs\b|comp sci/], ['Accounting', /account/], ['Business', /business|\bbst\b/], ['Economics', /\beco|econ/], ['Pakistan Studies', /\bpak|pakistan|\bpst\b/], ['Islamiyat', /islam/], ['Urdu', /urdu/], ['English', /english|\beng\b/], ['Psychology', /psych/], ['Sociology', /socio/]];
  const LV = { O: 'O Level', AS: 'AS', A2: 'A2' };
  const btn = (label, attrs, primary) => `<button class="btn ${primary ? 'btn--primary' : 'btn--outline'}" ${attrs}><span>${label}</span></button>`;
  const say = (html, who = 'bot') => { const m = document.createElement('div'); m.className = 'msg msg--' + who; m.innerHTML = html; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };
  function answer(qRaw) {
    const q = qRaw.toLowerCase();
    const lv = /\bo\s*-?level|\bol\b/.test(q) ? ['O'] : /\ba2\b/.test(q) ? ['A2'] : /\bas\b/.test(q) ? ['AS'] : /a\s*-?level|alevel/.test(q) ? ['AS', 'A2'] : ['O', 'AS', 'A2'];
    const code = q.match(/\b(\d{4})\b/);
    if (code) { const s = D.syllabus.find(x => x.code === code[1]); if (s) return `<b>${s.code} · ${esc(s.name)}</b><br>${s.lvl === 'O' ? 'O Level' : 'AS & A Level'}, taught by ${esc(s.teacher)}. Exams ${s.years}, ${s.papers.length} papers.<div class="acts">${btn('Open syllabus', `data-syl="${s.code}"`, true)}${btn('Reserve', `data-book data-book-subject="${esc(s.name)}"`)}</div>`; }
    const sub = SUBJ.find(([, re]) => re.test(q));
    if (sub && /a\*|grade|threshold|percent|%|mark/.test(q)) {
      const ths = D.thresholds.filter(t => t.name.toLowerCase().startsWith(sub[0].toLowerCase().slice(0, 6)));
      if (ths.length) return `June 2026 thresholds for <b>${sub[0]}</b>:<ul>${ths.map(t => `<li><b>${t.lvl === 'O' ? 'O Level' : 'A Level'} ${t.code}</b>A* ${lab(t.astar)} · A ${lab(t.a)} · C ${lab(t.c)}</li>`).join('')}</ul><div class="acts">${btn('Try the calculator', 'data-go="#grades"', true)}</div>`;
    }
    const teacher = [...new Set(Object.values(D.timetable).flat().map(r => r[1]))].find(n => q.includes(n.toLowerCase().replace(/^(sir|ms)\s+/, '').split(' ')[0]) && n.toLowerCase().replace(/^(sir|ms)\s+/, '').split(' ')[0].length > 3);
    if (sub || teacher) {
      const rows = lv.flatMap(l => D.timetable[l].filter(r => sub ? r[0] === sub[0] : r[1] === teacher).map(r => [l, ...r]));
      if (rows.length) return `${sub ? `<b>${sub[0]}</b> classes` : `<b>${esc(teacher)}</b> teaches`} this week:<ul>${rows.map(r => `<li><b>${LV[r[0]]} · ${r[1]}</b>${r[2]} · ${r[3] === 'ON' ? 'Online, flexible' : r[4]} · ${r[5]}</li>`).join('')}</ul><div class="acts">${btn('Reserve a seat', `data-book data-book-level="${rows[0][0]}" data-book-subject="${rows[0][1]}"`, true)}${btn('Full timetable', 'data-go="#timetable"')}</div>`;
      if (sub) return `I couldn’t find <b>${sub[0]}</b> for ${lv.map(l => LV[l]).join('/')} on the timetable. The front desk can confirm.<div class="acts">${btn('Ask on WhatsApp', `data-wa="${esc('Hi, do you offer ' + sub[0] + '?')}"`, true)}</div>`;
    }
    if (/where|address|location|map|direction|reach/.test(q)) return `We’re at <b>Plot C-22, Block I, North Nazimabad, Karachi 74700</b>, two plots from the Block I roundabout.<div class="acts">${btn('Get directions', 'data-href="https://www.google.com/maps/dir/?api=1&destination=24.9441,67.0463"', true)}</div>`;
    if (/fee|fees|price|cost|charges/.test(q)) return `Fees depend on the subjects and level you choose, so the front desk shares the current fee sheet directly.<div class="acts">${btn('Ask about fees', `data-wa="${esc('Hi, could you share the fee details for The Classroom?')}"`, true)}</div>`;
    if (/online|zoom|remote/.test(q)) return `<b>Psychology</b> and <b>Sociology</b> (AS &amp; A2) are taught online. Every other subject is on campus.`;
    if (/portal|login|learn360|lecture|recorded/.test(q)) return `Enrolled students sign in to the Learn360 student portal for recorded lectures, tests and material.<div class="acts">${btn('Open portal', 'data-href="https://the-classroom.learn360lms.com"', true)}</div>`;
    if (/result/.test(q)) return `November 2026 results: <b>AS &amp; A Level on 7 Jan 2027</b> (${dA} days) and <b>O Level on 14 Jan 2027</b> (${dO} days).<div class="acts">${btn('Exam calendar', 'data-go="#calendar"', true)}</div>`;
    if (/time|timing|hour|open|close|when/.test(q)) return `Classes run <b>Monday to Saturday</b>, afternoons and evenings after school. Sunday is closed on campus. Ask me about a subject, like “Chemistry timings”.`;
    if (/reserve|admission|enrol|enroll|join|seat|register/.test(q)) return `It takes three quick steps: level, subjects, then your details. Your request goes to the front desk on WhatsApp.<div class="acts">${btn('Reserve a seat', 'data-book', true)}</div>`;
    if (/phone|call|contact|number|whatsapp|email/.test(q)) return `Call <b>03-111-111-827</b> or email <b>info@theclassroom.pk</b>.<div class="acts">${btn('Call now', 'data-href="tel:+923111111827"', true)}${btn('WhatsApp', `data-wa="Hi"`)}</div>`;
    if (/entry test|iba|lums|nust|fast|giki|iobm|university/.test(q)) return `Yes, we prepare students for the <b>IBA, IOBM, LUMS, NUST, GIKI and FAST</b> entry tests, plus applications and interviews.`;
    if (/hi|hello|salam|assalam|hey/.test(q)) return `Wa alaikum assalam! Ask me about a subject’s timings, a syllabus code, A* thresholds, results dates or how to reserve.`;
    return `I can answer from our timetable and syllabus. Try one of these:<div class="acts">${['Physics timings', 'A* in Chemistry', '9709', 'Where are you?'].map(x => btn(x, `data-ask="${x}"`)).join('')}</div>`;
  }
  function ask(q) {
    say(esc(q), 'me');
    const t = say('<span class="typing"><i></i><i></i><i></i></span>'); t.style.padding = '0';
    setTimeout(() => { t.style.padding = ''; t.innerHTML = answer(q); log.scrollTop = log.scrollHeight; }, RM ? 0 : 520);
  }
  let botStarted = false, botFrom = null;
  function openBot() {
    botFrom = document.activeElement; closeMenu(); hidePromo(false);
    bot.hidden = false; bot.classList.remove('closing'); askBtns.forEach(b => b.setAttribute('aria-expanded', 'true'));
    if (!botStarted) {
      botStarted = true;
      say('Assalam o Alaikum! I’m <b>Ask TCR</b>. I answer instantly from The Classroom’s published timetable and Cambridge syllabus list.');
      chipsBox.innerHTML = ['Physics timings', 'A* in Maths', 'Results dates', 'Online classes', 'Fees', 'Where are you?'].map(x => `<button type="button" data-ask="${x}">${x}</button>`).join('');
    }
    setTimeout(() => botIn.focus({ preventScroll: true }), 80);
  }
  function closeBot() { if (bot.hidden) return; bot.classList.add('closing'); askBtns.forEach(b => b.setAttribute('aria-expanded', 'false')); setTimeout(() => { bot.hidden = true; bot.classList.remove('closing'); }, RM ? 0 : 240); }
  askBtns.forEach(b => b.addEventListener('click', () => bot.hidden ? openBot() : closeBot()));
  $('[data-bot-close]').addEventListener('click', () => { closeBot(); botFrom && botFrom.focus && botFrom.focus({ preventScroll: true }); });
  $('#botForm').addEventListener('submit', e => { e.preventDefault(); const v = botIn.value.trim(); if (!v) return; botIn.value = ''; ask(v); });
  bot.addEventListener('click', e => {
    const a = e.target.closest('[data-ask]'); if (a) return ask(a.dataset.ask);
    const s = e.target.closest('[data-syl]'); if (s) { closeBot(); return openSyl(s.dataset.syl); }
    const g = e.target.closest('[data-go]'); if (g) { closeBot(); return scrollTo($(g.dataset.go)); }
    const h = e.target.closest('[data-href]'); if (h) return window.open(h.dataset.href, h.dataset.href.startsWith('tel:') ? '_self' : '_blank', 'noopener');
    const w = e.target.closest('[data-wa]'); if (w) return window.open(wa(w.dataset.wa), '_blank', 'noopener');
  });
  chipsBox.addEventListener('click', e => { const a = e.target.closest('[data-ask]'); if (a) ask(a.dataset.ask); });

  /* ================= KEYBOARD: esc, ⌘K, focus trap ================= */
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPalette() : closePalette(); return; }
    if (e.key === 'Escape') { if (!pal.hidden) return closePalette(); if (!book.hidden) return closeBook(); if (!sheet.hidden) return closeSheet(); if (!bot.hidden) return closeBot(); return closeMenu(true); }
    if (e.key === 'Tab') {
      const box = !book.hidden ? book : !sheet.hidden ? sheet : !pal.hidden ? pal : null; if (!box) return;
      const f = $$('a[href],button:not([disabled]):not([hidden]),input:not([type=hidden]),select', box).filter(x => x.offsetParent !== null); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ================= ONE-SHOT DATA ANIMATIONS ================= */
  const count = el => {
    const to = +el.dataset.to, dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1700;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const el = e.target; el.classList.add('in');
    if (el.classList.contains('count') && !RM) count(el);
    if (el === bars) barsSeen = true;
    if (el.id === 'timeline') el.style.setProperty('--tlp', 1);
    io.unobserve(el);
  }), { rootMargin: '0px 0px -10% 0px', threshold: .15 });
  $$('.count, #bars, #timeline, .ibcc__card, #weekBars').forEach(el => io.observe(el));

  /* ================= POINTER: cursor + smooth 3D tilt ================= */
  if (FINE && !RM) {
    const cur = $('.cursor'), curLabel = $('.cursor__label'); let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY; cur.classList.remove('is-out');
      const t = e.target, lb = t.closest && t.closest('[data-cursor]');
      cur.classList.toggle('has-label', !!lb); if (lb) curLabel.textContent = lb.dataset.cursor;
      cur.classList.toggle('is-hover', !lb && !!(t.closest && t.closest('a,button,label,summary')));
      cur.classList.toggle('is-text', !!(t.closest && t.closest('input:not([type=range]),textarea')));
    }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.add('is-out'));
    (function loop() { cx += (tx - cx) * .3; cy += (ty - cy) * .3; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();

    // magnetic primary buttons
    $$('.btn--primary.btn--lg, .dock__ask, .band .btn--light').forEach(b => {
      const mx = G ? G.quickTo(b, 'x', { duration: .5, ease: 'power3.out' }) : null, my = G ? G.quickTo(b, 'y', { duration: .5, ease: 'power3.out' }) : null;
      if (!mx) return;
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .25); my((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
    grid.addEventListener('pointermove', e => { const c = e.target.closest('.syl'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true });
    if (G) {
      $$('.tile, .prog, .fac').forEach(c => {
        G.set(c, { transformPerspective: 1000 });
        const rx = G.quickTo(c, 'rotationX', { duration: .7, ease: 'power3.out' }), ry = G.quickTo(c, 'rotationY', { duration: .7, ease: 'power3.out' });
        c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 7); rx(((e.clientY - r.top) / r.height - .5) * -7); });
        c.addEventListener('pointerleave', () => { rx(0); ry(0); });
      });
      const medal = $('.medal'), mx = G.quickTo(medal, 'rotationY', { duration: .9, ease: 'power3.out' }), my = G.quickTo(medal, 'rotationX', { duration: .9, ease: 'power3.out' });
      G.set(medal, { transformPerspective: 900 });
      $('.hero').addEventListener('pointermove', e => { mx((e.clientX / innerWidth - .5) * 18); my((e.clientY / innerHeight - .5) * -18); });
      $$('.avatars i').forEach((a, i) => a.style.setProperty('--k', i));
    }
  }

  /* ================= 3D CREST PARTICLES: hero cycle + section placements ================= */
  const SH = { atom: ['The atom', 'science quarter of our crest'], globe: ['The globe', 'world quarter of our crest'], book: ['The open book', 'knowledge quarter of our crest'], cap: ['The cap', 'graduation quarter of our crest'] };
  const order = ['atom', 'globe', 'book', 'cap']; let si = 0, cycle = null, inHero = true;
  function showShape(name) {
    window.TCRGL && TCRGL.setShape(name);
    si = order.indexOf(name);
    $('#shapeName').textContent = SH[name][0]; $('#shapeSub').textContent = SH[name][1];
    $$('#shapeDots i').forEach((d, i) => d.classList.toggle('on', i === si));
  }
  function startCycle() { if (cycle || RM) return; cycle = setInterval(() => { if (inHero) showShape(order[(si + 1) % 4]); }, 4200); }
  function bootGL() {
    if (window.TCRGL || !window.TCRGLBoot) return !!window.TCRGL;
    window.TCRGLBoot();
    if (!window.TCRGL) { $('.stage__label') && ($('.stage__label').style.display = 'none'); return false; }
    TCRGL.setTheme(root.dataset.theme); startCycle(); return true;
  }

  /* ================= GSAP SCROLL SCENES ================= */
  function motion(introPlayed) {
    placeAll();
    if (RM || !G || !ST) return;
    G.registerPlugin(ST);

    splitWords($('.hero__title')); // idempotent; static on repeat visits

    // section headings rise word by word
    $$('.sec-head .h2, .programs__head .h2, .faq__side .h2, .cal__head .h2, .visit__copy .h2, .band__title, .thresh__top .h3').forEach(h => {
      splitWords(h);
      G.from($$('.sw>span', h), { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });
    // ledes fill in as you scroll
    $$('.sec-head .lede, .programs__head .lede, .cal__head .lede, .faq__side .lede, .visit__copy .lede').forEach(p => {
      const words = p.textContent.split(/\s+/).filter(Boolean);
      p.innerHTML = words.map(w => `<span class="fw">${esc(w)}</span>`).join(' ');
      G.fromTo($$('.fw', p), { opacity: .3 }, { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 50%', scrub: .6 } });
    });
    // cards rise in 3D, batched per row
    const rise = '.tile, .fac, .qa, .countdown__item, .calc__controls, .calc__result, .bars, .tt-table, .ibcc__card, .map, .tl, .change, .roster, .contact div';
    G.set(rise, { transformPerspective: 1000, transformOrigin: '50% 100%' });
    ST.batch(rise, {
      start: 'top 90%', once: true,
      onEnter: batch => G.fromTo(batch, { y: 70, rotationX: 14, autoAlpha: 0 }, { y: 0, rotationX: 0, autoAlpha: 1, duration: 1.15, ease: 'expo.out', stagger: .08, overwrite: 'auto', clearProps: 'y,opacity,visibility' })
    });
    // hero parallax
    G.to('.hero__glow--a', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    G.to('.hero__copy', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    // dark bands lift off the 3D floor: tilted back in perspective, flattening as they arrive
    $$('.grades .band-in').forEach(el => {
      G.fromTo(el, { rotationX: 9, y: 70, scale: .965, transformPerspective: 1400 }, { rotationX: 0, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 62%', scrub: .8 } });
    });
    // pinned horizontal programs (desktop)
    const mm = G.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const rail = $('.programs__rail'), bar = $('.programs__bar i');
      const dist = () => Math.max(0, rail.scrollWidth - innerWidth);
      if (dist() < 40) return;
      G.to(rail, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.programs', start: 'top top', end: () => '+=' + dist(), pin: '.programs__pin', scrub: .6, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => bar.style.transform = `scaleX(${s.progress})` } });
    });
    $$('.prog').forEach((p, i) => G.from(p, { y: 80, rotationX: 10, autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay: i * .08, scrollTrigger: { trigger: '.programs', start: 'top 70%', once: true } }));
    // footer wordmark fills on scroll
    const fm = $('.foot__mark');
    ST.create({ trigger: fm, start: 'top bottom', end: 'bottom 75%', scrub: true, onUpdate: s => fm.style.setProperty('--fp', s.progress.toFixed(3)) });
    // inverted bands ease in
    G.from('.band__in', { scale: .96, ease: 'none', scrollTrigger: { trigger: '.band__in', start: 'top bottom', end: 'top 55%', scrub: true } });

    // 3D particles: where they live as you scroll
    if (bootGL()) {
      const place = (sel, shape, p) => ST.create({ trigger: sel, start: 'top 60%', end: 'bottom 40%', onToggle: s => { if (s.isActive) { inHero = false; TCRGL.setMode('free', p); showShape(shape); } } });
      ST.create({ trigger: '.hero', start: 'top top', end: 'bottom 30%', onToggle: s => { if (s.isActive) { inHero = true; TCRGL.setMode('hero'); } } });
      // the crest's quarters live behind every section, alternating sides
      place('.why', 'globe', { x: .66, y: .1, scale: .95, alpha: .5 });
      place('.programs', 'cap', { x: .5, y: .1, scale: .95, alpha: .75 });
      place('.syllabus', 'book', { x: -.62, y: .2, scale: .9, alpha: .55 });
      place('.grades', 'atom', { x: .7, y: .35, scale: .9, alpha: .55 });
      place('.tt', 'globe', { x: -.7, y: -.1, scale: .85, alpha: .45 });
      place('.faculty', 'cap', { x: .7, y: .15, scale: .85, alpha: .5 });
      place('.cal', 'atom', { x: -.66, y: .25, scale: .9, alpha: .5 });
      place('.faq-sec', 'book', { x: .68, y: -.05, scale: .85, alpha: .5 });
      place('.visit', 'globe', { x: -.62, y: .1, scale: .9, alpha: .5 });
      place('.band', 'cap', { x: .62, y: 0, scale: 1, alpha: .55 });
      place('.foot', 'atom', { x: 0, y: .4, scale: .8, alpha: .4 });
    }
    ST.refresh();
  }

  /* ================= BOOT ================= */
  onScroll();
  loader().then(played => {
    // the 3D engine starts once the page is usable, so it never competes with the intro
    root.classList.add('swash-on');
    // let the landing animation finish on a quiet main thread, then build the scroll scenes and start 3D
    const after = played ? 1400 : 0;
    const go = () => setTimeout(() => idle(() => { motion(played); bootGL(); }, 500), after);
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
  });
})();
