#!/usr/bin/env python3
"""Blog taslağını Strapi'ye gönderir.

Taslak markdown'ının frontmatter'ı + ayrı bir HTML gövde dosyası okunur,
`blogs` koleksiyonuna POST/PUT edilir. Varsayılan davranış güvenli tarafta:
dry-run ve taslak (unpublished) olarak oluşturma.

Kullanım:
    export STRAPI_URL=https://cms.mitenya.com/api
    export STRAPI_WRITE_TOKEN=...
    python3 scripts/push_blog_to_strapi.py docs/blog-drafts/06-retinoid-cesitleri-hangisi-kime.md \\
        --html docs/blog-drafts/06-retinoid-STRAPI-content.html

    # gerçekten gönder
    ... --send
    # yayına al (yoksa Strapi'de taslak kalır)
    ... --send --publish
"""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request


def read_frontmatter(path):
    text = open(path, encoding='utf-8').read()
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if not m:
        sys.exit(f'{path}: frontmatter bulunamadı')
    fm, body = {}, m.group(1)
    key = None
    for line in body.split('\n'):
        if re.match(r'^\s*-\s', line) and key:
            fm.setdefault(key, []) if isinstance(fm.get(key), list) else fm.update({key: []})
            fm[key].append(line.strip()[2:].strip().strip('"'))
            continue
        km = re.match(r'^([A-Za-z_]+):\s*(.*)$', line)
        if km:
            key, val = km.group(1), km.group(2).strip()
            fm[key] = val.strip('"') if val else []
    return fm, text


def extract_json_block(text, needle):
    """Markdown içindeki ```json bloklarından `needle` geçeni döndürür."""
    for block in re.findall(r'```json\n(.*?)\n```', text, re.S):
        if needle in block:
            return json.loads(block)
    return None


def request(method, url, token, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return res.status, json.loads(res.read() or b'{}')
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b'{}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('draft', help='frontmatter içeren markdown taslağı')
    ap.add_argument('--html', required=True, help='content alanına gidecek HTML dosyası')
    ap.add_argument('--send', action='store_true', help='gerçekten gönder (yoksa dry-run)')
    ap.add_argument('--publish', action='store_true', help='taslak değil, yayında oluştur')
    ap.add_argument('--date', help='publishDate (YYYY-MM-DD), yoksa frontmatter/bugün')
    args = ap.parse_args()

    base = os.environ.get('STRAPI_URL', '').rstrip('/')
    token = os.environ.get('STRAPI_WRITE_TOKEN')
    if not base:
        sys.exit('STRAPI_URL tanımlı değil')
    if args.send and not token:
        sys.exit('STRAPI_WRITE_TOKEN tanımlı değil')

    fm, text = read_frontmatter(args.draft)
    html = open(args.html, encoding='utf-8').read()
    structured = extract_json_block(text, '"@context"')

    keywords = fm.get('seo_keywords')
    if not keywords:
        kws = [fm.get('focusKeyword', '')] + list(fm.get('secondaryKeywords') or [])
        keywords = ', '.join(k for k in kws if k)

    from datetime import date
    payload = {
        'data': {
            'title': fm['title'],
            'slug': fm['slug'],
            'excerpt': fm.get('excerpt', ''),
            'content': html,
            'publishDate': args.date or fm.get('publishDate') or date.today().isoformat(),
            'seo': {
                'metaTitle': fm.get('metaTitle', fm['title']),
                'metaDescription': fm.get('metaDescription', ''),
                'keywords': keywords,
                **({'structuredData': structured} if structured else {}),
            },
        }
    }
    if args.publish:
        from datetime import datetime, timezone
        payload['data']['publishedAt'] = datetime.now(timezone.utc).isoformat()

    print(f'→ {base}/blogs')
    print(f'  slug        : {payload["data"]["slug"]}')
    print(f'  metaTitle   : {payload["data"]["seo"]["metaTitle"]}')
    print(f'  content     : {len(html):,} karakter')
    print(f'  structured  : {"var" if structured else "YOK"}')
    print(f'  durum       : {"YAYINDA" if args.publish else "taslak"}')

    if not args.send:
        print('\n[dry-run] Gönderilmedi. Göndermek için --send ekle.')
        return

    # Aynı slug zaten var mı?
    status, found = request('GET', f'{base}/blogs?filters[slug][$eq]={payload["data"]["slug"]}', token)
    if status != 200:
        sys.exit(f'Slug kontrolü başarısız ({status}): {json.dumps(found)[:300]}')
    existing = (found.get('data') or [])
    if existing:
        entry_id = existing[0].get('id')
        sys.exit(f'Bu slug zaten var (id={entry_id}). Üzerine yazmak istersen Strapi panelinden güncelle.')

    status, res = request('POST', f'{base}/blogs', token, payload)
    if status not in (200, 201):
        sys.exit(f'HATA {status}: {json.dumps(res, ensure_ascii=False)[:600]}')
    new_id = (res.get('data') or {}).get('id')
    print(f'\n✅ Oluşturuldu — id={new_id}')
    print(f'   Panel: {base.replace("/api", "")}/admin/content-manager/collectionType/api::blog.blog/{new_id}')
    print('   ⚠️  cover görseli ve (gerekiyorsa) category elle eklenmeli.')


if __name__ == '__main__':
    main()
