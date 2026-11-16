#!/usr/bin/env python3
"""ゆめいく公式サイト(you-make.org)の更新を取得し、data/news.json に保存する。

- 標準ライブラリのみ。再実行すると news.json を上書き更新する。
- ブラウザから直接APIを呼ばない(CORS不明のため)。LPはこのJSONだけを読む。
- リクエストは約8回。各リクエストの間に2秒あける。

使い方:  python3 -I concept-v2/scripts/fetch_news.py
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

BASE = "https://you-make.org/wp-json/wp/v2"
UA = "oneart-lp-news-fetch/1.0"
WAIT = 2.0  # 礼儀としてのリクエスト間隔(秒)
OUT = Path(__file__).resolve().parent.parent / "data" / "news.json"

# 種別ごとの保存件数(LP側はさらにこの範囲で表示する)
KEEP = {"blog": 6, "report": 6, "press": 4, "media": 40, "gallery": 12}

# 活動(activity)のうち ONEART の投稿は URL が /activity/oneart/ 配下。
# 開催結果報告 = 分類「展示会のまとめ」(activity_report=12)。
# それ以外の ONEART 配下(お絵描き日記9・展示会情報11・ONEARTニュース13)は活動ブログ扱い。
REPORT_TERM = 12
# topics は ONEART 専用ではない(トー横キッズ・能登支援など別事業も混在)ため、
# タイトルか説明文に ONEART / ワンアート を含むものだけに絞る。
ONEART_RE = re.compile(r"one\s*art|ワンアート", re.I)
TOPICS_PRESS, TOPICS_MEDIA = 66, 65
# メディア掲載は本文が空で ONEART の語がない古い記事が多い。ただし資料(事業説明PDF)の
# 掲載実績(NHK岐阜/中部/札幌/東京・KAB・CBC・Yahoo!ニュース等)と一致し、
# 旧称「DAC」は「DAC改めONEARTへ」(2020-02-07)で ONEART の前身と確認済み。
# → 2022年以前のメディア掲載は ONEART の実績として採用し、別事業の記事だけ除く。
MEDIA_ERA_END = "2022-12-31"
OTHER_BUSINESS_RE = re.compile(r"トー横|能登|ボランティア|農業新聞|週刊SPA|弁護士JP|あさイチ")
# サイト共通の代替画像(記事固有でない)は、サムネイルとして使わない
GENERIC_IMG = ("fb-cover.png",)

_last = [0.0]


def get(path, params):
    wait = WAIT - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    url = BASE + path + "?" + urllib.parse.urlencode(params, doseq=True, safe="[],")
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=40) as r:
        data = json.load(r)
    _last[0] = time.time()
    print("GET", url[:110], "->", len(data), "件", file=sys.stderr)
    return data


def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", "", s or ""))
    return re.sub(r"\s+", " ", s.replace("\xa0", " ")).strip()


def clip(s, n=90):
    return s if len(s) <= n else s[: n - 1] + "…"


def item(kind, p):
    seo = p.get("aioseo_head_json") or {}
    img = seo.get("og:image") or ""
    if any(img.endswith(g) for g in GENERIC_IMG):
        img = ""
    return {
        "type": kind,
        "title": clean(p["title"]["rendered"]),
        "date": p["date"][:10],
        "url": p["link"],
        "image": img,
        "thumbnail": img,
        "excerpt": clip(clean(seo.get("description"))),
        "_id": p["id"],
    }


def main():
    f = "id,date,link,title,aioseo_head_json"
    out = {k: [] for k in KEEP}

    # 1) 活動 (最新40件から ONEART 配下だけ)
    acts = get("/activity", {"per_page": 40, "orderby": "date", "order": "desc",
                              "_fields": f + ",activity_report"})
    for p in acts:
        if "/activity/oneart/" not in p["link"]:
            continue
        kind = "report" if REPORT_TERM in p["activity_report"] else "blog"
        out[kind].append(item(kind, p))

    # 2) お知らせ (全49件前後。ONEART を含むものだけ)
    tops = get("/topics", {"per_page": 100, "orderby": "date", "order": "desc",
                            "_fields": f + ",topics_category"})
    for p in tops:
        seo = p.get("aioseo_head_json") or {}
        cats = p["topics_category"]
        title = clean(p["title"]["rendered"])
        text = title + " " + (seo.get("description") or "")
        is_media = TOPICS_MEDIA in cats
        era_media = is_media and p["date"][:10] <= MEDIA_ERA_END and not OTHER_BUSINESS_RE.search(text)
        if not (ONEART_RE.search(text) or era_media):
            continue
        kind = "press" if TOPICS_PRESS in cats else "media" if TOPICS_MEDIA in cats else None
        if kind:
            out[kind].append(item(kind, p))

    # 3) ギャラリー (最新から。ギャラリーは ONEART の作品掲載)
    gal = get("/gallery", {"per_page": KEEP["gallery"], "orderby": "date", "order": "desc",
                            "_fields": f})
    out["gallery"] = [item("gallery", p) for p in gal]

    for k in out:
        out[k] = sorted(out[k], key=lambda x: x["date"], reverse=True)[: KEEP[k]]

    # 4) 画像の小さいサイズを引く(原寸が2000px級のことがあるため)
    ids = sorted({x["_id"] for k in out for x in out[k]})
    sizes = {}
    if ids:
        media = get("/media", {"parent[]": ids, "per_page": 100,
                                "_fields": "source_url,media_details"})
        for m in media:
            s = (m.get("media_details") or {}).get("sizes", {})
            sizes[m["source_url"]] = {
                "thumbnail": (s.get("thumbnail") or s.get("medium_large") or {}).get("source_url"),
                "image": (s.get("medium_large") or s.get("medium") or {}).get("source_url"),
            }
    for k in out:
        for x in out[k]:
            sz = sizes.get(x["image"])
            if sz:
                x["thumbnail"] = sz["thumbnail"] or x["image"]
                x["image"] = sz["image"] or x["image"]
            del x["_id"]

    jst = timezone(timedelta(hours=9))
    result = {
        "fetchedAt": datetime.now(jst).isoformat(timespec="seconds"),
        "source": "https://you-make.org/",
        "items": out,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUT.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(OUT)  # 途中で失敗しても古い news.json を壊さない
    print("保存:", OUT, {k: len(v) for k, v in out.items()}, file=sys.stderr)


if __name__ == "__main__":
    main()
