import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  /**
   * ADR-0002 §11.2 — bağımlılık yönü, MEKANİZMA olarak.
   *
   * `components/ui/**` taşınabilir primitif katmanıdır:
   *   - MUI/Emotion bilmez (yoksa geçişin anlamı kalmaz)
   *   - domain bilmez (contexts, lib/api, CMS tipleri) — yoksa primitif olmaktan çıkar
   *
   * Kural dokümanda değil burada yaşasın ki unutulduğunda build değil lint konuşsun.
   */
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@mui/*", "@emotion/*"],
              message:
                "ui/ katmanı MUI/Emotion import edemez (ADR-0002 §11.2). Primitif taşınabilir kalmalı.",
            },
            {
              group: [
                "@/contexts/*",
                "@/lib/api/*",
                "@/components/cms/*",
                "@/theme/*",
              ],
              message:
                "ui/ katmanı domain'e bağımlı olamaz (ADR-0002 §11.2). Veriyi prop olarak al.",
            },
          ],
          // DİKKAT: flat config'te sonraki blok aynı kuralı EZER (birleştirmez).
          // Barrel yasağı ayrı blokta kalırsa yukarıdaki patterns sessizce ölür
          // — review'de tespit edildi, bu yüzden ikisi burada birlikte.
          paths: [
            {
              name: "@/components/ui",
              message:
                "Barrel yerine doğrudan yol kullan: @/components/ui/Stack (ADR-0002).",
            },
          ],
        },
      ],
    },
  },

  /**
   * ADR-0002 §5.3 + konvansiyon.md §6 — dönüşmüş dosyalarda `sx` yasağı.
   * Emotion katmansız CSS yazar ve Tailwind utility'lerini sessizce ezer;
   * bu yüzden karışım bir üslup meselesi değil, doğruluk meselesi.
   */
  {
    files: ["src/components/ui/**/*.tsx"],
    rules: {
      "react/forbid-component-props": [
        "error",
        {
          forbid: [
            {
              propName: "sx",
              message:
                "ui/ primitifleri `sx` kabul etmez (ADR-0002 §5.3). Stil `className` ile verilir.",
            },
          ],
        },
      ],
    },
  },

  /**
   * ADR-0002 — `@/components/ui` barrel'ından import YASAK.
   *
   * Ölçüm (2026-09-08): barrel'dan tek bileşen almak tüm Radix paketlerini
   * paylaşılan chunk'a sokuyordu — First Load JS 227 -> 287 kB (+60, her sayfada).
   * Doğrudan yola geçince 241 kB'a düştü.
   */
  {
    // ui/** BU BLOĞUN DIŞINDA: flat config'te sonraki blok aynı kural adını
    // ezer; ui/** burada da eşleşseydi yukarıdaki bağımlılık yasağı ölürdü.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/components/ui",
              message:
                "Barrel yerine doğrudan yol kullan: @/components/ui/Stack (ADR-0002; barrel tüm Radix'i paylaşılan chunk'a sokuyor).",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
