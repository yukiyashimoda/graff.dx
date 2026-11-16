#!/usr/bin/env python3
"""ゆめいく公式サイトの ONEART ページ(https://you-make.org/contents/oneart/)から
参加アーティストを取得し、data/artists.json・assets/img/artists/*.jpg・artists.html を作る。

- 標準ライブラリのみ。再実行すると上書き更新する。
- 掲載は許可済み(ユーザー確認 2026-11-16「ゆめいくサイトに載っているものは転載OK」)。
- リクエスト間隔は1秒。

使い方:  python3 -I concept-v2/scripts/build_artists.py
"""
import html, json, re, time, urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

SRC = "https://you-make.org/contents/oneart/"
UA = "oneart-lp-artists-fetch/1.0"
ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img" / "artists"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()

def esc(s): return html.escape(s, quote=True)

page = get(SRC).decode("utf-8")
artists = []
for m in re.finditer(r'<div class="ld-tm d-flex.*?</ul></div></div></div>', page, re.S):
    b = m.group(0)
    g = lambda p: re.sub(r"\s*<br\s*/?>\s*", " ", html.unescape((re.search(p, b, re.S) or [None, ""])[1])).strip()
    img = (re.search(r'<img class="circle" src="([^"]+)"', b) or [None, ""])[1]
    artists.append({
        "name": g(r'ld-tm-name">(.*?)<'),
        "role": g(r'ld-tm-pos[^>]*>(.*?)<'),
        "bio": g(r'font-size-14">(.*?)</p>'),
        "links": re.findall(r'<a href="([^"]+)"', b),
        "imageSource": img,
        "image": "./assets/img/artists/" + img.rsplit("/", 1)[-1] if img else "",
    })
assert len(artists) >= 30, f"想定より少ない: {len(artists)}"

IMG.mkdir(parents=True, exist_ok=True)
for a in artists:
    if not a["imageSource"]: continue
    dest = IMG / a["imageSource"].rsplit("/", 1)[-1]
    if not dest.exists():
        dest.write_bytes(get(a["imageSource"])); time.sleep(1)

jst = timezone(timedelta(hours=9))
(ROOT / "data").mkdir(exist_ok=True)
(ROOT / "data" / "artists.json").write_text(json.dumps(
    {"fetchedAt": datetime.now(jst).isoformat(timespec="seconds"), "source": SRC, "artists": artists},
    ensure_ascii=False, indent=2), encoding="utf-8")

def link_label(u):
    if "instagram.com" in u: return "Instagram"
    if "x.com" in u or "twitter.com" in u: return "X"
    return "Website"

cards = []
for i, a in enumerate(artists):
    plate = ["pink", "yellow", "blue"][i % 3]
    links = "".join(
        f'<a href="{esc(u)}" target="_blank" rel="noopener noreferrer">{link_label(u)} ↗</a>' for u in a["links"])
    photo = (f'<img src="{esc(a["image"])}" alt="{esc(a["name"])}" width="240" height="240" loading="lazy" />'
             if a["image"] else "")
    cards.append(f'''      <li class="ac" data-plate="{plate}">
        <div class="ac-photo">{photo}</div>
        <h2 class="ac-name">{esc(a["name"])}</h2>
        <p class="ac-role">{esc(a["role"])}</p>
        <p class="ac-bio">{esc(a["bio"])}</p>
        <p class="ac-links">{links}</p>
      </li>''')

doc = f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="robots" content="noindex" />
  <meta name="theme-color" content="#f1ece1" />
  <title>参加アーティスト一覧｜ONEART</title>
  <link rel="stylesheet" href="./css/artists.css" />
</head>
<body>
  <header class="ah">
    <a class="ah-brand" href="./index.html"><span aria-hidden="true"><i></i><i></i><i></i></span>ONEART</a>
    <a class="ah-back" href="./index.html">← トップへ戻る</a>
  </header>
  <main>
    <section class="intro">
      <p class="eyebrow">ARTISTS</p>
      <h1>参加アーティスト一覧</h1>
      <p class="lead">子どもたちが描いた原画をもとに、作品に仕上げているアーティストです（{len(artists)}名）。</p>
    </section>
    <ul class="grid">
{chr(10).join(cards)}
    </ul>
    <p class="credit">掲載内容は<a href="{SRC}" target="_blank" rel="noopener noreferrer">一般財団法人ゆめいく公式サイト</a>より（ゆめいくの許可を得て転載）。</p>
  </main>
  <footer class="af"><p>© ONEART／YUMEIKU</p><a href="./index.html">トップへ戻る</a></footer>
</body>
</html>
'''
(ROOT / "artists.html").write_text(doc, encoding="utf-8")
print(len(artists), "名 → artists.html")
