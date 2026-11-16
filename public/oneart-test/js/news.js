/* =====================================================================
   お知らせ・活動記録（09）
   data/news.json（scripts/fetch_news.py が you-make.org から取得して保存）を読み、
   種別ごとに新しい順で数件ずつ描画する。ブラウザから you-make.org のAPIは呼ばない。
   ===================================================================== */
(function () {
  'use strict';
  var box = document.getElementById('newsGroups');
  if (!box) return;

  var GROUPS = [
    { key: 'blog',    label: '活動ブログ',       en: 'ACTIVITY BLOG', n: 3, plate: 'pink' },
    { key: 'report',  label: '開催結果報告',     en: 'EVENT REPORT',  n: 3, plate: 'yellow' },
    { key: 'press',   label: 'プレスリリース',   en: 'PRESS RELEASE', n: 3, plate: 'pink' },
    { key: 'media',   label: 'メディア掲載',     en: 'MEDIA',         n: 3, plate: 'yellow' },
    { key: 'gallery', label: '作品ギャラリー',   en: 'GALLERY',       n: 8, plate: 'pink' }
  ];

  // リンク・画像は公式サイト(https://you-make.org/)のものだけを受け付ける
  function safeUrl(u) {
    try { var x = new URL(u); return x.protocol === 'https:' && (x.hostname === 'you-make.org' || x.hostname === 'www.you-make.org') ? x.href : ''; }
    catch (e) { return ''; }
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function fmtDate(d) { return String(d || '').replace(/-/g, '.'); }

  function card(it, g) {
    var href = safeUrl(it.url);
    if (!href) return null;
    var li = el('li', 'news-item');
    var a = el('a', 'news-card');
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.setAttribute('data-cursor', 'link');
    a.setAttribute('aria-label', it.title + '（ゆめいく公式サイトの記事。新しいタブで開きます）');
    var fig = el('span', 'news-thumb'); fig.setAttribute('data-plate', g.plate);
    var src = safeUrl(it.thumbnail || it.image);
    if (src) {
      var img = el('img'); img.src = src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      img.addEventListener('error', function () { img.remove(); fig.classList.add('is-empty'); });
      fig.appendChild(img);
    } else { fig.classList.add('is-empty'); fig.appendChild(el('b', null, g.en)); }
    var body = el('span', 'news-body');
    body.appendChild(el('time', 'news-date', fmtDate(it.date)));
    body.appendChild(el('span', 'news-ttl', it.title));
    if (it.excerpt) body.appendChild(el('span', 'news-ex', it.excerpt));
    a.appendChild(fig); a.appendChild(body);
    li.appendChild(a);
    return li;
  }

  function galleryItem(it, g) {
    var href = safeUrl(it.url), src = safeUrl(it.thumbnail || it.image);
    if (!href || !src) return null;
    var li = el('li', 'gal-item');
    var a = el('a', 'gal-card');
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.setAttribute('data-cursor', 'link');
    a.setAttribute('aria-label', it.title + '（作品ギャラリー。新しいタブで開きます）');
    var img = el('img'); img.src = src; img.alt = it.title; img.loading = 'lazy'; img.decoding = 'async';
    img.addEventListener('error', function () { li.remove(); });
    a.appendChild(img);
    a.appendChild(el('span', 'gal-ttl', it.title));
    li.appendChild(a);
    return li;
  }

  function render(data) {
    var items = (data && data.items) || {};
    var frag = document.createDocumentFragment(), shown = 0;
    GROUPS.forEach(function (g) {
      var list = (items[g.key] || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
      var nodes = [];
      for (var i = 0; i < list.length && nodes.length < g.n; i++) {
        var n = g.key === 'gallery' ? galleryItem(list[i], g) : card(list[i], g);
        if (n) nodes.push(n);
      }
      if (!nodes.length) return;
      var sec = el('section', 'news-group news-group--' + g.key);
      sec.setAttribute('aria-labelledby', 'ng-' + g.key);
      var h = el('h3', 'news-gh'); h.id = 'ng-' + g.key;
      h.appendChild(el('span', 'news-gh-jp', g.label));
      h.appendChild(el('small', 'news-gh-en', g.en));
      var ul = el('ul', g.key === 'gallery' ? 'gal-list' : 'news-list');
      nodes.forEach(function (n) { ul.appendChild(n); });
      sec.appendChild(h); sec.appendChild(ul);
      frag.appendChild(sec); shown += nodes.length;
    });
    if (!shown) throw new Error('empty');
    box.textContent = '';
    box.appendChild(frag);
    var up = document.getElementById('newsUpdated');
    if (up && data.fetchedAt) up.textContent = '出典：ゆめいく公式サイト（' + String(data.fetchedAt).slice(0, 10).replace(/-/g, '.') + ' 取得）';
    // 高さが変わるので、スクロール連動の位置計算をやり直す
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  function fail() {
    var s = document.getElementById('newsStatus');
    if (!s) { s = el('p', 'news-fallback'); box.textContent = ''; box.appendChild(s); }
    s.textContent = '';
    s.appendChild(document.createTextNode('お知らせを読み込めませんでした。'));
    var a = el('a', null, 'ゆめいく公式サイト');
    a.href = 'https://you-make.org/'; a.target = '_blank'; a.rel = 'noopener noreferrer';
    s.appendChild(a); s.appendChild(document.createTextNode('でご覧ください。'));
  }

  fetch('./data/news.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(fail);
})();
