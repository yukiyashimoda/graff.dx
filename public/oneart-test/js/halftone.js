/* =====================================================================
   網点（ハーフトーン）描画
   粗い資料写真を、canvas上で「2色刷りの網点」に刷り直す。
   元画像の解像度に関係なく点がくっきり出るので、大きく使っても粗さが目立ちにくい。
   - 1回描くだけ（毎フレーム描かない）。サイズが変わったときだけ描き直す。
   - file:// で開いたときなど画像を読めない場合は、何もせず元の<img>を見せる。
   ===================================================================== */
(function () {
  'use strict';

  var cache = {};
  function loadImage(src) {
    if (!cache[src]) {
      cache[src] = new Promise(function (resolve, reject) {
        var img = new Image();
        img.decoding = 'async';
        img.onload = function () { resolve(img); };
        img.onerror = reject;
        img.src = src;
      });
    }
    return cache[src];
  }

  /* 画像を cover で sample キャンバスに描き、明るさの配列を返す */
  function sampleLuma(img, cols, rows) {
    var c = document.createElement('canvas');
    c.width = cols; c.height = rows;
    var x = c.getContext('2d', { willReadFrequently: true });
    var ir = img.naturalWidth / img.naturalHeight, cr = cols / rows;
    var sw, sh, sx, sy;
    if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) / 2; sy = 0; }
    else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) / 2; }
    x.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
    var d = x.getImageData(0, 0, cols, rows).data; // file:// では例外（呼び出し側で処理）
    var out = new Float32Array(cols * rows);
    for (var i = 0, j = 0; i < out.length; i++, j += 4) {
      out[i] = (0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2]) / 255;
    }
    return out;
  }

  /* 1つの版を描く：角度 angle の網目で、濃さ density(u,v) に応じた点 */
  function drawPlate(ctx, W, H, cell, angle, color, densityAt, offX, offY) {
    var cos = Math.cos(angle), sin = Math.sin(angle);
    var diag = Math.sqrt(W * W + H * H);
    var n = Math.ceil(diag / cell) + 2;
    var cx = W / 2, cy = H / 2, maxR = cell * 0.74;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var gy = -n / 2; gy < n / 2; gy++) {
      for (var gx = -n / 2; gx < n / 2; gx++) {
        var lx = gx * cell, ly = gy * cell;
        var px = cx + lx * cos - ly * sin + offX;
        var py = cy + lx * sin + ly * cos + offY;
        if (px < -cell || py < -cell || px > W + cell || py > H + cell) continue;
        var dens = densityAt(px / W, py / H);
        if (dens < 0.04) continue;
        var r = Math.sqrt(dens) * maxR;
        ctx.moveTo(px + r, py);
        ctx.arc(px, py, r, 0, 6.2832);
      }
    }
    ctx.fill();
  }

  /**
   * canvas に網点を描く
   * data-halftone : 画像のパス
   * data-ink      : 暗部を刷る色（主版）
   * data-tint     : 中間調に重ねる色（色版）
   * data-paper    : 紙の色
   * data-cell     : 網目の大きさ（CSS px）
   */
  function render(canvas) {
    var src = canvas.getAttribute('data-halftone');
    var box = canvas.parentElement;
    var rect = box.getBoundingClientRect();
    var Wc = Math.max(1, Math.round(rect.width)), Hc = Math.max(1, Math.round(rect.height));
    if (Wc < 4 || Hc < 4) return Promise.resolve(false);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cell = parseFloat(canvas.getAttribute('data-cell') || (Wc > 900 ? 9 : 6.5)) * dpr;
    var ink = canvas.getAttribute('data-ink') || '#141414';
    var tint = canvas.getAttribute('data-tint') || '#ff4fa3';
    var paper = canvas.getAttribute('data-paper') || '#f1ece1';

    return loadImage(src).then(function (img) {
      var W = Math.round(Wc * dpr), H = Math.round(Hc * dpr);
      var cols = Math.max(8, Math.round(W / cell * 1.5)), rows = Math.max(8, Math.round(H / cell * 1.5));
      var luma;
      try { luma = sampleLuma(img, cols, rows); }
      catch (e) { return false; } // 読めない環境では元の写真のまま
      canvas.width = W; canvas.height = H;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);
      function at(u, v) {
        var x = Math.min(cols - 1, Math.max(0, (u * cols) | 0));
        var y = Math.min(rows - 1, Math.max(0, (v * rows) | 0));
        return luma[y * cols + x];
      }
      // 色版：中間調〜暗部に広く（少しずらして刷る＝版ズレ）
      ctx.globalCompositeOperation = 'multiply';
      drawPlate(ctx, W, H, cell * 1.1, 0.26, tint, function (u, v) {
        var l = at(u, v); return Math.min(1, Math.max(0, (0.92 - l) * 1.25));
      }, cell * 0.35, -cell * 0.2);
      // 主版：暗部だけ（コントラスト強め）
      drawPlate(ctx, W, H, cell, 0.785, ink, function (u, v) {
        var l = at(u, v); return Math.min(1, Math.max(0, Math.pow(1 - l, 2.1) * 1.25 - 0.04));
      }, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      box.classList.add('ht-ready');
      return true;
    }).catch(function () { return false; });
  }

  function renderAll(root) {
    var list = Array.prototype.slice.call((root || document).querySelectorAll('canvas[data-halftone]'));
    return Promise.all(list.map(render));
  }

  window.OneartHalftone = { render: render, renderAll: renderAll };
})();
