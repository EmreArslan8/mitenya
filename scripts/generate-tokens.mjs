/**
 * palette.ts -> globals.css token köprüsü  (ADR-0002 §Faz 0 / F0.6)
 *
 * Yön TEK YÖNLÜDÜR:
 *
 *   palette.ts (hex — TEK KAYNAK)
 *          ├──► MUI createTheme        hex okur (theme.ts hex+alpha birleştirdiği için şart)
 *          └──► bu script ──► globals.css @theme { --color-* }   Tailwind okur
 *
 * palette.ts içindeki hex'ler ASLA var(--...) ile değiştirilmez:
 * theme.ts:163 ve :174 renkleri string olarak birleştiriyor (`${main}10`),
 * var() değeri oraya girerse geçersiz renk üretir ve sessizce bozulur.
 *
 * Kullanım: yarn tokens
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PALETTE = resolve(root, 'src/theme/palette.ts');
const BREAKPOINTS = resolve(root, 'src/theme/breakpoints.ts');
const CSS = resolve(root, 'src/app/globals.css');

const START = '/* --- GENERATED FROM src/theme/palette.ts — do not edit by hand --- */';
const END = '/* --- END GENERATED --- */';

/** palette.ts saf bir obje literali; tip/import içermediği için güvenle değerlendirilebilir. */
function readPalette() {
  const src = readFileSync(PALETTE, 'utf8');
  const start = src.indexOf('{', src.indexOf('defaultPalette'));
  const end = src.lastIndexOf('};');
  if (start < 0 || end < 0) throw new Error('palette.ts ayrıştırılamadı');
  return new Function(`return ${src.slice(start, end + 1)}`)();
}

/** breakpoints.ts'teki değerler tek kaynaktır; Tailwind onları buradan alır. */
function readBreakpoints() {
  const src = readFileSync(BREAKPOINTS, 'utf8');
  const block = src.match(/const breakpoints = \{([^}]*)\}/);
  if (!block) throw new Error('breakpoints.ts içinde breakpoints bulunamadı');
  const out = {};
  for (const [, key, value] of block[1].matchAll(/(\w+):\s*(\d+)/g)) {
    out[key] = Number(value);
  }
  return out;
}

/**
 * Varyant adları kebab'a çevrilir (deepDark -> deep-dark).
 * GRUP adları palette.ts'teki haliyle KORUNUR (primaryDark -> primaryDark).
 *
 * Gerekçe: grup adı da kebab'a çevrilseydi `primary.dark` ile `primaryDark.main`
 * aynı isme (`--color-primary-dark`) düşerdi — ikisi farklı renk (#000000 / #1C1C1E).
 * Grup adını olduğu gibi bırakmak hem çakışmayı yapısal olarak imkânsız kılar
 * hem de palette.ts ile birebir eşleşme sağlar: --color-primaryDark-light
 * hangi satırdan geldiği bakılmadan okunur.
 */
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** Renk olmayan alanlar: asset tanımları ve tipografi dışı veriler. */
const SKIP_GROUPS = new Set(['logo', 'logoWhite']);

const isHex = (v) => typeof v === 'string' && /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v);
const isGradient = (v) => typeof v === 'string' && v.includes('gradient(');

function build(palette, breakpoints) {
  const colors = [];
  const gradients = [];
  const problems = [];

  for (const [group, value] of Object.entries(palette)) {
    if (SKIP_GROUPS.has(group)) continue;

    // `gradient` grubu marka gradyanlarıdır; renk gruplarının kendi
    // gradient alanlarıyla çakışmasın diye `brand` altında toplanır.
    if (group === 'gradient') {
      for (const [key, v] of Object.entries(value)) {
        gradients.push([key === 'main' ? '--gradient-brand' : `--gradient-brand-${kebab(key)}`, v]);
      }
      continue;
    }

    for (const [key, v] of Object.entries(value)) {
      const name = key === 'main' ? `--color-${group}` : `--color-${group}-${kebab(key)}`;

      if (isGradient(v)) {
        gradients.push([`--gradient-${group}`, v]);
      } else if (isHex(v)) {
        colors.push([name, v]);
      } else {
        problems.push(`${group}.${key} = ${JSON.stringify(v)} (geçerli hex değil)`);
      }
    }
  }

  // Çakışma kontrolü: aynı değişken adı iki kez üretilirse sessizce ikincisi
  // kazanır ve renk kayar. Bu, adlandırma şeması bozulduğunda erken patlar.
  for (const list of [colors, gradients]) {
    const seen = new Map();
    for (const [name, v] of list) {
      if (seen.has(name) && seen.get(name) !== v) {
        throw new Error(`token çakışması: ${name} iki farklı değere üretildi (${seen.get(name)} / ${v})`);
      }
      seen.set(name, v);
    }
  }

  const lines = [
    START,
    '@theme {',
    '  /* Kırılımlar — src/theme/breakpoints.ts ile birebir aynı olmak ZORUNDA.',
    '     MUI down() max-width, Tailwind min-width kullanır: dönüşüm için',
    '     docs/migration/faz-0-altyapi.md §F0.7 tablosuna bak. */',
    ...Object.entries(breakpoints)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `  --breakpoint-${k}: ${v}px;`),
    '',
    '  /* Renkler */',
    ...colors.map(([n, v]) => `  ${n}: ${v};`),
    '',
    '  /* Gradyanlar */',
    ...gradients.map(([n, v]) => `  ${n}: ${v};`),
    '}',
    END,
  ];

  return { css: lines.join('\n'), colors, gradients, problems };
}

function main() {
  const palette = readPalette();
  const breakpoints = readBreakpoints();
  const { css, colors, gradients, problems } = build(palette, breakpoints);

  const current = readFileSync(CSS, 'utf8');
  const from = current.indexOf(START);
  const to = current.indexOf(END);
  if (from < 0 || to < 0) throw new Error(`globals.css içinde üretim işaretleri yok: ${START}`);

  writeFileSync(CSS, current.slice(0, from) + css + current.slice(to + END.length), 'utf8');

  // Doğrulama: üretilen her değişkenin değeri palette.ts'teki hex ile birebir eşleşmeli.
  const flat = new Map(colors);
  let checked = 0;
  for (const [group, value] of Object.entries(palette)) {
    if (SKIP_GROUPS.has(group) || group === 'gradient') continue;
    for (const [key, v] of Object.entries(value)) {
      if (!isHex(v)) continue;
      const name = key === 'main' ? `--color-${group}` : `--color-${group}-${kebab(key)}`;
      if (flat.get(name) !== v) throw new Error(`token uyuşmazlığı: ${name} (${flat.get(name)} ≠ ${v})`);
      checked += 1;
    }
  }

  console.log(`✓ ${colors.length} renk, ${gradients.length} gradyan, ${Object.keys(breakpoints).filter((k) => breakpoints[k] > 0).length} kırılım yazıldı`);
  console.log(`✓ ${checked} token palette.ts ile birebir doğrulandı`);
  if (problems.length) {
    console.warn(`\n⚠️  palette.ts içinde ${problems.length} geçersiz değer atlandı:`);
    for (const p of problems) console.warn(`   - ${p}`);
    console.warn('   Bunlar MUI tarafında da geçersiz; palette.ts düzeltilmeli.');
  }
}

main();
