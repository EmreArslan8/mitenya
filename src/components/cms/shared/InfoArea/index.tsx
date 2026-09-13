import Markdown from '@/components/common/Markdown';
import { Link } from '@/components/ui/Link';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { SharedImageType } from '../cmsTypes';
import CMSImage from '../CMSImage';

/**
 * CMS bilgi alanı: ikon + başlık (+ masaüstünde açıklama).
 * `blocks.shop-info-areas` bloğunun tekil öğesi.
 *
 * ADR-0002 Faz 1, 2. pilot dilim — MUI'siz, Emotion'sız, SERVER COMPONENT.
 *
 * Eskisi `useRouter` + `<Stack onClick>` ile gezinti yapıyordu; bu hem client
 * komponenti olmayı zorunlu kılıyor hem de klavyeyle erişilemiyordu.
 * Artık gerçek bağlantı: `url` varsa kart `<a>` içine alınıyor.
 *
 * DİKKAT: `description` CMS'ten geliyor ve HtmlContent `<a>` etiketine izin
 * veriyor. `url` dolu + açıklamada bağlantı varsa iç içe `<a>` oluşur (geçersiz
 * HTML). Şu anki içerikte bilgi alanlarının tamamında `url: null` — o yüzden
 * yol kapalı; CMS'te url kullanılmaya başlanırsa burası gözden geçirilmeli.
 *
 * Stil dönüşümü ölçümle doğrulandı (dönüşüm öncesi getComputedStyle, 500px):
 *   kart gap 8px · ikon çerçevesi 72×72 / %50 yarıçap / rgb(245,245,247)
 *   etiket 12.5px / 600 / lh 16.875px / rgba(0,0,0,0.87) / ls -0.0625px
 *   açıklama 13px / lh 19.5px / rgb(58,58,60) / mobilde display:none
 *
 * Etiket rengi bilerek token DEĞİL: `color: 'text.primary'` MUI'nin kendi
 * varsayılanına (rgba(0,0,0,0.87)) düşüyordu — palette.ts'te `text.primary`
 * anahtarı yok. Token'a çevirmek rengi kaydırırdı, o yüzden `text-black/[87%]`.
 */

export interface InfoAreaProps {
  index?: number;
  label?: string;
  description?: string;
  url?: string;
  icon?: SharedImageType;
}

const InfoArea = ({ label, description, url, icon }: InfoAreaProps) => {
  const iconImage = icon?.data?.attributes;

  const content = (
    <Stack align="center" gap={1} className="w-full py-0 text-center md:gap-3">
      {iconImage && (
        <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-50 md:size-[60px] md:rounded-none md:bg-transparent">
          <div className="relative size-[62%] overflow-hidden md:size-full">
            <CMSImage
              src={iconImage.url}
              alt={iconImage.alternativeText || label || 'Bilgi ikonu'}
              fill
              sizes="(min-width: 768px) 60px, 45px"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      <Stack gap={0.5} className="md:max-w-[300px]">
        {label && (
          <Typography
            as="p"
            className="text-[12.5px] font-semibold leading-[1.35] tracking-[-0.005em] text-black/[87%] md:text-[17px] md:leading-[1.4]"
          >
            {label}
          </Typography>
        )}

        {/*
          Sarmalayıcı ZORUNLU: `Markdown` -> `HtmlContent` hâlâ MUI Box, yani
          Emotion kuralları KATMANSIZ. Tailwind utility'leri `@layer utilities`
          içinde olduğu için katmansız CSS'e her koşulda yenilir (sıra ve
          özgüllük fark etmez). Sınıfları doğrudan Markdown'a verince
          HtmlContent'in `display:flex` kuralı `hidden`ı eziyordu.
          Ayrıntı: docs/migration/konvansiyon.md §6.

          Yazı tipi/renk sarmalayıcıdan miras alınır (HtmlContent kök öğeye
          font-size/color vermiyor). Tek fark: kök öğe eskiden `display:block`
          idi, şimdi kendi `display:flex`inde kalıyor — tek metin düğümü için
          görsel etkisi yok, çok paragraflı açıklamada 16px boşluk oluşur.
        */}
        {description && (
          <div className="hidden text-[13px] leading-[1.5] text-text-secondary md:block md:text-[14px]">
            <Markdown text={description} />
          </div>
        )}
      </Stack>
    </Stack>
  );

  if (!url) return content;

  return (
    <Link href={url} className="block w-full">
      {content}
    </Link>
  );
};

export default InfoArea;
