/* =====================================================================
   最初の画面の WebGL インク（自作・外部ライブラリなし）
   - なぞった所に「版の色（ピンク／黄／青）」の絵の具が置かれ、
     ゆっくり流れ、紙へのにじみ・顔料の粒状感・乾き際の縁を描く。
   - 触っていない間は、見えない筆が自動で描き続ける。
   - 低解像度のシミュレーション＋1回の表示描画だけ（毎フレーム2回の描画）。
   - 画面外・タブ非表示のときは止める。WebGLが無ければ null を返す（呼び出し側が静止画に切り替え）。
   ===================================================================== */
(function () {
  'use strict';

  var VERT = 'attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.0,1.0);}';

  var NOISE = [
    'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}',
    'float snoise(vec2 v){',
    ' const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);',
    ' vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);',
    ' vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);',
    ' vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);',
    ' vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));',
    ' vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);',
    ' m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;',
    ' m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);',
    ' vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}',
    'vec2 curl(vec2 p){float e=0.02;',
    ' float a=snoise(p+vec2(0.0,e)),b=snoise(p-vec2(0.0,e)),c=snoise(p+vec2(e,0.0)),d=snoise(p-vec2(e,0.0));',
    ' return vec2(a-b,-(c-d))/(2.0*e);}'
  ].join('\n');

  var SIM = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif',
    'varying vec2 vUv;',
    'uniform sampler2D uSrc;uniform float uAspect;uniform float uTime;uniform float uDt;',
    'uniform float uDecay;uniform float uSub;',
    'uniform vec4 uSegA[4];uniform vec4 uSegC[4];',
    'uniform vec4 uPush;uniform float uPushR;',
    NOISE,
    'float segDist(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.0,1.0);return length(pa-ba*h);}',
    'void main(){',
    ' vec2 asp=vec2(uAspect,1.0);vec2 p=vUv*asp;',
    ' vec2 flow=curl(p*1.4+vec2(0.0,uTime*0.04))*0.00075+curl(p*3.6-uTime*0.07)*0.0003;',
    ' vec2 d=(vUv-uPush.xy)*asp;float g=exp(-dot(d,d)/(uPushR*uPushR));',
    ' flow+=uPush.zw*g*0.85;',
    ' vec4 col=texture2D(uSrc,vUv-flow*uDt);',
    ' col.rgb=max(col.rgb*uDecay-uSub,0.0);',
    ' float rough=snoise(p*26.0+uTime*0.3);',
    ' for(int i=0;i<4;i++){',
    '  vec4 s=uSegA[i];vec4 c=uSegC[i];',
    '  if(c.a>0.0){',
    '   float dd=segDist(p,s.xy*asp,s.zw*asp)+rough*c.a*0.28;',
    '   float a=1.0-smoothstep(c.a*0.4,c.a,dd);',
    '   col.rgb+=c.rgb*a*0.22*uDt;',
    '  }',
    ' }',
    ' gl_FragColor=vec4(min(col.rgb,vec3(1.25)),1.0);',
    '}'
  ].join('\n');

  var DISPLAY = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif',
    'varying vec2 vUv;',
    'uniform sampler2D uDye;uniform vec2 uResolution;uniform vec2 uMis;',
    'uniform vec3 uPaper;uniform vec3 uPink;uniform vec3 uYellow;uniform vec3 uBlue;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    NOISE,
    'vec3 wash(vec2 uv){return max(texture2D(uDye,uv).rgb,vec3(0.0));}',
    'void main(){',
    ' vec2 frag=gl_FragCoord.xy;',
    ' vec2 paper=frag/uResolution.y;',
    ' float cloud=snoise(paper*11.0)*0.55+snoise(paper*29.0)*0.30+snoise(paper*73.0)*0.15;',
    ' vec2 warp=vec2(snoise(paper*39.0),snoise(paper*39.0+17.0))*0.0016;',
    ' vec2 uv=vUv+warp;vec2 px=vec2(2.5)/uResolution;',
    ' vec3 dye=wash(uv);',
    ' vec3 wet=(wash(uv+vec2(px.x,0.0))+wash(uv-vec2(px.x,0.0))+wash(uv+vec2(0.0,px.y))+wash(uv-vec2(0.0,px.y)))*0.25;',
    ' vec3 edge=abs(dye-wet)*2.8;',
    ' vec3 rim=smoothstep(vec3(0.015),vec3(0.12),dye)*(vec3(1.0)-smoothstep(vec3(0.12),vec3(0.38),dye))*0.09;',
    ' float grain=snoise(paper*240.0)*0.045;',
    ' vec3 pigment=max(mix(dye,wet,0.35)*(0.70+cloud*0.27+grain)+edge+rim,vec3(0.0));',
    ' vec3 density=vec3(1.0)-exp(-pigment*1.65);',
    ' vec3 col=uPaper;',
    ' col*=mix(vec3(1.0),uYellow,density.g);',
    ' col*=mix(vec3(1.0),uPink,density.r);',
    ' col*=mix(vec3(1.0),uBlue,density.b);',
    ' col+=(hash(floor(frag))-0.5)*0.018;',
    ' gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  function hex(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }
  var PLATES = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // pink, yellow, blue（色の量を各チャンネルに持つ）

  function create(canvas, opts) {
    opts = opts || {};
    var reduced = !!opts.reduced;
    var host = opts.host || canvas.parentElement;
    var gl = null, isGL2 = false;
    var attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    try {
      gl = canvas.getContext('webgl2', attrs);
      if (gl) isGL2 = true; else gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
    } catch (e) { gl = null; }
    if (!gl) return null;

    function compile(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(s)); }
      return s;
    }
    function program(fs) {
      var p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, 'aPos');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); var name = info.name.replace(/\[0\]$/, ''); u[name] = gl.getUniformLocation(p, info.name); }
      return { p: p, u: u };
    }

    var simP, dispP;
    try { simP = program(SIM); dispP = program(DISPLAY); } catch (e) { if (window.console) console.warn('[ink] shader', e.message); return null; }

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    /* ---- テクスチャ形式：半精度浮動小数を優先、無理なら8bit ---- */
    var fmt = null;
    function tryFormat(internal, format, type, filter) {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, type, null);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(fb); gl.deleteTexture(t);
      return ok;
    }
    if (isGL2) {
      var cbf = gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float');
      if (cbf && tryFormat(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR)) fmt = { i: gl.RGBA16F, f: gl.RGBA, t: gl.HALF_FLOAT, float: true };
    } else {
      var hf = gl.getExtension('OES_texture_half_float');
      var hfl = gl.getExtension('OES_texture_half_float_linear');
      gl.getExtension('EXT_color_buffer_half_float');
      if (hf && hfl && tryFormat(gl.RGBA, gl.RGBA, hf.HALF_FLOAT_OES, gl.LINEAR)) fmt = { i: gl.RGBA, f: gl.RGBA, t: hf.HALF_FLOAT_OES, float: true };
    }
    if (!fmt) fmt = { i: gl.RGBA, f: gl.RGBA, t: gl.UNSIGNED_BYTE, float: false };

    var simW = 0, simH = 0, targets = [], cur = 0;
    function makeTarget(w, h) {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, fmt.i, w, h, 0, fmt.f, fmt.t, null);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex: t, fb: fb };
    }
    function freeTargets() { targets.forEach(function (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); }); targets = []; }

    var dpr = 1, cssW = 0, cssH = 0, aspect = 1;
    function resize(force) {
      var r = host.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      var widthChanged = w !== cssW;
      cssW = w; cssH = h; aspect = w / h;
      dpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 2 : 1.5);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      // スマホのアドレスバー伸縮（高さだけの変化）では絵を消さない
      if (force || widthChanged || !targets.length) {
        var sw = Math.round(Math.min(420, w / 3.2)), sh = Math.max(1, Math.round(sw / aspect));
        freeTargets(); simW = sw; simH = sh;
        targets = [makeTarget(sw, sh), makeTarget(sw, sh)]; cur = 0;
        return true;
      }
      return false;
    }

    /* ---- 入力（ポインター・タッチ）と自動の筆 ---- */
    var plate = 0, lastInput = -1e9, startT = performance.now();
    var pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, down: false, active: false, moved: false };
    var burst = null;
    var brushes = [
      { plate: 0, a: 0.37, b: 0.53, ph: 0.0, prev: null },
      { plate: 2, a: 0.29, b: 0.41, ph: 2.1, prev: null },
      { plate: 1, a: 0.23, b: 0.61, ph: 4.2, prev: null }
    ];
    function brushPos(b, t) {
      return {
        x: 0.5 + 0.36 * Math.sin(t * b.a + b.ph) + 0.1 * Math.sin(t * b.b * 2.3 + b.ph * 1.7),
        y: 0.52 + 0.3 * Math.cos(t * b.b + b.ph * 0.7) + 0.08 * Math.sin(t * b.a * 3.1)
      };
    }

    function toUv(clientX, clientY) {
      var r = canvas.getBoundingClientRect();
      return { x: (clientX - r.left) / r.width, y: 1 - (clientY - r.top) / r.height, inside: clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom };
    }
    function onMove(x, y) {
      var u = toUv(x, y);
      if (!u.inside) { pointer.active = false; return; }
      if (!pointer.active) { pointer.px = u.x; pointer.py = u.y; }
      pointer.x = u.x; pointer.y = u.y; pointer.active = true; pointer.moved = true;
      lastInput = performance.now();
    }
    function onPointerMove(e) { if (e.pointerType === 'touch') return; onMove(e.clientX, e.clientY); }
    function onTouch(e) { var t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }
    function onTouchEnd() { pointer.active = false; }
    function onLeave() { pointer.active = false; }
    function onClick(e) {
      if (e.target.closest && e.target.closest('a,button')) return;
      var u = toUv(e.clientX, e.clientY); if (!u.inside) return;
      cyclePlate();
      burst = { x: u.x, y: u.y, n: 6 };
      lastInput = performance.now();
    }

    function cyclePlate() { plate = (plate + 1) % 3; if (opts.onPlate) opts.onPlate(plate); }

    /* ---- 1ステップ進める ---- */
    var segA = new Float32Array(16), segC = new Float32Array(16);
    function step(t, dt, autoAmt) {
      segA.fill(0); segC.fill(0);
      var k = 0;
      // 利用者の筆
      if (pointer.active && pointer.moved) {
        var c = PLATES[plate];
        segA.set([pointer.px, pointer.py, pointer.x, pointer.y], 0);
        var spd = Math.min(1, Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py) * 30);
        segC.set([c[0] * 1.6, c[1] * 1.6, c[2] * 1.6, 0.045 + spd * 0.03], 0);
        k = 1;
      }
      if (burst && k < 4) {
        var bc = PLATES[plate];
        segA.set([burst.x, burst.y, burst.x + 0.001, burst.y], k * 4);
        segC.set([bc[0] * 3, bc[1] * 3, bc[2] * 3, 0.12], k * 4);
        k++; burst.n--; if (burst.n <= 0) burst = null;
      }
      // 自動の筆
      if (autoAmt > 0.01) {
        for (var i = 0; i < brushes.length && k < 4; i++) {
          var b = brushes[i], p = brushPos(b, t * 0.001);
          if (b.prev) {
            var bcol = PLATES[b.plate];
            var rr = 0.03 + 0.022 * (0.5 + 0.5 * Math.sin(t * 0.0013 + b.ph));
            segA.set([b.prev.x, b.prev.y, p.x, p.y], k * 4);
            segC.set([bcol[0] * autoAmt, bcol[1] * autoAmt, bcol[2] * autoAmt, rr], k * 4);
            k++;
          }
          b.prev = p;
        }
      } else { brushes.forEach(function (b) { b.prev = null; }); }

      var src = targets[cur], dst = targets[1 - cur];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, simW, simH);
      gl.useProgram(simP.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform1i(simP.u.uSrc, 0);
      gl.uniform1f(simP.u.uAspect, aspect);
      gl.uniform1f(simP.u.uTime, t * 0.001);
      gl.uniform1f(simP.u.uDt, dt);
      // 半精度：掛け算で薄れる／8bit：引き算で薄れる（8bitは掛け算だと薄れきらないため）
      gl.uniform1f(simP.u.uDecay, fmt.float ? Math.pow(0.9975, dt) : 1.0);
      gl.uniform1f(simP.u.uSub, fmt.float ? 0.0002 * dt : (1.2 / 255) * dt);
      gl.uniform4fv(simP.u.uSegA, segA);
      gl.uniform4fv(simP.u.uSegC, segC);
      var vx = 0, vy = 0;
      if (pointer.active && pointer.moved) { vx = Math.max(-0.05, Math.min(0.05, pointer.x - pointer.px)); vy = Math.max(-0.05, Math.min(0.05, pointer.y - pointer.py)); }
      gl.uniform4f(simP.u.uPush, pointer.x, pointer.y, vx, vy);
      gl.uniform1f(simP.u.uPushR, 0.09);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      cur = 1 - cur;
      pointer.px = pointer.x; pointer.py = pointer.y; pointer.moved = false;
    }

    var mis = [0, 0];
    function draw() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(dispP.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, targets[cur].tex);
      gl.uniform1i(dispP.u.uDye, 0);
      gl.uniform2f(dispP.u.uResolution, canvas.width, canvas.height);
      gl.uniform2f(dispP.u.uMis, mis[0], mis[1]);
      var P = hex('#f1ece1'), PK = hex('#ff4fa3'), Y = hex('#ffe500'), B = hex('#2f52ff');
      gl.uniform3f(dispP.u.uPaper, P[0], P[1], P[2]);
      gl.uniform3f(dispP.u.uPink, PK[0], PK[1], PK[2]);
      gl.uniform3f(dispP.u.uYellow, Y[0], Y[1], Y[2]);
      gl.uniform3f(dispP.u.uBlue, B[0], B[1], B[2]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /* 最初の絵：見えない筆で先に描いておく（読み込み演出が終わった時に絵がある状態） */
    function preroll(n) {
      var t = 0;
      for (var i = 0; i < n; i++) { t += 16.7; step(t + 20000, 1, 1.4); }
    }

    resize(true);
    preroll(reduced ? 200 : 110);
    draw();

    var running = false, visible = true, raf = 0, last = 0, simT = 20000 + 110 * 16.7;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min(3, (now - (last || now)) / 16.667); last = now;
      if (dt <= 0) return;
      simT += dt * 16.667;
      var idle = now - lastInput;
      var autoAmt = idle > 2200 ? Math.min(1, (idle - 2200) / 1500) * 0.9 : 0;
      // 版ズレ：動きに合わせて少しずれる
      var tx = (pointer.active ? (pointer.x - 0.5) : Math.sin(now * 0.0004) * 0.3) * 0.004;
      var ty = (pointer.active ? (pointer.y - 0.5) : Math.cos(now * 0.0005) * 0.3) * 0.004;
      mis[0] += (tx - mis[0]) * 0.08; mis[1] += (ty - mis[1]) * 0.08;
      step(simT, dt, autoAmt);
      draw();
    }
    function start() { if (running || reduced) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    if (!reduced) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      host.addEventListener('pointerleave', onLeave);
      host.addEventListener('touchstart', onTouch, { passive: true });
      host.addEventListener('touchmove', onTouch, { passive: true });
      host.addEventListener('touchend', onTouchEnd, { passive: true });
      host.addEventListener('click', onClick);
      var io = new IntersectionObserver(function (ents) {
        visible = ents[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { threshold: 0 });
      io.observe(canvas);
      document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) start(); });
    }

    var rzT = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rzT);
      rzT = setTimeout(function () { var reset = resize(false); if (reset) preroll(60); draw(); }, 150);
    });

    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop(); if (opts.onLost) opts.onLost(); });

    return {
      start: start, stop: stop, cyclePlate: cyclePlate,
      get plate() { return plate; },
      format: fmt.float ? 'half-float' : '8bit',
      gl2: isGL2
    };
  }

  window.OneartInk = { create: create };
})();
