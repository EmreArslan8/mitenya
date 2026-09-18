#!/usr/bin/env python3
"""Blog taslağı markdown'ını Strapi `content` alanı için HTML'e çevirir.

Yayına gitmeyecek bölümler (JSON-LD, görsel planı, Strapi alanları, iç linkleme
notları) ve markdown'ın H1'i otomatik atılır — H1'i şablon zaten `title`'dan
basıyor, ikinci bir H1 sayfada başlık hiyerarşisini bozar.

Kullanım:
    python3 scripts/md_to_strapi_html.py docs/blog-drafts/03-....md > out.html
"""

import html
import re
import sys

# Bu H2'lerden itibaren gerisi editöryel not — yayına gitmez.
CUTOFF = re.compile(
    r'^##\s+(JSON-LD|Görsel planı|Strapi alanları|İç linkleme)', re.I
)


def inline(text):
    """Satır içi markdown → HTML. Kaçış önce, etiketler sonra."""
    text = html.escape(text, quote=False)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return text


def split_row(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]


def convert(md):
    # frontmatter
    md = re.sub(r'^---\n.*?\n---\n', '', md, flags=re.S)

    lines = md.split('\n')
    out, i = [], 0
    list_tag = None  # açık <ul>/<ol>

    def close_list():
        nonlocal list_tag
        if list_tag:
            out.append(f'</{list_tag}>')
            list_tag = None

    while i < len(lines):
        line = lines[i]

        if CUTOFF.match(line):
            break

        # yatay çizgi / boş satır
        if not line.strip() or line.strip() == '---':
            close_list()
            i += 1
            continue

        # H1 atılır (şablon title'dan basıyor)
        if line.startswith('# '):
            close_list()
            i += 1
            continue

        if line.startswith('### '):
            close_list()
            out.append(f'<h3>{inline(line[4:].strip())}</h3>')
            i += 1
            continue

        if line.startswith('## '):
            close_list()
            out.append(f'<h2>{inline(line[3:].strip())}</h2>')
            i += 1
            continue

        # kod bloğu → ortalanmış vurgu satırı (dönüşüm zinciri gibi)
        if line.startswith('```'):
            close_list()
            i += 1
            buf = []
            while i < len(lines) and not lines[i].startswith('```'):
                buf.append(lines[i])
                i += 1
            i += 1
            body = '<br>'.join(html.escape(b, quote=False) for b in buf if b.strip())
            out.append(f'<p style="text-align:center"><strong>{body}</strong></p>')
            continue

        # tablo
        if line.strip().startswith('|'):
            close_list()
            header = split_row(line)
            i += 2  # başlık + ayraç
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                rows.append(split_row(lines[i]))
                i += 1
            out.append('<table>')
            out.append('<thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in header) + '</tr></thead>')
            out.append('<tbody>')
            for r in rows:
                out.append('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>')
            out.append('</tbody></table>')
            continue

        # alıntı
        if line.startswith('> '):
            close_list()
            buf = []
            while i < len(lines) and lines[i].startswith('>'):
                buf.append(lines[i].lstrip('>').strip())
                i += 1
            out.append(f'<blockquote><p>{inline(" ".join(buf))}</p></blockquote>')
            continue

        # listeler
        m = re.match(r'^(\s*)([-*]|\d+\.)\s+(.*)$', line)
        if m:
            want = 'ul' if m.group(2) in ('-', '*') else 'ol'
            if list_tag != want:
                close_list()
                out.append(f'<{want}>')
                list_tag = want
            out.append(f'<li>{inline(m.group(3))}</li>')
            i += 1
            continue

        # paragraf
        close_list()
        buf = [line.strip()]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(
            r'^(#|\||>|```|\s*([-*]|\d+\.)\s)', lines[i]
        ):
            buf.append(lines[i].strip())
            i += 1
        out.append(f'<p>{inline(" ".join(buf))}</p>')

    close_list()
    return '\n\n'.join(out) + '\n'


if __name__ == '__main__':
    sys.stdout.write(convert(open(sys.argv[1], encoding='utf-8').read()))
