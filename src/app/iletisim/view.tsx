'use client';

import { Divider, Stack, Typography } from '@mui/material';
import useStyles from './styles';

const IletisimView = () => {
  const styles = useStyles();

  return (
    <Stack sx={styles.container}>
      {/* ── Başlık ── */}
      <Stack gap={1}>
        <Typography sx={styles.pageTitle}>İletişim</Typography>
        <Typography sx={styles.pageSubtitle}>
          Mitenya olarak siparişleriniz, ürünlerimiz ve satış sonrası
          süreçlerle ilgili tüm sorularınızda yanınızdayız. Bizimle aşağıdaki
          iletişim kanallarından kolayca iletişime geçebilirsiniz.
        </Typography>
      </Stack>

      <Divider sx={styles.divider} />

      {/* ── Müşteri Destek Kanalları ── */}
      <Stack sx={styles.section}>
        <Typography sx={styles.sectionTitle}>
          Müşteri Destek Kanalları
        </Typography>
        <Stack sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>E-posta</Typography>
          <Typography sx={styles.infoValue}>destek@mitenya.com</Typography>
        </Stack>
        <Typography sx={styles.sectionBody}>
          E-posta üzerinden ilettiğiniz taleplere, mümkün olan en kısa sürede
          ve en geç 1 iş günü içerisinde dönüş yapılmaktadır.
        </Typography>
      </Stack>

      <Divider sx={styles.divider} />

      {/* ── Şirket Bilgileri ── */}
      <Stack sx={styles.section}>
        <Typography sx={styles.sectionTitle}>Şirket Bilgileri</Typography>
        <Stack sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>Şirket Unvanı</Typography>
          <Typography sx={styles.infoValue}>
            ALSANCAK PAZARLAMA SANAYİ VE TİCARET LİMİTED ŞİRKETİ
          </Typography>
        </Stack>
        <Stack sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>Marka Adı</Typography>
          <Typography sx={styles.infoValue}>Mitenya</Typography>
        </Stack>
        <Stack sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>Vergi Dairesi</Typography>
          <Typography sx={styles.infoValue}>TOSYA</Typography>
        </Stack>
        <Stack sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>Vergi No</Typography>
          <Typography sx={styles.infoValue}>0591263888</Typography>
        </Stack>
        <Stack sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>MERSİS No</Typography>
          <Typography sx={styles.infoValue}>0059126388800001</Typography>
        </Stack>
      </Stack>

      <Divider sx={styles.divider} />

      {/* ── Adresler ── */}
      <Stack sx={styles.section}>
        <Stack sx={styles.addressCard}>
          <Typography sx={styles.addressTitle}>
            Merkez Ofis (Resmî Şirket Adresi)
          </Typography>
          <Typography sx={styles.addressText}>
            KARGI MAH. YEMENİCİLER ÇARŞISI SK. NO: 8A
            <br />
            TOSYA / KASTAMONU / Türkiye
          </Typography>
          <Typography sx={styles.addressNote}>
            Bu adres, şirketimizin resmî kayıtlı adresidir.
          </Typography>
        </Stack>

        <Stack sx={styles.addressCard}>
          <Typography sx={styles.addressTitle}>
            Depo, Kargo Çıkış ve İade Adresi
          </Typography>
          <Typography sx={styles.addressText}>
            KAYIKÇILAR MAH. 103. SK. NO: 14 DAİRE:2
            <br />
            ÇAYCUMA / ZONGULDAK / Türkiye
          </Typography>
          <Typography sx={styles.addressNote}>
            Online siparişleriniz bu adres üzerinden hazırlanarak kargoya teslim
            edilmektedir. İade ve değişim işlemleri, İade &amp; Değişim Politikası
            sayfamızda belirtilen şartlara göre bu adres üzerinden
            yapılmaktadır.
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={styles.divider} />

      {/* ── Çalışma Saatleri ── */}
      <Stack sx={styles.section}>
        <Typography sx={styles.sectionTitle}>Çalışma Saatleri</Typography>
        <Stack sx={styles.infoRow}>
          <Typography sx={styles.infoLabel}>Müşteri Hizmetleri</Typography>
          <Typography sx={styles.hoursRow}>
            Pazartesi – Cuma: 09:00 – 18:00
            <br />
            Cumartesi: 10:00 – 16:00
            <br />
            Pazar: Kapalı
          </Typography>
        </Stack>
        <Typography sx={styles.sectionBody}>
          Web sitemiz üzerinden 7/24 sipariş verebilirsiniz. Mesajlarınıza
          çalışma saatleri içerisinde dönüş yapılır.
        </Typography>
      </Stack>
    </Stack>
  );
};

export default IletisimView;
