import { describe, expect, it } from 'vitest';
import { enhanceArticleImages, prepareArticle } from './article';

const CLOUDINARY = 'https://res.cloudinary.com/dr8ismfrc/image/upload/v1788306630/blog/retinol.webp';
const CF = 'https://cdn.mitenya.com/products/a313-retinol-pommade-50g/main.webp';

describe('enhanceArticleImages', () => {
  it('CDN kaynagina srcset ve sizes ekler', () => {
    const out = enhanceArticleImages(`<img src="${CLOUDINARY}" alt="Retinol">`);
    expect(out).toContain('srcset="');
    expect(out).toContain('sizes="(min-width: 1000px) 720px, 100vw"');
    expect(out).toContain('w_640/');
    expect(out).toContain('640w');
  });

  it('Cloudflare kaynagini da donusturur', () => {
    const out = enhanceArticleImages(`<img src="${CF}" alt="A313">`);
    expect(out).toContain('/cdn-cgi/image/width=640,format=auto/');
    expect(out).toContain('srcset="');
  });

  it('lazy ve async decoding ekler', () => {
    const out = enhanceArticleImages(`<img src="${CF}" alt="A313">`);
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('decoding="async"');
  });

  it('yazarin verdigi loading degerini ezmez', () => {
    const out = enhanceArticleImages(`<img src="${CF}" alt="A313" loading="eager">`);
    expect(out).toContain('loading="eager"');
    expect(out).not.toContain('loading="lazy"');
  });

  it('yazarin verdigi srcset varsa uzerine yazmaz', () => {
    const out = enhanceArticleImages(`<img src="${CF}" srcset="${CF} 800w" alt="A313">`);
    expect(out.match(/srcset=/g)).toHaveLength(1);
    expect(out).toContain(`srcset="${CF} 800w"`);
  });

  it('donusturulemeyen kaynaga srcset yazmaz ama lazy ekler', () => {
    const out = enhanceArticleImages('<img src="/static/images/logo.png" alt="Logo">');
    expect(out).not.toContain('srcset=');
    expect(out).toContain('loading="lazy"');
  });

  it('SVG icin srcset uretmez', () => {
    const out = enhanceArticleImages(`<img src="https://cdn.mitenya.com/icons/leaf.svg" alt="">`);
    expect(out).not.toContain('srcset=');
  });

  it('width ve height attributelarini korur', () => {
    const out = enhanceArticleImages(`<img src="${CF}" width="720" height="480" alt="A313">`);
    expect(out).toContain('width="720"');
    expect(out).toContain('height="480"');
  });

  it('self-closing etiketi de isler', () => {
    const out = enhanceArticleImages(`<img src="${CF}" alt="A313" />`);
    expect(out).toContain('srcset="');
    expect(out.match(/<img/g)).toHaveLength(1);
  });

  it('src yoksa etikete dokunmaz', () => {
    const input = '<img alt="bos">';
    expect(enhanceArticleImages(input)).toBe(input);
  });

  it('cift tirnakli src degerinden attribute kacisi yapilamaz', () => {
    const out = enhanceArticleImages(`<img src="${CF}" alt="A313">`);
    // Uretilen srcset icinde kacissiz cift tirnak bulunmamali.
    const srcset = /srcset="([^"]*)"/.exec(out)?.[1] ?? '';
    expect(srcset).not.toContain('"');
  });
});

describe('prepareArticle', () => {
  it('boru hattinda gorselleri de donusturur', () => {
    const { html } = prepareArticle(
      `<h2>Nasil kullanilir</h2><p>Metin</p><img src="${CF}" alt="A313">`,
    );
    expect(html).toContain('srcset="');
    expect(html).toContain('loading="lazy"');
  });

  it('h2 idlerini ve icindekiler listesini uretmeye devam eder', () => {
    const { html, toc } = prepareArticle('<h2>Sahtesi Nasil Anlasilir?</h2>');
    expect(toc).toEqual([
      { id: 'sahtesi-nasil-anlasilir', text: 'Sahtesi Nasil Anlasilir?', level: 2 },
    ]);
    expect(html).toContain('id="sahtesi-nasil-anlasilir"');
  });

  it('h3 basliklarini da id ve icindekiler listesine ekler', () => {
    const { html, toc } = prepareArticle(
      '<h2>Nasil kullanilir</h2><h3>Alistirma takvimi</h3><h2>Yan etkiler</h2>',
    );
    expect(toc.map((t) => t.level)).toEqual([2, 3, 2]);
    expect(toc[1]).toEqual({ id: 'alistirma-takvimi', text: 'Alistirma takvimi', level: 3 });
    expect(html).toContain('<h3 id="alistirma-takvimi">');
    // h3 kapanis etiketi h2'ye donusmemeli
    expect(html).toContain('</h3>');
    expect((html.match(/<h2/g) ?? []).length).toBe(2);
  });

  it('h2 ve h3 ayni metne sahipse id cakismasi olmaz', () => {
    const { toc } = prepareArticle('<h2>Guvenlik</h2><h3>Guvenlik</h3>');
    expect(new Set(toc.map((t) => t.id)).size).toBe(2);
  });

  it('figure icindeki gorseli de donusturur', () => {
    const { html } = prepareArticle(
      `<figure><img src="${CF}" alt="A313"><figcaption>Tup baskisi</figcaption></figure>`,
    );
    expect(html).toContain('srcset="');
    expect(html).toContain('<figcaption>Tup baskisi</figcaption>');
  });

  it('tablolari kaydirilabilir sarmalayiciya almaya devam eder', () => {
    const { html } = prepareArticle('<table><tr><td>1</td></tr></table>');
    expect(html).toContain('<div class="article-table"><table>');
  });

  it('okuma suresini hesaplar', () => {
    const { readingMinutes } = prepareArticle(`<p>${'kelime '.repeat(400)}</p>`);
    expect(readingMinutes).toBe(2);
  });
});
