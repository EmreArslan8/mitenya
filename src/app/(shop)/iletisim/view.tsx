import { Divider } from '@/components/ui/Divider';
import { Typography } from '@/components/ui/Typography';

const IletisimView = () => {
  return (
    <div className="ml-4 flex w-full max-w-[800px] flex-col gap-5 py-4 sm:ml-8 sm:gap-6 sm:py-6">
      <div className="flex flex-col gap-2">
        <Typography variant="h1" className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] sm:text-[34px]">İletişim</Typography>
        <Typography variant="body2" className="leading-[1.85] tracking-normal text-text-medium-light sm:text-[15px]">
          Mitenya olarak siparişleriniz, ürünlerimiz ve satış sonrası
          süreçlerle ilgili tüm sorularınızda yanınızdayız. Bizimle aşağıdaki
          iletişim kanallarından kolayca iletişime geçebilirsiniz.
        </Typography>
      </div>

      <Divider className="border-gray-100" />

      {/* ── Müşteri Destek Kanalları ── */}
      <section className="flex flex-col gap-3">
        <Typography variant="h2" className="leading-[1.3]">
          Müşteri Destek Kanalları
        </Typography>
        <div className="flex flex-col gap-1">
          <Typography variant="progressLabel" className="font-semibold text-text">E-posta</Typography>
          <a href="mailto:destek@mitenya.com" className="w-fit text-sm leading-[1.6] text-text underline outline-offset-2 hover:text-text-medium-light focus-visible:rounded focus-visible:outline-2 focus-visible:outline-gray-300 sm:text-[15px]">
            destek@mitenya.com
          </a>
        </div>
        <Typography variant="body2" className="leading-[1.85] tracking-normal text-text-medium-light sm:text-[15px]">
          E-posta üzerinden ilettiğiniz taleplere, mümkün olan en kısa sürede
          ve en geç 1 iş günü içerisinde dönüş yapılmaktadır.
        </Typography>
      </section>

      <Divider className="border-gray-100" />

      {/* ── Şirket Bilgileri ── */}
      <section className="flex flex-col gap-3">
        <Typography variant="h2" className="leading-[1.3]">Şirket Bilgileri</Typography>
        <div className="flex flex-col gap-1">
          <Typography variant="progressLabel" className="font-semibold text-text">Şirket Unvanı</Typography>
          <Typography variant="body2" className="leading-[1.6] tracking-normal text-text-medium-light sm:text-[15px]">
            ALSANCAK PAZARLAMA SANAYİ VE TİCARET LİMİTED ŞİRKETİ
          </Typography>
        </div>
        {[['Marka Adı', 'Mitenya'], ['Vergi Dairesi', 'TOSYA'], ['Vergi No', '0591263888'], ['MERSİS No', '0059126388800001']].map(([label, value]) => (
          <div className="flex flex-col gap-1" key={label}>
            <Typography variant="progressLabel" className="font-semibold text-text">{label}</Typography>
            <Typography variant="body2" className="leading-[1.6] tracking-normal text-text-medium-light sm:text-[15px]">{value}</Typography>
          </div>
        ))}
      </section>

      <Divider className="border-gray-100" />

      {/* ── Adresler ── */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-bg-dark p-4 sm:p-5">
          <Typography variant="body1" className="font-bold sm:text-[16px]">
            Merkez Ofis (Resmî Şirket Adresi)
          </Typography>
          <Typography variant="body2" className="leading-[1.7] tracking-normal text-text-medium-light sm:text-[15px]">
            KARGI MAH. YEMENİCİLER ÇARŞISI SK. NO: 8A
            <br />
            TOSYA / KASTAMONU / Türkiye
          </Typography>
          <Typography variant="progressLabel" className="italic text-text-light [font-family:var(--font-albert-sans-italic)]">
            Bu adres, şirketimizin resmî kayıtlı adresidir.
          </Typography>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-bg-dark p-4 sm:p-5">
          <Typography variant="body1" className="font-bold sm:text-[16px]">
            Depo, Kargo Çıkış ve İade Adresi
          </Typography>
          <Typography variant="body2" className="leading-[1.7] tracking-normal text-text-medium-light sm:text-[15px]">
            KAYIKÇILAR MAH. 103. SK. NO: 14 DAİRE:2
            <br />
            ÇAYCUMA / ZONGULDAK / Türkiye
          </Typography>
          <Typography variant="progressLabel" className="italic text-text-light [font-family:var(--font-albert-sans-italic)]">
            Online siparişleriniz bu adres üzerinden hazırlanarak kargoya teslim
            edilmektedir. İade ve değişim işlemleri, İade &amp; Değişim Politikası
            sayfamızda belirtilen şartlara göre bu adres üzerinden
            yapılmaktadır.
          </Typography>
        </div>
      </section>

      <Divider className="border-gray-100" />

      {/* ── Çalışma Saatleri ── */}
      <section className="flex flex-col gap-3">
        <Typography variant="h2" className="leading-[1.3]">Çalışma Saatleri</Typography>
        <div className="flex flex-col gap-1">
          <Typography variant="progressLabel" className="font-semibold text-text">Müşteri Hizmetleri</Typography>
          <Typography variant="body2" className="leading-[1.7] tracking-normal text-text-medium-light sm:text-[15px]">
            Pazartesi – Cuma: 09:00 – 18:00
            <br />
            Cumartesi: 10:00 – 16:00
            <br />
            Pazar: Kapalı
          </Typography>
        </div>
        <Typography variant="body2" className="leading-[1.85] tracking-normal text-text-medium-light sm:text-[15px]">
          Web sitemiz üzerinden 7/24 sipariş verebilirsiniz. Mesajlarınıza
          çalışma saatleri içerisinde dönüş yapılır.
        </Typography>
      </section>
    </div>
  );
};

export default IletisimView;
