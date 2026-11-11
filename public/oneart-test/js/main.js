/* =====================================================================
   ONEART LP 試作 第2案 — 動きの全体
   使うもの：GSAP + ScrollTrigger + Draggable + InertiaPlugin（vendor/）、Lenis（PCのみ）
   方針：
   - 動きを減らす設定 / GSAPが読めない → 動きを止め、全部を最初から表示（CSSの静的レイアウト）
   - PC（細かいポインター）とスマホ（タッチ）で別の動きを用意する
   - 重い処理は画面内にあるときだけ動かす
   ===================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  var MOTION = HAS_GSAP && !REDUCED;
  if (!MOTION) html.classList.remove('motion');
  var params = new URLSearchParams(location.search);

  var COLORS = { paper: '#f1ece1', ink: '#141414', pink: '#ff4fa3', yellow: '#ffe500', blue: '#2f52ff' };
  var PLATE_NAMES = ['pink', 'yellow', 'blue'];

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function safe(name, fn) { try { fn(); } catch (e) { console.error('[oneart] ' + name, e); } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // 設定が途中で変わったら読み込み直す（動きの有無を切り替えるため）
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function () { location.reload(); });

  /* ---------------- 文字の分割・スクランブル ---------------- */
  function splitChars(el) {
    if (el._chars) return el._chars;
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          Array.from(n.textContent).forEach(function (ch) {
            if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); return; }
            var s = document.createElement('span'); s.className = 'c'; s.setAttribute('aria-hidden', 'true'); s.textContent = ch;
            s.style.display = 'inline-block'; frag.appendChild(s); out.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') { walk(n); }
      });
    })(el);
    el._chars = out;
    return out;
  }

  var SCRAMBLE_POOL = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ#%&*+=<>/ONEART0123456789';
  function scramble(el, finalText, duration) {
    duration = duration || 0.9;
    if (!MOTION) { el.textContent = finalText; return; }
    var chars = Array.from(finalText), len = chars.length, start = performance.now();
    if (el._scr) cancelAnimationFrame(el._scr);
    (function tick(now) {
      var p = clamp((now - start) / (duration * 1000), 0, 1), out = '';
      for (var i = 0; i < len; i++) {
        if (chars[i] === ' ' || i < Math.floor(p * len)) out += chars[i];
        else out += SCRAMBLE_POOL[(Math.random() * SCRAMBLE_POOL.length) | 0];
      }
      el.textContent = out;
      if (p < 1) el._scr = requestAnimationFrame(tick); else { el.textContent = finalText; el._scr = 0; }
    })(start);
  }

  /* ---------------- 共通：お知らせ ---------------- */
  var toastT = 0;
  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('is-show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-show'); }, 2600);
  }

  /* ---------------- スクロール（Lenis：PCのみ） ---------------- */
  var lenis = null;
  var scrollVel = 0;
  function setupScroll() {
    if (!HAS_GSAP) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.Draggable) gsap.registerPlugin(Draggable);
    if (window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin);
    if (MOTION && FINE && window.Lenis && !params.has('nolenis')) {
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    // スクロール速度（流れる文字・カードの傾きに使う）
    var lastY = window.scrollY, lastT = performance.now();
    gsap.ticker.add(function () {
      var now = performance.now(), y = window.scrollY, dt = Math.max(1, now - lastT);
      var v = (y - lastY) / dt * 1000; // px/s
      scrollVel += (v - scrollVel) * 0.2;
      lastY = y; lastT = now;
    });
  }
  function lockScroll(on) {
    if (lenis) { on ? lenis.stop() : lenis.start(); }
    html.classList.toggle('menu-lock', on);
  }
  function scrollToTarget(target, immediate) {
    var y = target.getBoundingClientRect().top + window.scrollY;
    if (lenis) lenis.scrollTo(y, { immediate: !!immediate, force: true });
    else window.scrollTo({ top: y, behavior: immediate || !MOTION ? 'auto' : 'smooth' });
  }

  /* ---------------- 読み込み演出 ---------------- */
  function runLoader(done) {
    var L = $('#loader');
    if (!MOTION || !L || params.has('noloader')) { if (L) L.style.display = 'none'; done(); return; }
    lockScroll(true);
    var countEl = $('#loaderCount'), count = { v: 0 };
    var finished = false;
    function finish() { if (finished) return; finished = true; lockScroll(false); }
    // 3色の版（文字）が別々の方向から飛んできて、最後に黒い版が刷られる
    var labels = {}; $$('[data-plate-label]', L).forEach(function (s) { labels[s.getAttribute('data-plate-label')] = s; });
    function on(name) { return function () { labels[name].classList.add('is-on'); }; }
    gsap.set('.lw-pink', { xPercent: -60, yPercent: 30, rotate: -8, opacity: 0 });
    gsap.set('.lw-yellow', { yPercent: -140, rotate: 6, opacity: 0 });
    gsap.set('.lw-blue', { xPercent: 60, yPercent: 40, rotate: 10, opacity: 0 });
    gsap.set('.lw-key span', { yPercent: 110 });
    var tl = gsap.timeline({ onComplete: function () { L.style.display = 'none'; finish(); } });
    tl.to(count, { v: 100, duration: 1.55, ease: 'power2.inOut', onUpdate: function () { countEl.textContent = String(Math.round(count.v)).padStart(3, '0'); } }, 0)
      .to('.loader-line', { scaleX: 1, duration: 1.55, ease: 'power2.inOut' }, 0)
      .to('.lw-pink', { xPercent: -3, yPercent: 4, rotate: -1.5, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0.05).add(on('pink'), 0.05)
      .to('.lw-yellow', { xPercent: 2.5, yPercent: -5, rotate: 1, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0.25).add(on('yellow'), 0.25)
      .to('.lw-blue', { xPercent: 1.5, yPercent: 6, rotate: 1.5, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0.45).add(on('blue'), 0.45)
      .to('.lw-key span', { yPercent: 0, stagger: 0.05, duration: 0.7, ease: 'expo.out' }, 0.7).add(on('key'), 0.7)
      // 見当が合う（版がぴたりと重なる）→ 少しだけずれた位置に戻る
      .to('.lw:not(.lw-key)', { xPercent: 0, yPercent: 0, rotate: 0, duration: 0.28, ease: 'power4.inOut' }, 1.3)
      .to('.lw-pink', { xPercent: -1.2, yPercent: 1.5, duration: 0.25, ease: 'power2.out' }, 1.6)
      .to('.lw-blue', { xPercent: 0.8, yPercent: 2.4, duration: 0.25, ease: 'power2.out' }, 1.6)
      .to('.loader-word', { scale: 1.06, duration: 0.5, ease: 'power2.in' }, 1.6)
      .to(L, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: 'expo.inOut' }, 1.85)
      .add(function () { finish(); done(); }, 1.95);
    L.addEventListener('click', function () { tl.timeScale(3); });
  }

  /* ---------------- 最初の画面 ---------------- */
  var ink = null;
  function setupHero() {
    var hero = $('#hero'), canvas = $('#inkCanvas');
    var swatch = $$('#heroSwatch i');
    function onPlate(i) {
      swatch.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      html.style.setProperty('--cursor-plate', COLORS[PLATE_NAMES[i]]);
    }
    if (window.OneartInk && !params.has('nogl')) {
      try { ink = window.OneartInk.create(canvas, { reduced: !MOTION, host: hero, onPlate: onPlate, onLost: function () { html.classList.remove('webgl'); } }); }
      catch (e) { console.warn('[oneart] WebGL init failed', e); ink = null; }
    }
    if (ink) { html.classList.add('webgl'); html.setAttribute('data-ink', ink.format); }
    else { canvas.style.display = 'none'; }
  }

  function heroIntro() {
    if ($('.hero-logo')) {
      gsap.from('.hero-logo', { opacity: 0, y: 24, duration: 1.1, ease: 'power2.out' });
      gsap.from('[data-hero-line], [data-hero-fade]', { opacity: 0, y: 20, stagger: 0.12, duration: 0.8 });
      gsap.to('.hero-title', { yPercent: -35, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
      return;
    }
    var key = $('[data-wm-key]');
    var layers = $$('.wm-layer:not(.wm-key)');
    // 黒い版（キー版）は1文字ずつ下から
    var keyChars = splitChars(key);
    var lines = $$('[data-hero-line]');
    lines.forEach(function (l) {
      var m = document.createElement('span'); m.style.display = 'block'; m.style.overflow = 'hidden';
      l.parentNode.insertBefore(m, l); m.appendChild(l); l.style.display = 'block';
    });
    var tag = $('.hero-tag [data-scramble]');
    var tl = gsap.timeline();
    tl.from(keyChars, { yPercent: 100, rotate: 6, opacity: 0, stagger: 0.06, duration: 1.1, ease: 'expo.out' }, 0)
      .from(lines, { yPercent: 105, stagger: 0.1, duration: 0.9, ease: 'expo.out' }, 0.35)
      .from('[data-hero-fade]', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' }, 0.6)
      .from('.hero-hint, .hero-scroll', { opacity: 0, duration: 0.6 }, 0.8)
      .add(function () { if (tag) scramble(tag, tag.textContent, 1.0); }, 0.2);
    // 色版：ばらばらの位置から飛んできて、少しずれた位置（版ズレ）で止まる
    var state = { spread: 1, px: 0, py: 0, tx: 0, ty: 0, scroll: 0 };
    tl.to(state, { spread: 0, duration: 1.6, ease: 'expo.out' }, 0.1);
    tl.from(layers, { opacity: 0, duration: 0.5, stagger: 0.08 }, 0.1);
    var fs = 0, base = [];
    function measure() {
      fs = parseFloat(getComputedStyle($('#wordmark')).fontSize) || 100;
      base = [[-0.018, 0.012], [0.02, -0.01], [0.008, 0.022]].map(function (b) { return [b[0] * fs, b[1] * fs]; });
    }
    measure(); window.addEventListener('resize', measure);
    layers.forEach(function (l) { l.style.transform = 'none'; });
    var fly = [[-0.5, 0.3], [0.45, -0.4], [0.2, 0.55]];
    var depth = [[-34, -18], [26, 14], [14, 30]];
    var heroVisible = true;
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe($('#hero'));
    function onMove(x, y) { state.tx = x / window.innerWidth - 0.5; state.ty = y / window.innerHeight - 0.5; }
    window.addEventListener('pointermove', function (e) { if (heroVisible) onMove(e.clientX, e.clientY); }, { passive: true });
    $('#hero').addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });
    gsap.ticker.add(function () {
      if (!heroVisible) return;
      state.px += (state.tx - state.px) * 0.08; state.py += (state.ty - state.py) * 0.08;
      if (!FINE) { state.tx *= 0.985; state.ty *= 0.985; }
      var sp = state.spread, sc = state.scroll;
      for (var i = 0; i < layers.length; i++) {
        var x = base[i][0] + fly[i][0] * fs * sp + depth[i][0] * state.px + depth[i][0] * sc * 4;
        var y = base[i][1] + fly[i][1] * fs * sp + depth[i][1] * state.py + depth[i][1] * sc * 3;
        layers[i].style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      }
    });
    // スクロールで版がずれていき、ロゴは上へ抜ける
    gsap.to(state, { scroll: 1, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-title', { yPercent: -35, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-bottom', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: '#hero', start: '20% top', end: '70% top', scrub: true } });
  }

  /* ---------------- 共通の入場演出 ---------------- */
  function setupReveals() {
    // 見出し：1文字ずつ時間差
    $$('[data-chars]').forEach(function (el) {
      var chars = splitChars(el);
      gsap.from(chars, { yPercent: 110, rotate: 10, opacity: 0, stagger: 0.035, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    // 文章：マスクの中から持ち上がる
    $$('[data-mask]').forEach(function (el) {
      var inner = document.createElement('span'); inner.style.display = 'block';
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner); el.style.overflow = 'hidden';
      gsap.from(inner, { yPercent: 102, skewY: 3, duration: 1.0, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    // 理念：スクロール量に合わせて1文字ずつ刷り上がる（版ズレが合っていく）
    $$('[data-fill]').forEach(function (el) {
      var chars = splitChars(el);
      gsap.fromTo(chars,
        { opacity: 0.1, yPercent: 14, textShadow: '-0.07em 0.04em 0 rgba(255,79,163,0.9), 0.06em -0.03em 0 rgba(47,82,255,0.9)' },
        { opacity: 1, yPercent: 0, textShadow: '0em 0em 0 rgba(255,79,163,0), 0em 0em 0 rgba(47,82,255,0)', stagger: 0.12, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 } });
    });
    // 理念の背景の3色の円：別々の速さで動く
    $$('.statement-blob i').forEach(function (b, i) {
      gsap.fromTo(b, { y: 160 * (i + 1) * 0.6, x: (i - 1) * 60 }, { y: -120 * (i + 1) * 0.5, x: (1 - i) * 40, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------------- 作品ができるまで ---------------- */
  function setupProcess(mm) {
    var proc = $('#process'), track = $('#processTrack'), bar = $('#processBar');
    // 03 の線を描く
    var lines = $$('.draw-line', proc);
    lines.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });

    mm.add('(min-width: 768px)', function () {
      function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
      function setH() { proc.style.height = (dist() + window.innerHeight) + 'px'; }
      setH();
      ScrollTrigger.addEventListener('refreshInit', setH);
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: proc, start: 'top top', end: function () { return '+=' + dist(); }, scrub: 0.7, invalidateOnRefresh: true,
          onUpdate: function (self) { bar.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')'; } }
      });
      $$('.step', track).forEach(function (step, i) {
        var media = $('.step-media', step), num = $('.step-num', step);
        gsap.fromTo(media, { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, ease: 'power2.out',
          scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left 92%', end: 'left 45%', scrub: true } });
        gsap.fromTo(num, { xPercent: 60 }, { xPercent: -40, ease: 'none',
          scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        gsap.from($('.step-text', step), { y: 60, opacity: 0, ease: 'power2.out',
          scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left 80%', end: 'left 50%', scrub: true } });
      });
      if (lines.length) gsap.to(lines, { strokeDashoffset: 0, stagger: 0.2, ease: 'none',
        scrollTrigger: { trigger: lines[0].closest('.step'), containerAnimation: tween, start: 'left 85%', end: 'center 50%', scrub: true } });
      gsap.from('.big60', { scale: 0.2, rotate: -30, ease: 'back.out(2)',
        scrollTrigger: { trigger: '.step--last', containerAnimation: tween, start: 'left 85%', end: 'left 45%', scrub: true } });
      return function () { ScrollTrigger.removeEventListener('refreshInit', setH); proc.style.height = ''; gsap.set(track, { clearProps: 'transform' }); };
    });

    // スマホ：指で横にスワイプ。中央に来たカードが大きくなり、少し回る
    mm.add('(max-width: 767px)', function () {
      var steps = $$('.step', track), raf = 0;
      function update() {
        raf = 0;
        var cx = window.innerWidth / 2;
        steps.forEach(function (s) {
          var r = s.getBoundingClientRect();
          var d = clamp((r.left + r.width / 2 - cx) / window.innerWidth, -1.2, 1.2);
          s.style.transform = 'scale(' + (1 - Math.abs(d) * 0.1).toFixed(3) + ') rotate(' + (d * 4).toFixed(2) + 'deg)';
          var m = s.querySelector('.step-media canvas, .step-media img, .draw-svg, .big60');
          if (m) m.style.transform = 'translateX(' + (d * -18).toFixed(1) + '%) scale(1.25)';
        });
        // 03 の線：中央に近いほど描かれる
        if (lines.length) {
          var r3 = lines[0].closest('.step').getBoundingClientRect();
          var p3 = clamp(1 - Math.abs(r3.left + r3.width / 2 - cx) / window.innerWidth * 1.6, 0, 1);
          lines.forEach(function (p) { p.style.strokeDashoffset = (parseFloat(p.style.strokeDasharray) * (1 - p3)).toFixed(1); });
        }
      }
      function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
      track.addEventListener('scroll', onScroll, { passive: true });
      update();
      // 初めて見えたとき、横にずらして「スワイプできる」ことを知らせる
      var hinted = false;
      var st = ScrollTrigger.create({ trigger: track, start: 'top 75%', onEnter: function () {
        if (hinted) return; hinted = true;
        var o = { v: 0 };
        gsap.to(o, { v: 1, duration: 1.3, ease: 'power2.inOut', onUpdate: function () { track.scrollLeft = Math.sin(o.v * Math.PI) * 90; } });
      } });
      return function () { track.removeEventListener('scroll', onScroll); st.kill(); steps.forEach(function (s) { s.style.transform = ''; }); };
    });
  }

  /* ---------------- 流れる巨大文字（スクロールの速さに反応） ---------------- */
  function setupMarquees() {
    $$('[data-marquee]').forEach(function (el) {
      var track = $('.marquee-track', el), dir = parseFloat(el.getAttribute('data-marquee')) || 1;
      var unit = track.innerHTML;
      var w0 = track.scrollWidth || 1, reps = Math.max(1, Math.ceil(window.innerWidth * 1.2 / w0));
      var set = ''; for (var i = 0; i < reps; i++) set += unit;
      track.innerHTML = set + set;
      var half = track.scrollWidth / 2, x = 0, visible = false, skew = 0, sign = 1;
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(el);
      ScrollTrigger.addEventListener('refresh', function () { half = track.scrollWidth / 2; });
      var base = window.innerWidth < 768 ? 50 : 80;
      gsap.ticker.add(function (t, dtMs) {
        if (!visible) return;
        var v = scrollVel;
        if (Math.abs(v) > 30) sign = v > 0 ? 1 : -1;
        var boost = 1 + Math.min(Math.abs(v) / 350, 7);
        x -= dir * sign * base * boost * (dtMs / 1000);
        if (x <= -half) x += half; if (x > 0) x -= half;
        skew += (clamp(-v / 120, -12, 12) * dir - skew) * 0.12;
        track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
      });
    });
  }

  /* ---------------- 札幌展 ---------------- */
  function setupSapporo(mm) {
    // 窓から全画面へ広がる
    mm.add({ d: '(min-width: 768px)', m: '(max-width: 767px)' }, function (ctx) {
      var start = ctx.conditions.d ? 'inset(24% 30% 24% 30% round 18px)' : 'inset(30% 20% 40% 20% round 14px)';
      var tl = gsap.timeline({ scrollTrigger: { trigger: '#zoom', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
      tl.fromTo('#zoomWindow', { clipPath: start }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo('#zoomWindow canvas, #zoomWindow img', { scale: 1.4 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .to('.zw-l', { x: function () { return -window.innerWidth; }, ease: 'power2.in', duration: 0.65 }, 0.05)
        .to('.zw-r', { x: function () { return window.innerWidth; }, ease: 'power2.in', duration: 0.65 }, 0.05)
        .from('.zoom-cards > *', { y: 90, opacity: 0, stagger: 0.08, duration: 0.3, ease: 'power3.out' }, 0.72)
        .to({}, { duration: 0.15 });
    });

    // 数字：桁ごとに回って止まる
    $$('.odo').forEach(function (el) {
      var val = el.getAttribute('data-odo');
      el.textContent = '';
      var sr = document.createElement('span'); sr.className = 'visually-hidden'; sr.textContent = val; el.appendChild(sr);
      var strips = [];
      Array.from(val).forEach(function (d) {
        var col = document.createElement('span'); col.className = 'odo-col'; col.setAttribute('aria-hidden', 'true');
        var strip = document.createElement('span'); strip.className = 'odo-strip';
        var s = ''; for (var k = 0; k < 30; k++) s += '<span>' + (k % 10) + '</span>';
        strip.innerHTML = s; col.appendChild(strip); el.appendChild(col);
        strips.push({ el: strip, d: parseInt(d, 10) });
      });
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () {
        strips.forEach(function (s, i) {
          gsap.fromTo(s.el, { yPercent: 0 }, { yPercent: -((20 + s.d) / 30) * 100, duration: 1.8 + i * 0.35, ease: 'expo.out', delay: i * 0.08 });
        });
      } });
    });
    gsap.from('.stat', { y: 50, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } });

    // 地図：碁盤の目が1本ずつ引かれ、会場のピンが落ちてくる
    var map = $('#map');
    var paths = $$('.map-grid path, .map-river, .map-route', map);
    paths.forEach(function (p) { var L = Math.ceil(p.getTotalLength()); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
    var mtl = gsap.timeline({ scrollTrigger: { trigger: map, start: 'top 80%', end: 'center 45%', scrub: 0.8 } });
    mtl.to($$('.map-grid path', map), { strokeDashoffset: 0, stagger: 0.15, duration: 1, ease: 'none' }, 0)
      .to($('.map-river', map), { strokeDashoffset: 0, duration: 0.8, ease: 'none' }, 0.3)
      .to($('.map-route', map), { strokeDashoffset: 0, duration: 0.6, ease: 'none' }, 0.8);
    gsap.from($$('.map-dots circle', map), { scale: 0, transformOrigin: '50% 50%', stagger: 0.07, duration: 0.6, ease: 'back.out(3)', scrollTrigger: { trigger: map, start: 'top 60%' } });
    var bodies = $$('.pin-body', map);
    gsap.from(bodies, { y: -160, opacity: 0, stagger: 0.25, duration: 1.1, ease: 'bounce.out', scrollTrigger: { trigger: map, start: 'top 45%' },
      onComplete: function () { gsap.to(bodies, { y: -8, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4 }); } });
  }

  /* 地図のピン（動きなしでも使える） */
  function setupMapPins() {
    var map = $('#map'), tip = $('#mapTip');
    var info = {
      1: '会場1｜札幌駅前通地下歩行空間 チ・カ・ホ（仮）<br>2026.8.24–8.26',
      2: '会場2｜BAR LOUNGE RUDAN（仮）<br>2026.8.20–8.22'
    };
    var pins = $$('.map-pin', map);
    function show(pin) {
      pins.forEach(function (p) { p.classList.toggle('is-on', p === pin); });
      var mr = map.getBoundingClientRect(), pr = pin.getBoundingClientRect();
      tip.innerHTML = info[pin.getAttribute('data-pin')];
      var left = clamp(pr.left - mr.left + pr.width / 2 - 105, 0, mr.width - 220);
      tip.style.left = left + 'px'; tip.style.top = (pr.top - mr.top - 74) + 'px';
      tip.classList.add('is-show');
    }
    function hide() { pins.forEach(function (p) { p.classList.remove('is-on'); }); tip.classList.remove('is-show'); }
    pins.forEach(function (pin) {
      pin.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') show(pin); });
      pin.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hide(); });
      pin.addEventListener('click', function () { pin.classList.contains('is-on') ? hide() : show(pin); });
      pin.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(pin); } });
      pin.addEventListener('blur', hide);
    });
  }

  function setupSchedule() {
    gsap.from('[data-flip]', { rotateX: -100, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.sched', start: 'top 80%' } });
    gsap.from('.sched li', { y: 20, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.sched', start: 'top 80%' } });
  }

  function setupStrip(mm) {
    var track = $('#strip .strip-track');
    mm.add('(min-width: 768px)', function () {
      track.style.overflow = 'visible';
      gsap.fromTo(track, { x: 0 }, { x: function () { return -(track.scrollWidth - window.innerWidth) - 40; }, ease: 'none',
        scrollTrigger: { trigger: '#strip', start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true } });
      $$('li', track).forEach(function (li) {
        var s = parseFloat(li.getAttribute('data-speed')) || 1;
        gsap.fromTo(li, { y: 80 * s }, { y: -80 * s, ease: 'none', scrollTrigger: { trigger: '#strip', start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      return function () { track.style.overflow = ''; };
    });
  }
  function setupStripTap() {
    $$('#strip li').forEach(function (li) {
      li.addEventListener('click', function () { li.classList.toggle('is-color'); });
    });
  }

  /* ---------------- 活動方針：固定して3場面 ---------------- */
  function setupPolicy() {
    var scene = $('#policyScene'), pin = $('.policy-pin', scene);
    var pols = $$('.pol', scene), dots = $$('.policy-dots i', scene), num = $('#policyNum');
    var bgPink = $('.pbg-pink', scene), bgBlue = $('.pbg-blue', scene);
    var words = pols.map(function (p) { return splitChars($('.pol-word', p)); });
    var cur = 0;
    gsap.set(pols, { autoAlpha: 0 }); gsap.set(pols[0], { autoAlpha: 1 });
    function go(i, down) {
      if (i === cur) return;
      var prev = cur; cur = i;
      gsap.to(words[prev], { yPercent: down ? -120 : 120, opacity: 0, stagger: 0.012, duration: 0.45, ease: 'power3.in', overwrite: true });
      gsap.to($('p', pols[prev]), { opacity: 0, duration: 0.3, overwrite: true });
      gsap.to(pols[prev], { autoAlpha: 0, duration: 0.01, delay: 0.5, overwrite: true });
      pols.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
      gsap.set(pols[i], { autoAlpha: 1, overwrite: true });
      gsap.fromTo(words[i], { yPercent: down ? 120 : -120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.02, duration: 0.8, ease: 'expo.out', delay: 0.2, overwrite: true });
      gsap.fromTo($('p', pols[i]), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.5, overwrite: true });
      scramble($('.pol-label', pols[i]), '方針 0' + (i + 1), 0.6);
      scramble(num, '0' + (i + 1), 0.5);
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
      gsap.to(bgPink, { clipPath: i >= 1 ? 'circle(150% at 85% 80%)' : 'circle(0% at 85% 80%)', duration: 0.9, ease: 'expo.inOut', overwrite: true });
      gsap.to(bgBlue, { clipPath: i >= 2 ? 'circle(150% at 15% 85%)' : 'circle(0% at 15% 85%)', duration: 0.9, ease: 'expo.inOut', overwrite: true });
      pin.setAttribute('data-scene', String(i));
    }
    ScrollTrigger.create({ trigger: scene, start: 'top top', end: 'bottom bottom',
      onUpdate: function (self) { go(Math.min(2, Math.floor(self.progress * 3)), self.direction > 0); } });
    gsap.from(words[0], { yPercent: 120, opacity: 0, stagger: 0.02, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: scene, start: 'top 60%' } });
    gsap.fromTo(num, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: scene, start: 'top 60%' } });
    // 大きな番号はスクロールで少し回る
    gsap.to('.policy-bignum', { rotate: -8, ease: 'none', scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: true } });
  }

  /* ---------------- 運営法人（1回目）：静かに ---------------- */
  function setupOrg() {
    gsap.fromTo('.org-rule', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.org', start: 'top 80%', end: 'top 35%', scrub: 0.6 } });
    $$('[data-track]').forEach(function (el) {
      gsap.fromTo(el, { letterSpacing: '0.6em', opacity: 0.15 }, { letterSpacing: '0em', opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 50%', scrub: 0.6 } });
    });
  }

  /* ---------------- 作品 ---------------- */
  function setupWorksTitle() {
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.works-title', start: 'top 85%' } });
    tl.from('.wt-arrow', { x: -220, opacity: 0, duration: 1.0, ease: 'expo.out' }, 0.25);
    gsap.to('.wt-arrow', { x: 18, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 });
    gsap.from('#galleryTrack li', { x: 300, rotate: 8, opacity: 0, stagger: 0.07, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#gallery', start: 'top 85%' } });
  }

  var dragged = false;
  function setupGallery() {
    var gal = $('#gallery'), track = $('#galleryTrack');
    if (!window.Draggable) { gal.style.overflowX = 'auto'; return; }
    function bounds() { return { minX: Math.min(0, gal.clientWidth - track.scrollWidth), maxX: 0 }; }
    var skewTo = MOTION ? gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3' }) : null;
    var lastX = 0;
    var d = Draggable.create(track, {
      type: 'x', inertia: !!window.InertiaPlugin && MOTION, bounds: bounds(), edgeResistance: 0.8,
      allowNativeTouchScrolling: true, dragClickables: true, minimumMovement: 6, zIndexBoost: false,
      onPress: function () { dragged = false; lastX = this.x; html.classList.add('is-grabbing'); },
      onDragStart: function () { dragged = true; },
      onDrag: function () { if (skewTo) skewTo(clamp((this.x - lastX) * -0.25, -8, 8)); lastX = this.x; },
      onThrowUpdate: function () { if (skewTo) skewTo(clamp((this.x - lastX) * -0.25, -8, 8)); lastX = this.x; },
      onRelease: function () { html.classList.remove('is-grabbing'); },
      onThrowComplete: function () { if (skewTo) skewTo(0); },
      onDragEnd: function () { if (skewTo && !this.tween) skewTo(0); }
    })[0];
    window.addEventListener('resize', function () { d.applyBounds(bounds()); });
    // キーボードでカードに移ったとき、見える位置まで寄せる
    $$('.card', track).forEach(function (c) {
      c.addEventListener('focus', function () {
        var gr = gal.getBoundingClientRect(), cr = c.getBoundingClientRect();
        if (cr.left < gr.left || cr.right > gr.right) {
          var b = bounds(), nx = clamp(d.x - (cr.left - gr.left) + 40, b.minX, 0);
          gsap.to(track, { x: nx, duration: MOTION ? 0.6 : 0, onUpdate: function () { d.update(); } });
        }
      });
    });
  }

  function setupPeel() {
    var cards = $$('.card');
    cards.forEach(function (card) {
      var area = $('.card-orig', card);
      var o = { pp: 0 };
      function apply() { card.style.setProperty('--pp', o.pp.toFixed(1) + 'px'); }
      if (FINE && MOTION) {
        var to = function (v) { gsap.to(o, { pp: v, duration: 0.35, ease: 'power3.out', overwrite: true, onUpdate: apply }); };
        card.addEventListener('pointermove', function (e) {
          if (e.pointerType !== 'mouse' || html.classList.contains('is-grabbing')) return;
          var r = area.getBoundingClientRect();
          var t = ((e.clientX - r.left) / r.width + (e.clientY - r.top) / r.height) / 2;
          var k = clamp((t - 0.25) / 0.75, 0, 1);
          to(20 + Math.pow(k, 1.4) * Math.min(r.width, r.height) * 0.92);
        });
        card.addEventListener('pointerleave', function () {
          gsap.to(o, { pp: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', onUpdate: apply, overwrite: true });
        });
      }
    });
  }

  function setupViewer() {
    var dlg = $('#viewer'); if (!dlg || typeof dlg.showModal !== 'function') return;
    var cmp = $('#compare'), range = $('#compareRange');
    var art = $('#compareArt'), orig = $('#compareOrig'), title = $('#viewerTitle');
    function setX(v) { cmp.style.setProperty('--x', v + '%'); }
    range.addEventListener('input', function () { setX(range.value); });
    function open(card) {
      var n = card.getAttribute('data-work');
      art.src = './assets/img/works/a' + n + '.jpg';
      orig.src = './assets/img/works/o' + n + '.jpg';
      title.textContent = '作品 ' + $('.card-meta b', card).textContent;
      cmp.classList.toggle('is-tall', card.classList.contains('card--tall'));
      dlg.showModal(); lockScroll(true);
      if (MOTION) {
        var r = card.getBoundingClientRect();
        var cx = ((r.left + r.width / 2) / window.innerWidth * 100).toFixed(1) + '%', cy = ((r.top + r.height / 2) / window.innerHeight * 100).toFixed(1) + '%';
        gsap.fromTo(dlg, { clipPath: 'circle(0% at ' + cx + ' ' + cy + ')' }, { clipPath: 'circle(150% at ' + cx + ' ' + cy + ')', duration: 0.8, ease: 'expo.inOut' });
        var o = { v: 100 };
        gsap.to(o, { v: 50, duration: 1.3, delay: 0.45, ease: 'expo.inOut', onUpdate: function () { setX(o.v); range.value = o.v; } });
        gsap.from(cmp, { scale: 0.85, rotate: -3, duration: 1, delay: 0.3, ease: 'expo.out' });
      } else { setX(50); range.value = 50; }
    }
    function close() {
      if (MOTION) gsap.to(dlg, { clipPath: 'circle(0% at 50% 50%)', duration: 0.5, ease: 'expo.in', onComplete: function () { dlg.close(); } });
      else dlg.close();
    }
    dlg.addEventListener('close', function () { lockScroll(false); dlg.style.clipPath = ''; });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    $('[data-close]', dlg).addEventListener('click', close);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });

    $$('.card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (dragged) { dragged = false; e.preventDefault(); return; }
        var keyboard = e.detail === 0;
        if (!FINE && !keyboard && !card.classList.contains('is-flipped')) {
          // スマホ：1回目のタップは原画をめくって作品を見せる
          card.classList.add('is-flipped');
          clearTimeout(card._ft); card._ft = setTimeout(function () { card.classList.remove('is-flipped'); }, 4500);
          return;
        }
        clearTimeout(card._ft); card.classList.remove('is-flipped');
        open(card);
      });
    });
  }

  /* ---------------- 展開：輪が広がる ---------------- */
  function setupFuture() {
    gsap.set('.rings i, .rings-core', { xPercent: -50, yPercent: -50, x: 0, y: 0 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: '#futureScene', start: 'top top', end: 'bottom bottom', scrub: 0.7 } });
    tl.from('.rings i', { scale: 0, opacity: 0, stagger: 0.16, duration: 0.35, ease: 'power2.out' }, 0)
      .from('.rings-core', { scale: 0.2, duration: 0.3, ease: 'back.out(2)' }, 0)
      .to('.rings', { rotate: 120, duration: 1, ease: 'none' }, 0)
      .to('.rings-core', { rotate: -120, duration: 1, ease: 'none' }, 0)
      .from('.future-list li', { x: 120, opacity: 0, stagger: 0.16, duration: 0.25, ease: 'power3.out' }, 0.08)
      .from('.future-note', { opacity: 0, duration: 0.15 }, 0.85);
    gsap.to('.rings i:nth-child(1)', { scale: 1.15, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* ---------------- パートナー ---------------- */
  function setupLogos() {
    $$('.logos li').forEach(function (li) {
      function pos(e) { var r = li.getBoundingClientRect(); li.style.setProperty('--mx', (e.clientX - r.left) + 'px'); li.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
      li.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; pos(e); li.classList.add('is-on'); });
      li.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'mouse') return; pos(e); li.classList.remove('is-on'); });
      li.addEventListener('click', function (e) { if (FINE) return; pos(e); li.classList.toggle('is-on'); });
    });
  }
  function setupPartnersMotion() {
    gsap.from('.logos li', { y: 60, opacity: 0, rotate: function (i) { return (i % 2 ? 4 : -4); }, stagger: 0.08, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.logos', start: 'top 85%' } });
    gsap.from('.recruit-list li', { x: -40, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.recruit-list', start: 'top 80%' } });
  }

  /* ---------------- レンタル ---------------- */
  function setupStack() {
    var cards = $$('.stack-card');
    cards.forEach(function (c, i) {
      c.style.setProperty('--i', i);
      gsap.fromTo($('.sc-shape', c), { rotate: -40, scale: 0.6 }, { rotate: 40, scale: 1.1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from($('p', c), { yPercent: 40, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%' } });
      var next = cards[i + 1];
      if (next) {
        gsap.to(c, { scale: 0.92 - (cards.length - i) * 0.01, rotate: i % 2 ? 1.5 : -1.5, ease: 'none', transformOrigin: '50% 0%',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true } });
      }
    });
  }
  function setupCtaFill() {
    $$('.cta-btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
      b.addEventListener('pointerenter', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
  }
  function setupShare() {
    var fills = $$('.sb-fill'), nums = $$('.sb [data-count]');
    gsap.from(fills, { scaleY: 0, stagger: 0.15, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#share', start: 'top 80%' } });
    nums.forEach(function (n) {
      var to = parseInt(n.getAttribute('data-count'), 10), o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#share', start: 'top 80%' }, onUpdate: function () { n.textContent = Math.round(o.v); } });
    });
    gsap.from('.cta-btn', { y: 80, opacity: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 85%' } });
  }

  /* ---------------- 最後：巨大なONEART ---------------- */
  function setupGiant() {
    var letters = $$('#giant span');
    if (MOTION) {
      gsap.from(letters, { yPercent: 100, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '#giant', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
    }
    letters.forEach(function (l) {
      function hop() {
        l.classList.add('is-hot');
        clearTimeout(l._t); l._t = setTimeout(function () { l.classList.remove('is-hot'); }, 1400);
        if (MOTION) gsap.fromTo(l, { y: 0 }, { y: function () { return -l.offsetHeight * 0.14; }, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1, overwrite: 'auto' });
      }
      l.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hop(); });
      l.addEventListener('click', hop);
    });
  }

  /* ---------------- 背景色の切り替え・章の表示・進み具合 ---------------- */
  function setupThemes() {
    var map = { paper: COLORS.paper, ink: COLORS.ink, blue: COLORS.blue, yellow: COLORS.yellow };
    var meta = $('meta[name="theme-color"]');
    var numEl = $('#chapterNum'), nameEl = $('#chapterName');
    html.classList.add('theme-js');
    $$('.sec').forEach(function (sec) {
      ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) {
        if (!self.isActive) return;
        var c = map[sec.getAttribute('data-theme')] || COLORS.paper;
        gsap.to(document.body, { backgroundColor: c, duration: 0.7, ease: 'power2.out', overwrite: true });
        if (meta) meta.setAttribute('content', c);
        if (numEl.textContent !== sec.getAttribute('data-chapter')) {
          scramble(numEl, sec.getAttribute('data-chapter'), 0.4);
          scramble(nameEl, sec.getAttribute('data-chapter-name'), 0.7);
        }
      } });
    });
  }
  function setupProgress() {
    var bar = $('#progressBar');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { bar.style.transform = 'scaleX(' + s.progress.toFixed(4) + ')'; } });
  }

  /* ---------------- カーソル（PCのみ） ---------------- */
  function setupCursor() {
    if (!(FINE && MOTION)) return;
    var cur = $('#cursor'), ring = $('.cursor-ring', cur), dot = $('.cursor-dot', cur), label = $('.cursor-label', cur);
    html.classList.add('has-cursor');
    var rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    var dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    gsap.set(cur, { opacity: 0 });
    var shown = false;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (!shown) { shown = true; gsap.set([ring, dot], { x: e.clientX, y: e.clientY }); gsap.to(cur, { opacity: 1, duration: 0.3 }); }
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
    }, { passive: true });
    window.addEventListener('mouseout', function (e) { if (!e.relatedTarget) { shown = false; gsap.to(cur, { opacity: 0, duration: 0.2 }); } });
    window.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    window.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
    var state = '';
    document.addEventListener('pointerover', function (e) {
      var t = e.target, s = '', text = '';
      if (t.closest('.card')) { s = 'open'; text = 'OPEN'; }
      else if (t.closest('#gallery')) { s = 'drag'; text = 'DRAG'; }
      else if (t.closest('a, button, [role="button"], input, .logos li, #giant span, .strip li')) { s = 'link'; }
      else if (t.closest('#hero')) { s = 'paint'; text = 'PAINT'; }
      if (s === state) return;
      state = s;
      cur.className = 'cursor' + (s ? ' is-' + s : '');
      label.textContent = text;
    });
  }

  /* ---------------- 磁石のように吸い付くボタン（PCのみ） ---------------- */
  function setupMagnetic() {
    if (!(FINE && MOTION)) return;
    $$('[data-magnetic]').forEach(function (el) {
      var inner = $('.btn-text, .cta-label, .menu-btn-label', el);
      var strength = el.classList.contains('cta-btn') ? 0.18 : 0.38;
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = el.getBoundingClientRect();
        var cx = r.left + r.width / 2 - (gsap.getProperty(el, 'x') || 0), cy = r.top + r.height / 2 - (gsap.getProperty(el, 'y') || 0);
        var mx = e.clientX - cx, my = e.clientY - cy;
        gsap.to(el, { x: mx * strength, y: my * strength * 1.2, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        if (inner) gsap.to(inner, { x: mx * 0.12, y: my * 0.12, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
      });
    });
  }

  /* ---------------- 全画面メニュー ---------------- */
  var menuOpen = false;
  function setupMenu() {
    var btn = $('#menuBtn'), menu = $('#menu'), links = $$('.menu-nav a', menu), plates = $$('.menu-bg i', menu);
    var label = $('.menu-btn-label', btn);
    function setPlate(name) { plates.forEach(function (p) { gsap.to(p, { scale: p.getAttribute('data-plate') === name ? 1 : 0, duration: 0.7, ease: 'expo.out', overwrite: true }); }); }
    function open() {
      menuOpen = true; html.classList.add('menu-open');
      btn.setAttribute('aria-expanded', 'true'); menu.removeAttribute('inert'); menu.setAttribute('aria-hidden', 'false');
      menu.classList.add('is-open'); lockScroll(true); label.textContent = 'CLOSE';
      if (MOTION) {
        gsap.fromTo(menu, { clipPath: 'circle(0% at calc(100% - 50px) 36px)' }, { clipPath: 'circle(150% at calc(100% - 50px) 36px)', duration: 0.9, ease: 'expo.inOut', overwrite: true });
        gsap.fromTo($$('.mt', menu), { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, stagger: 0.045, duration: 0.9, ease: 'expo.out', delay: 0.25, overwrite: true });
        gsap.fromTo($$('.mn', menu), { opacity: 0 }, { opacity: 0.6, stagger: 0.045, duration: 0.6, delay: 0.4 });
        setPlate('pink');
      }
      setTimeout(function () { links[0].focus({ preventScroll: true }); }, MOTION ? 300 : 0);
    }
    function close(cb) {
      menuOpen = false; html.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false'); menu.setAttribute('inert', ''); menu.setAttribute('aria-hidden', 'true');
      label.textContent = 'MENU'; lockScroll(false);
      function done() { menu.classList.remove('is-open'); menu.style.clipPath = ''; if (cb) cb(); }
      if (MOTION) gsap.to(menu, { clipPath: 'circle(0% at calc(100% - 50px) 36px)', duration: 0.6, ease: 'expo.inOut', overwrite: true, onComplete: done });
      else done();
    }
    btn.addEventListener('click', function () { menuOpen ? close() : open(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { close(); btn.focus(); } });
    links.forEach(function (a) {
      a.addEventListener('pointerenter', function () { if (MOTION) setPlate(a.getAttribute('data-plate')); });
      a.addEventListener('touchstart', function () { if (MOTION) setPlate(a.getAttribute('data-plate')); }, { passive: true });
      a.addEventListener('focus', function () { if (MOTION) setPlate(a.getAttribute('data-plate')); });
    });
    return { close: close, isOpen: function () { return menuOpen; } };
  }

  /* ---------------- ページ内移動（幕が横切る切り替え演出） ---------------- */
  function setupNav(menuApi) {
    var bars = $$('#wipe i'), busy = false;
    function go(target) {
      if (!MOTION) { scrollToTarget(target, true); focusTarget(target); return; }
      if (busy) return; busy = true;
      var tl = gsap.timeline({ onComplete: function () { busy = false; } });
      tl.fromTo(bars, { yPercent: 101 }, { yPercent: 0, stagger: 0.07, duration: 0.55, ease: 'expo.inOut' })
        .add(function () { scrollToTarget(target, true); ScrollTrigger.update(); focusTarget(target); })
        .to(bars, { yPercent: -101, stagger: 0.07, duration: 0.6, ease: 'expo.inOut' }, '+=0.12')
        .set(bars, { yPercent: 101 });
    }
    function focusTarget(t) { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    $$('[data-nav]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (!id || id.charAt(0) !== '#') return;
        var target = document.querySelector(id); if (!target) return;
        e.preventDefault();
        if (menuApi.isOpen()) menuApi.close();
        go(target);
      });
    });
  }

  /* ---------------- 未設定リンク ---------------- */
  function setupPending() {
    $$('[data-pending]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); toast('リンク未設定です（外部ページのURL受領後に接続します）'); });
    });
  }

  /* ---------------- タップした所に網点のスタンプ ---------------- */
  function setupStamps() {
    if (!MOTION) return;
    var layer = $('#stamps'), down = null, n = 0;
    window.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY, t: performance.now(), target: e.target }; }, { passive: true });
    window.addEventListener('pointerup', function (e) {
      if (!down) return;
      var moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t, t = down.target; down = null;
      if (moved > 10 || dt > 400) return;
      if (t.closest && t.closest('a, button, input, [role="button"], #hero, #gallery, .logos li, #giant, .strip li, dialog, .menu')) return;
      if (n > 40) return;
      var cols = [COLORS.pink, COLORS.yellow, COLORS.blue];
      for (var i = 0; i < 9; i++) {
        var d = document.createElement('i'); d.className = 'stamp-dot';
        var size = 8 + Math.random() * 26; d.style.width = d.style.height = size + 'px';
        d.style.background = cols[i % 3]; layer.appendChild(d); n++;
        var ang = Math.random() * Math.PI * 2, dist = 30 + Math.random() * 90;
        gsap.fromTo(d, { x: e.clientX - size / 2, y: e.clientY - size / 2, scale: 0 },
          { x: e.clientX - size / 2 + Math.cos(ang) * dist, y: e.clientY - size / 2 + Math.sin(ang) * dist, scale: 1, duration: 0.7, ease: 'expo.out',
            onComplete: (function (el) { return function () { gsap.to(el, { scale: 0, opacity: 0, duration: 0.6, delay: 0.3, onComplete: function () { el.remove(); n--; } }); }; })(d) });
      }
    });
  }

  /* =====================================================================
     起動
     ===================================================================== */
  function init() {
    if ('scrollRestoration' in history && MOTION) history.scrollRestoration = 'manual';
    if (MOTION && !location.hash) window.scrollTo(0, 0);

    safe('scroll', setupScroll);
    safe('hero', setupHero);
    var menuApi = { close: function () {}, isOpen: function () { return false; } };
    safe('menu', function () { menuApi = setupMenu(); });
    safe('nav', function () { setupNav(menuApi); });
    safe('pending', setupPending);
    safe('mapPins', setupMapPins);
    safe('stripTap', setupStripTap);
    safe('logos', setupLogos);
    safe('ctaFill', setupCtaFill);
    safe('giant', setupGiant);
    if (HAS_GSAP) safe('gallery', setupGallery);
    safe('viewer', setupViewer);

    // 網点（静止画なので動きなしでも描く）
    var ht = window.OneartHalftone ? window.OneartHalftone.renderAll() : Promise.resolve();
    var lastW = window.innerWidth, rzT = 0;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return; lastW = window.innerWidth;
      clearTimeout(rzT); rzT = setTimeout(function () { if (window.OneartHalftone) window.OneartHalftone.renderAll(); }, 250);
    });

    if (!MOTION) { html.setAttribute('data-ready', '1'); return; }

    var mm = gsap.matchMedia();
    safe('themes', setupThemes);
    safe('progress', setupProgress);
    safe('cursor', setupCursor);
    safe('magnetic', setupMagnetic);
    safe('reveals', setupReveals);
    safe('process', function () { setupProcess(mm); });
    safe('marquees', setupMarquees);
    safe('sapporo', function () { setupSapporo(mm); });
    safe('schedule', setupSchedule);
    safe('strip', function () { setupStrip(mm); });
    safe('policy', setupPolicy);
    safe('org', setupOrg);
    safe('worksTitle', setupWorksTitle);
    safe('peel', setupPeel);
    safe('future', setupFuture);
    safe('partners', setupPartnersMotion);
    safe('stack', setupStack);
    safe('share', setupShare);
    safe('stamps', setupStamps);

    // 中身の大きさが決まってから位置を測り直す
    Promise.all([ht, document.fonts ? document.fonts.ready : null]).then(function () { ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });

    runLoader(function () { safe('heroIntro', heroIntro); html.setAttribute('data-ready', '1'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
