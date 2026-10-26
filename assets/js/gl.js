/* The Classroom — crest particles.
   A hand-written WebGL point field (no three.js) that morphs between the four
   quarters of the crest: atom, globe, open book and graduation cap.
   Exposes window.TCRGL = { setMode, setShape, setTheme, shapes } */
(() => {
  const canvas = document.getElementById('gl');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  if (!gl) { document.documentElement.classList.add('no-gl'); return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 760px)').matches;
  const N = small ? 1500 : 2600;

  /* ---------- seeded random ---------- */
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const TAU = Math.PI * 2;
  const rotX = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; };
  const jit = (p, j) => [p[0] + (rnd() - .5) * j, p[1] + (rnd() - .5) * j, p[2] + (rnd() - .5) * j];

  /* ---------- shapes (unit ≈ crest-ring radius) ---------- */
  function atom() {
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const k = i % 3, th = k * Math.PI / 3;
      let p;
      if (rnd() < .07) { // electrons: tight clusters riding each ring
        const u = k * 2.1 + .6, r = .05 * Math.cbrt(rnd());
        const a = rnd() * TAU, b = Math.acos(2 * rnd() - 1);
        p = [Math.cos(u) * 1.2 + r * Math.sin(b) * Math.cos(a), Math.sin(u) * .44 + r * Math.sin(b) * Math.sin(a), r * Math.cos(b)];
      } else {
        const u = rnd() * TAU; p = [Math.cos(u) * 1.2, Math.sin(u) * .44, 0];
      }
      const x = p[0] * Math.cos(th) - p[1] * Math.sin(th), y = p[0] * Math.sin(th) + p[1] * Math.cos(th);
      p = rotX(jit([x, y, p[2]], .018), .32);
      out.set(p, i * 3);
    }
    return out;
  }
  function globe() {
    const out = new Float32Array(N * 3), r = 1.08;
    for (let i = 0; i < N; i++) {
      const t = rnd() * TAU; let p;
      if (i % 5 < 3) { const lon = Math.floor(rnd() * 12) / 12 * Math.PI; p = [r * Math.cos(t) * Math.cos(lon), r * Math.sin(t), r * Math.cos(t) * Math.sin(lon)]; }
      else { const lat = -Math.PI / 2 + (Math.floor(rnd() * 7) + 1) * Math.PI / 8; p = [r * Math.cos(lat) * Math.cos(t), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(t)]; }
      out.set(rotX(jit(p, .012), .38), i * 3);
    }
    return out;
  }
  function book() {
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      let u, v;
      const m = rnd();
      if (m < .72) { // text lines
        u = (rnd() < .5 ? -1 : 1) * (.1 + rnd() * .82);
        v = -.62 + Math.floor(rnd() * 13) * .1 + (rnd() - .5) * .01;
      } else if (m < .9) { // page outlines
        const e = Math.floor(rnd() * 3);
        if (e === 0) { u = (rnd() < .5 ? -1 : 1) * (.02 + rnd() * .98); v = rnd() < .5 ? -.72 : .62; }
        else { u = e === 1 ? -1 : 1; v = -.72 + rnd() * 1.34; }
      } else { u = (rnd() - .5) * .04; v = -.72 + rnd() * 1.34; } // spine
      const au = Math.abs(u);
      const p = [u * 1.3, v, .42 * Math.pow(au, .55) - .12];
      const q = rotX(jit(p, .01), -1.02);
      out.set([q[0], q[1] - .38, q[2]], i * 3);
    }
    return out;
  }
  function cap() {
    const out = new Float32Array(N * 3), c45 = Math.SQRT1_2;
    for (let i = 0; i < N; i++) {
      const m = rnd(); let p;
      if (m < .55) { // board
        let a = rnd() * 2 - 1, b = rnd() * 2 - 1;
        if (rnd() < .42) { if (rnd() < .5) a = Math.sign(a) || 1; else b = Math.sign(b) || 1; }
        p = [(a - b) * c45 * 1.02, .5, (a + b) * c45 * 1.02];
      } else if (m < .86) { // skull cap
        const t = rnd() * TAU, h = rnd();
        p = [Math.cos(t) * .55, .5 - h * .5, Math.sin(t) * .5];
      } else if (m < .97) { // tassel cord
        const s = rnd();
        p = s < .45 ? [s / .45 * 1.02, .52, 0] : [1.02, .52 - (s - .45) / .55 * .78, 0];
      } else { // tassel fringe
        p = [1.02 + (rnd() - .5) * .1, -.3 - rnd() * .16, (rnd() - .5) * .1];
      }
      const q = rotX(jit(p, .012), .5);
      out.set([q[0], q[1] - .05, q[2]], i * 3);
    }
    return out;
  }
  const SHAPES = { atom: atom(), globe: globe(), book: book(), cap: cap() };

  /* ---------- program ---------- */
  const vs = `
attribute vec3 aA; attribute vec3 aB; attribute float aS;
uniform float uT, uTime, uSize, uDpr; uniform vec2 uScale, uOff; uniform mat3 uR;
varying float vD; varying float vS;
void main(){
  float t = smoothstep(0.0, 1.0, clamp(uT * 1.35 - aS * 0.35, 0.0, 1.0));
  vec3 p = mix(aA, aB, t);
  p += 0.012 * vec3(sin(uTime * 1.3 + aS * 40.0), cos(uTime * 1.1 + aS * 31.0), sin(uTime * 0.9 + aS * 23.0));
  p = uR * p;
  float k = 1.0 / (1.0 - p.z * 0.28);
  gl_Position = vec4(p.xy * uScale * k + uOff, 0.0, 1.0);
  gl_PointSize = uSize * uDpr * k * (0.55 + aS * 0.9);
  vD = p.z; vS = aS;
}`;
  const fs = `
precision mediump float;
uniform vec3 uCA, uCB; uniform float uAlpha;
varying float vD; varying float vS;
void main(){
  vec2 c = gl_PointCoord - 0.5; float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d) * uAlpha * (0.38 + 0.62 * clamp(vD * 0.5 + 0.55, 0.0, 1.0));
  vec3 col = mix(uCA, uCB, smoothstep(0.55, 1.0, vS) * clamp(vD + 0.6, 0.0, 1.0));
  gl_FragColor = vec4(col * a, a);
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { document.documentElement.classList.add('no-gl'); return; }
  gl.useProgram(prog);
  const A = new Float32Array(SHAPES.atom), B = new Float32Array(SHAPES.atom);
  const S = new Float32Array(N); for (let i = 0; i < N; i++) S[i] = rnd();
  const buf = (data, name, size, usage) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage); const l = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0); return b; };
  const bA = buf(A, 'aA', 3, gl.DYNAMIC_DRAW), bB = buf(B, 'aB', 3, gl.DYNAMIC_DRAW); buf(S, 'aS', 1, gl.STATIC_DRAW);
  const U = n => gl.getUniformLocation(prog, n);
  const u = { T: U('uT'), time: U('uTime'), size: U('uSize'), dpr: U('uDpr'), scale: U('uScale'), off: U('uOff'), R: U('uR'), CA: U('uCA'), CB: U('uCB'), alpha: U('uAlpha') };
  gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND);

  /* ---------- theme ---------- */
  let additive = false;
  function setTheme(t) {
    additive = t === 'dark';
    if (additive) { gl.uniform3f(u.CA, .93, .28, .3); gl.uniform3f(u.CB, 1, .8, .45); gl.blendFunc(gl.ONE, gl.ONE); }
    else { gl.uniform3f(u.CA, .78, .12, .16); gl.uniform3f(u.CB, .74, .5, .14); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); }
  }
  setTheme(document.documentElement.dataset.theme);

  /* ---------- state ---------- */
  let shape = 'atom', t = 1, tStart = 0;
  const morph = 1700;
  function setShape(name) {
    if (!SHAPES[name] || name === shape) return;
    // freeze current blend into A, then morph to the new shape
    const e = Math.min(1, t);
    for (let i = 0; i < N * 3; i++) A[i] = A[i] + (B[i] - A[i]) * e;
    B.set(SHAPES[name]); shape = name; tStart = performance.now(); t = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, bA); gl.bufferSubData(gl.ARRAY_BUFFER, 0, A);
    gl.bindBuffer(gl.ARRAY_BUFFER, bB); gl.bufferSubData(gl.ARRAY_BUFFER, 0, B);
  }
  // mode: 'hero' (anchored to #stage) or a free placement {x,y,scale,alpha}
  let mode = 'hero', place = { x: .55, y: 0, scale: .5, alpha: 0 };
  const cur = { x: 0, y: 0, sx: .3, sy: .3, alpha: 0 };
  function setMode(m, p) { mode = m; if (p) place = Object.assign({}, place, p); }

  /* pointer drag-to-rotate (gentle) */
  let px = 0, py = 0, rx = 0, ry = 0;
  addEventListener('pointermove', e => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; }, { passive: true });

  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform1f(u.dpr, dpr);
  }
  resize(); addEventListener('resize', resize);

  const stage = document.getElementById('stage');
  let visible = !document.hidden; document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) requestAnimationFrame(frame); });
  const t0 = performance.now();
  canvas.classList.add('on');

  function frame(now) {
    if (!visible) return;
    t = Math.min(1, (now - tStart) / morph);
    // target placement
    let tx, ty, unit, ta;
    if (mode === 'hero' && stage) {
      const r = stage.getBoundingClientRect();
      tx = (r.left + r.width / 2) / W * 2 - 1; ty = 1 - (r.top + r.height / 2) / H * 2;
      unit = r.width * .39; ta = r.bottom < 0 ? 0 : 1;
    } else {
      tx = place.x; ty = place.y; unit = H * place.scale * .5; ta = place.alpha;
    }
    const k = .085;
    cur.x += (tx - cur.x) * k; cur.y += (ty - cur.y) * k;
    cur.sx += (unit / (W / 2) - cur.sx) * k; cur.sy += (unit / (H / 2) - cur.sy) * k;
    cur.alpha += (ta - cur.alpha) * .06;
    if (cur.alpha < .004) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); requestAnimationFrame(frame); return; }
    // rotation: slow spin + pointer lean
    const time = reduce ? 0 : (now - t0) / 1000;
    rx += (py * .5 - rx) * .05; ry += (px * .8 - ry) * .05;
    const a = time * .22 + ry, b = rx;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    // R = Rx(b) * Ry(a), column-major
    gl.uniformMatrix3fv(u.R, false, [ca, sa * sb, -sa * cb, 0, cb, sb, sa, -ca * sb, ca * cb]);
    gl.uniform1f(u.T, t); gl.uniform1f(u.time, time);
    gl.uniform2f(u.scale, cur.sx, cur.sy); gl.uniform2f(u.off, cur.x, cur.y);
    gl.uniform1f(u.size, small ? 2.6 : 2.9); gl.uniform1f(u.alpha, cur.alpha * (additive ? .75 : .9));
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, N);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.TCRGL = { setMode, setShape, setTheme, shapes: Object.keys(SHAPES) };
})();
