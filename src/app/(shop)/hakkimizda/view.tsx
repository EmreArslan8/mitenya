'use client';

import { Box, Divider, Stack, Typography } from '@mui/material';
import useStyles from './styles';

const SECTIONS = [
  {
    title: '1. Mitenya nedir?',
    paragraphs: [
      'Mitenya, cilt bakımında kaliteyi ve güveni ön planda tutan, seçili global güzellik markalarını tek bir platformda buluşturmak amacıyla kurulmuş bir e-ticaret markasıdır.',
      'Amacımız; içerik kalitesi yüksek, kullanıcı deneyimiyle kendini kanıtlamış ve dünyada öne çıkan ürünleri Türkiye\'deki kullanıcılarla güvenle buluşturmaktır.',
      'Mitenya, operasyon ve tedarik süreçlerini Türkiye mevzuatına ve tüketici haklarına uygun şekilde yürüten bir yapı üzerine kurulmuştur.',
    ],
  },
  {
    title: '2. Uzmanlık alanımız',
    paragraphs: [
      'Mitenya\'nın temel uzmanlık alanlarından biri Kore cilt bakım ürünleridir. Kore kozmetiği; inovatif formülleri, aktif içerik yoğunluğu ve uzun vadeli cilt bakım yaklaşımıyla global ölçekte önemli bir referans noktasıdır.',
      'Bu alandaki ürün seçimlerimizde; içerik güvenliği, marka güvenilirliği ve kullanıcı geri bildirimleri temel kriterlerimizdir.',
    ],
  },
  {
    title: '3. Global marka seçkisi',
    paragraphs: [
      'Kore kozmetiğinin yanı sıra, farklı ülkelerde geliştirilmiş ve kendi kategorilerinde başarılı olmuş cilt bakım ve kişisel bakım ürünlerini de seçkimize dahil etmeyi hedefliyoruz.',
      'Mitenya\'da yer alan tüm ürünler;',
    ],
    bullets: [
      'Belirli kalite kriterlerinden geçirilir,',
      'İçerik ve kullanım amacı açısından değerlendirilir,',
      'Kullanıcı deneyimi ve güvenilirliği esas alınarak seçilir.',
    ],
    afterBullets:
      'Bu yaklaşım sayesinde, "çok ürün" yerine doğru ürün sunmayı amaçlıyoruz.',
  },
  {
    title: '4. Orijinallik ve güven taahhüdümüz',
    paragraphs: [
      'Mitenya\'da satışa sunulan tüm ürünler %100 orijinaldir. Ürünlerimiz, marka sahipleri, markaların yetkili distribütörleri veya güvenilir tedarik zincirleri aracılığıyla temin edilir.',
      'Tüm siparişler resmî fatura ile birlikte gönderilir ve ürünler Türkiye\'den, kayıtlı depo adresimizden kargoya teslim edilir.',
    ],
  },
  {
    title: '5. Müşteri deneyimi ve operasyon',
    paragraphs: [
      'Siparişler, stok durumuna bağlı olarak genellikle 1–3 iş günü içerisinde kargoya teslim edilir. Teslimat, iade ve değişim süreçleri şeffaf şekilde yürütülür ve tüm koşullar web sitemizde açıkça belirtilir.',
      'Müşteri memnuniyeti, Mitenya için kısa vadeli bir hedef değil; markanın sürdürülebilirliği açısından temel bir ilkedir.',
    ],
  },
  {
    title: '6. Gelecek vizyonumuz',
    paragraphs: [
      'Mitenya, zaman içerisinde ürün seçkisini kontrollü ve bilinçli şekilde genişleterek;',
    ],
    bullets: [
      'Güvenilir bir online güzellik platformu olmak,',
      'İçerik, rehber ve bilgilendirme odaklı bir deneyim sunmak,',
      'İlerleyen dönemde fiziksel temas noktalarıyla kullanıcılarla buluşmak',
    ],
    afterBullets: 'hedefiyle yoluna devam etmektedir.',
  },
];

const HakkimizdaView = () => {
  const styles = useStyles();

  return (
    <Stack sx={styles.container}>
      <Typography sx={styles.pageTitle}>Hakkımızda</Typography>

      {SECTIONS.map((section, i) => (
        <Stack key={section.title}>
          <Stack sx={styles.section}>
            <Typography sx={styles.sectionTitle}>{section.title}</Typography>

            {section.paragraphs.map((p, j) => (
              <Typography key={j} sx={styles.sectionBody}>
                {p}
              </Typography>
            ))}

            {section.bullets && (
              <Stack sx={styles.bulletList}>
                {section.bullets.map((b, k) => (
                  <Stack key={k} sx={styles.bulletItem}>
                    <Box sx={styles.bulletDot} />
                    <Typography sx={styles.sectionBody}>{b}</Typography>
                  </Stack>
                ))}
              </Stack>
            )}

            {section.afterBullets && (
              <Typography sx={styles.sectionBody}>
                {section.afterBullets}
              </Typography>
            )}
          </Stack>

          {i < SECTIONS.length - 1 && <Divider sx={{ ...styles.divider, mt: { xs: 2.5, sm: 3 } }} />}
        </Stack>
      ))}

      <Typography sx={styles.closing}>
        Mitenya&apos;yı tercih ettiğiniz için teşekkür ederiz.
      </Typography>
    </Stack>
  );
};

export default HakkimizdaView;
