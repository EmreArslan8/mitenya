import Markdown from '@/components/common/Markdown';
import { Link } from '@/components/ui/Link';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { buildCloudinaryGifVideoUrl } from '@/lib/imageLoader';
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
 * Güncel responsive stil:
 *   ikon 120×120 (mobil–md), 132×132 (lg+)
 *   etiket 14/15/16/17px (mobil/sm/md/lg), 500 ağırlık
 *   açıklama 14px ve mobilde gizli
 *
 * Hareketli GIF ikonlar <video> olarak basılıyor: Cloudinary `f_auto` GIF'i
 * dönüştürmüyor, 240w varyant bile 1.44 MB iniyordu; MP4 karşılığı ~28 KB.
 * Video srcset almadığı için tek genişlik (384) — 120px çerçeveyi 3x ekranda
 * da keskin tutuyor.
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

const GIF_VIDEO_WIDTH = 384;

const InfoArea = ({ label, description, url, icon }: InfoAreaProps) => {
  const iconImage = icon?.data?.attributes;
  const iconAlt = iconImage?.alternativeText || label || 'Bilgi ikonu';
  const gifMp4 = iconImage && buildCloudinaryGifVideoUrl(iconImage.url, 'mp4', GIF_VIDEO_WIDTH);
  const gifWebm = iconImage && buildCloudinaryGifVideoUrl(iconImage.url, 'webm', GIF_VIDEO_WIDTH);

  const content = (
    <Stack align="center" gap={1} className="w-full py-0 text-center md:gap-3">
      {iconImage && (
        <div className="flex size-[120px] shrink-0 items-center justify-center lg:size-[132px]">
          <div className="relative size-full overflow-hidden rounded-full">
            {gifMp4 ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                role="img"
                aria-label={iconAlt}
                className="absolute inset-0 size-full object-cover"
              >
                <source src={gifMp4} type="video/mp4" />
                {gifWebm && <source src={gifWebm} type="video/webm" />}
              </video>
            ) : (
              <CMSImage
                src={iconImage.url}
                alt={iconAlt}
                fill
                sizes="(min-width: 1200px) 132px, 120px"
                style={{ objectFit: 'cover' }}
              />
            )}
          </div>
        </div>
      )}

      <Stack gap={0.5} className="md:max-w-[300px]">
        {label && (
          <Typography
            as="p"
            className="text-[14px] font-medium leading-[1.4] tracking-[-0.005em] text-black/[87%] sm:text-[15px] md:text-[16px] lg:text-[17px]"
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
