export interface ContractProduct {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
}

export interface ContractData {
  buyer: {
    fullName: string;
    address: string;
    phone: string;
    email: string;
  };
  products: ContractProduct[];
  orderSummary: {
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    currency: string;
  };
  paymentMethod: string;
  deliveryAddress: string;
  date: string;
}

const SELLER = {
  name: 'ALSANCAK PAZARLAMA SANAYİ VE TİCARET LİMİTED ŞİRKETİ',
  address: 'KARGI MAH. YEMENİCİLER ÇARŞISI SK. NO: 8 A TOSYA / KASTAMONU',
  phone: '05070617930',
  email: 'destek@mitenya.com',
  website: 'www.mitenya.com',
  taxOffice: 'Tosya Vergi Dairesi',
  mersisNo: '0059126388800001',
} as const;

const DOC_VERSION = '1.0';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
}

function buildProductTable(products: ContractProduct[], currency: string): string {
  const rows = products
    .map(
      (p) => `
    <tr>
      <td>${p.name}${p.variant ? ` (${p.variant})` : ''}</td>
      <td>${p.quantity}</td>
      <td>${formatCurrency(p.unitPrice, currency)}</td>
      <td>${formatCurrency(p.totalPrice, currency)}</td>
    </tr>`
    )
    .join('');

  return `
<table>
  <thead>
    <tr>
      <th>Ürün Adı</th>
      <th>Adet</th>
      <th>Birim Fiyat</th>
      <th>Toplam</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`;
}

function buildInfoTable(rows: [string, string][]): string {
  const tableRows = rows
    .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${value}</td></tr>`)
    .join('\n');
  return `<table cellspacing="0" cellpadding="0"><tbody>\n${tableRows}\n</tbody></table>`;
}

// ---------------------------------------------------------------------------
// Ön Bilgilendirme Formu
// ---------------------------------------------------------------------------

export function generatePreInfoHtml(data: ContractData): string {
  const { buyer, products, orderSummary, paymentMethod, deliveryAddress, date } = data;
  const currency = orderSummary.currency;

  return `
<p><strong>ÖN BİLGİLENDİRME FORMU</strong></p>

<p><strong>1. SATICI BİLGİLERİ</strong></p>
${buildInfoTable([
  ['Unvanı:', SELLER.name],
  ['Adresi:', SELLER.address],
  ['Telefon Numarası', SELLER.phone],
  ['MERSİS Numarası', SELLER.mersisNo],
])}

<p><strong>2. ALICI BİLGİLERİ</strong></p>
${buildInfoTable([
  ['Adı Soyadı/Unvanı:', buyer.fullName],
  ['Adresi:', buyer.address],
  ['Telefon Numarası', buyer.phone],
  ['E-posta adresi', buyer.email],
])}

<p><strong>3. KONU</strong></p>
<p>İşbu Ön Bilgilendirme Formu'nun konusu, ALICI'nın ${SELLER.website} adlı internet sitesi ("İnternet Sitesi") üzerinden satılan ve aşağıda nitelik ile satış fiyatı belirlenen mal ve hizmetlerin satışı ve teslimi ile ilgili olarak Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince bilgilendirilmesidir.</p>

${buildProductTable(products, currency)}

${buildInfoTable([
  ['Ürün Teslim/Kargo Ücreti:', orderSummary.shippingCost > 0 ? formatCurrency(orderSummary.shippingCost, currency) : 'Ücretsiz'],
  ['KDV Dahil Toplam Tutar', formatCurrency(orderSummary.total, currency)],
])}

<p><strong>4. ÜRÜNLERİN TESLİMATI VE ÖDEME ŞEKLİ</strong></p>
<p><strong>4.1 </strong>İnternet sitesi üzerinden hizmet satışlarında, hizmetin niteliğine göre anında ifa ve teslim gerçekleştirilir. Böyle bir durumda fatura kalıcı veri saklayıcısı aracı ile alıcıya gönderilir.</p>
<p><strong>4.2 </strong>İnternet sitesi üzerinden ürün satışlarında ürün, alıcının internet sitesi üzerinde belirttiği teslimat adresine veya kendisinin yönlendirdiği adresteki kişi/kuruma, faturasıyla birlikte en geç 30 gün içinde teslim edilir. Teslim, kargo masrafları alıcıya aittir. İşbu yükümlülüğünün yerine getirilmemesi durumunda alıcı, sözleşmeyi feshedebilir. Sözleşmenin feshi durumunda, satıcı tahsil edilen tüm ödemeleri fesih bildiriminin kendisine ulaştığı tarihten itibaren 14 gün içinde alıcıya iade eder.</p>
<p><strong>4.3 </strong>Sipariş konusu mal ya da hizmet ediminin yerine getirilmesinin imkansızlaştığı hallerde satıcı bu durumu öğrendiği tarihten itibaren üç gün içinde alıcıya kalıcı veri saklayıcısı ile bildirecek, varsa teslimat masrafları da dâhil olmak üzere tahsil edilen tüm ödemeleri bildirim tarihinden itibaren en geç on dört gün içinde iade edecektir.</p>
<p><strong>4.4 </strong>Alıcı, ürünü teslim aldığı anda kontrol etmekle ve üründe kargodan kaynaklanan bir sorun gördüğünde, ürünü kabul etmemekle ve kargo firması yetkilisine tutanak tutturmakla sorumludur. Aksi halde satıcı sorumluluk kabul etmeyecektir.</p>
<p><strong>4.5 </strong>Alıcı, kendi anlaşmalı olduğu Bankası ile internet sitesi üzerinden kredi kartı ile taksitli alışveriş yapabilir. Bu durumdaki alışveriş, doğrudan anılan kuruluşca sağlanmış taksitli ödeme imkanıdır; bu çerçevede gerçekleşen satışlar işbu sözleşmenin tarafları yönünden taksitli satış sayılmaz.</p>

${buildInfoTable([
  ['Ödeme Şekli:', paymentMethod],
  ['Teslim Edilecek Kişi/Kurum:', buyer.fullName],
  ['Teslim Edilecek Kişi/Kurum Telefon Numarası:', buyer.phone],
  ['Teslimat Adresi:', deliveryAddress],
  ['Fatura Adresi:', buyer.address],
])}

<p><strong>5. GENEL HÜKÜMLER</strong></p>
<p><strong>5.1 </strong>Alıcı, internet sitesinde gösterilen ürün ve hizmetlerin temel nitelikleri, satış fiyatı, ödeme şekli ve teslimatına ilişkin ön bilgileri okuyup, bilgi sahibi olduğunu ve elektronik ortamda gerekli onayı verdiğini kabul eder.</p>
<p><strong>5.2 </strong>Satıcı, sözleşme konusu ürünün eksiksiz bir şekilde, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile teslim edilmesinden sorumludur.</p>
<p><strong>5.3 </strong>Sözleşmeye konu olan ürün veya hizmetin, internet sitesi üzerinde sahip olması gereken özellikleri taşımaması sebebiyle sözleşmeye aykırılık teşkil etmesi durumunda alıcı, satılanı geri vermeye hazır olduğunu bildirerek sözleşmeden dönme, satılanı alıkoyup ayıp oranında satış bedelinden indirim isteme, aşırı bir masraf gerektirmediği takdirde, bütün masrafları satıcıya ait olmak üzere satılanın ücretsiz onarılmasını isteme, imkân varsa, satılanın ayıpsız bir misli ile değiştirilmesini isteme seçimlik haklarından birini kullanabilir. Ücretsiz onarım veya malın ayıpsız misli ile değiştirilmesi haklarından birinin seçilmesi durumunda bu talebin satıcıya, yöneltilmesinden itibaren azami 30 iş günü içinde bu talep yerine getirilir. Alıcının sözleşmeden dönme veya ayıp oranında bedelden indirim hakkını seçtiği durumlarda, ödemiş olduğu bedelin tümü veya bedelden yapılan indirim tutarı derhâl alıcıya iade edilir. Ayıplı maldan sorumluluk, ayıp daha sonra ortaya çıkmış olsa bile, malın alıcıya teslim tarihinden itibaren iki yıllık zamanaşımına tabidir. Alıcının, sözleşmenin kurulduğu tarihte ayıptan haberdar olduğu veya haberdar olmasının kendisinden beklendiği hâllerde, sözleşmeye aykırılık söz konusu olmaz. Bunların dışındaki ayıplara karşı alıcının seçimlik hakları yukarıda belirtildiği üzere mevcuttur.</p>
<p><strong>5.4 </strong>Alıcı tarafından herhangi bir nedenle ürün/hizmet bedeli ödenmez veya banka kayıtlarında iptal edilir ise, satıcı ürünün/hizmetin teslimi yükümlülüğünde olmayacaktır.</p>

<p><strong>6. CAYMA HAKKI</strong></p>
<p><strong>6.1 </strong>Alıcı, 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin mal/ürün satışlarına ilişkin olarak sözleşmeden cayma hakkına sahiptir. Elektronik ortamda anında ifa edilen hizmetler veya alıcıya anında teslim edilen gayrimaddi mallara ilişkin satışlarda cayma hakkı kullanılamaz.</p>
<p><strong>6.2 </strong>Alıcı 14 günlük süre içerisinde cayma hakkı kullanılacak ürünleri kutusu, ambalajı, varsa standart aksesuarları ile birlikte eksiksiz ve hasarsız olarak teslim etmelidir. Ürün koruma bandının sökülmesi, hasar görmesi, ürün-aksesuarlarda eksiklik olması ya da ürünlerin kullanılması, tahrip edilmesi halinde cayma hakkı kullanılamaz.</p>
<p><strong>6.3 </strong>Alıcının cayma hakkı süresi, hizmet alımına ilişkin sözleşmelerde sözleşmenin kurulduğu gün; ürün alımına ilişkin sözleşmelerde ise alıcının veya alıcı tarafından belirlenen üçüncü kişinin malı teslim aldığı gün başlar. Aynı zamanda alıcı, sözleşmenin kurulmasından malın teslimine kadar olan süre içinde de cayma hakkını kullanabilir.</p>
<p><strong>6.4 </strong>Cayma hakkı süresinin belirlenmesinde; tek sipariş konusu olup ayrı ayrı teslim edilen ürünlerde, alıcının veya alıcı tarafından belirlenen üçüncü kişinin son ürünü teslim aldığı gün; birden fazla parçadan oluşan ürünlerde, alıcının veya alıcı tarafından belirlenen üçüncü kişinin son parçayı teslim aldığı gün; belirli bir süre boyunca ürünün düzenli tesliminin yapıldığı sözleşmelerde, alıcının veya alıcı tarafından belirlenen üçüncü kişinin ilk malı teslim aldığı gün esas alınır.</p>
<p><strong>6.5 </strong>Cayma hakkının kullanıldığına dair bildirimin cayma hakkı süresi dolmadan, kalıcı veri saklayıcısı ile satıcıya yöneltilmesi gerekmektedir. İlgili hakkınızı ${SELLER.website} internet sitemiz üzerinden, ${SELLER.phone} telefon numarası üzerinden veya ${SELLER.email} eposta üzerinden kullanabilirsiniz.</p>
<p><strong>6.6 </strong>Satıcı, alıcının cayma hakkını kullandığına ilişkin bildirimin kendisine ulaştığı tarihten itibaren 14 gün içinde, varsa malın alıcıya teslim, kargo masrafları da dahil olmak üzere tahsil edilen tüm ödemeleri iade edecektir. Satıcı, söz konusu tüm geri ödemeleri, alıcının satın alırken kullandığı ödeme aracına uygun bir şekilde ve alıcıya herhangi bir masraf veya yükümlülük getirmeden tek seferde gerçekleştirecektir.</p>
<p><strong>6.7 </strong>Alıcı cayma hakkını kullandığına ilişkin bildirimi satıcıya yönelttiği tarihten itibaren 10 gün içinde malı satıcıya geri göndermek zorundadır.</p>
<p><strong>6.8 </strong>Alıcı aşağıdaki sözleşmelerde cayma hakkını kullanamaz:</p>
<p>a) Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ve satıcı kontrolünde olmayan mal veya hizmetlere ilişkin sözleşmeler.</p>
<p>b) Alıcının istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler.</p>
<p>c) Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine ilişkin sözleşmeler.</p>
<p>ç) Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanların teslimine ilişkin sözleşmeler.</p>
<p>d) Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan mallara ilişkin sözleşmeler.</p>
<p>e) Malın tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olması halinde maddi ortamda sunulan kitap, dijital içerik ve bilgisayar sarf malzemelerine ilişkin sözleşmeler.</p>
<p>f) Abonelik sözleşmesi kapsamında sağlananlar dışında, gazete ve dergi gibi süreli yayınların teslimine ilişkin sözleşmeler.</p>
<p>g) Belirli bir tarihte veya dönemde yapılması gereken, konaklama, eşya taşıma, araba kiralama, yiyecek-içecek tedariki ve eğlence veya dinlenme amacıyla yapılan boş zamanın değerlendirilmesine ilişkin sözleşmeler.</p>
<p>ğ) Elektronik ortamda anında ifa edilen hizmetler veya alıcıya anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler.</p>
<p>h) Cayma hakkı süresi sona ermeden önce, alıcının onayı ile ifasına başlanan hizmetlere ilişkin sözleşmeler.</p>

<p><strong>7. MÜCBİR SEBEPLER</strong></p>
<p><strong>7.1 </strong>Sözleşmenin yürürlüğe girdiği tarihte mevcut olmayan veya öngörülemeyen, tarafların kontrolleri dışında gelişen, ortaya çıkmasıyla taraflardan birinin ya da her ikisinin de sözleşme ile yüklendikleri borç ve sorumluluklarını kısmen ya da tamamen yerine getirmelerini ya da bunları zamanında yerine getirmelerini olanaksızlaştıran durumlar, mücbir sebep (Doğal afet, savaş, terör, ayaklanma, değişen mevzuat hükümleri, el koyma veya grev, lokavt, üretim ve iletişim tesislerinde önemli ölçüde arıza vb.) olarak kabul edilecektir. Mücbir sebep şahsında gerçekleşen taraf, diğer tarafa durumu en kısa sürede bildirecektir.</p>
<p><strong>7.2 </strong>Mücbir sebebin devamı esnasında tarafların edimlerini yerine getirememelerinden dolayı herhangi bir sorumlulukları doğmayacaktır. Mücbir sebep durumu 30 gün süreyle devam ederse, taraflardan her birinin, tek taraflı olarak fesih hakkı doğmuş olacaktır.</p>

<p><strong>8. UYUŞMAZLIK DURUMUNDA YETKİLİ MAHKEME</strong></p>
<p><strong>8.1 </strong>Gümrük ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri, aşan durumlarda alıcının ve satıcının yerleşim yerindeki Tüketici Mahkemeleri ve İcra Müdürlükleri yetkilidir.</p>

<p><strong>9. KABUL BEYANI</strong></p>
<p><strong>9.1 </strong>Alıcı, İnternet Sitesinde yer alan Ön Bilgilendirme Formu'nda yazılı tüm koşulları ve açıklamaları okuduğunu, satışa konu ürünler/hizmetlerin temel özellik, nitelikleri, satış fiyatı, ödeme şekli, teslimat koşulları, satıcı ve satışa konu ürünler/hizmetler ile ilgili diğer tüm hususlarda önceden bilgi sahibi olduğunu, tamamını internet sitesinde elektronik ortamda gördüğünü, okuduğunu, içeriğini kabul ettiğini ve yine tüm bunlara elektronik ortamda onay, kabul iznini vererek ürünleri/hizmetleri sipariş ile işbu hükümleri kabul ettiğini kabul ve beyan eder.</p>

<p>Sözleşme Tarihi: <strong>${date}</strong></p>
`.trim();
}

// ---------------------------------------------------------------------------
// Mesafeli Satış Sözleşmesi
// ---------------------------------------------------------------------------

export function generateDistanceSaleHtml(data: ContractData): string {
  const { buyer, products, orderSummary, paymentMethod, deliveryAddress, date } = data;
  const currency = orderSummary.currency;

  return `
<p><strong>MESAFELİ SATIŞ SÖZLEŞMESİ</strong></p>

<p><strong>1. TANIMLAR</strong></p>
<p><strong>Satıcı: </strong>Kamu tüzel kişileri de dahil olmak üzere ticari veya mesleki amaçlarla tüketiciye mal sunan ya da mal sunanın adına ya da hesabına hareket eden gerçek veya tüzel kişiyi,</p>
<p><strong>Tüketici, Alıcı: </strong>Ticari veya mesleki olmayan amaçlarla hareket eden gerçek veya tüzel kişiyi,</p>
<p><strong>Mal/Ürün: </strong>Alışverişe konu olan; taşınır eşya, konut veya tatil amaçlı taşınmaz mallar ile elektronik ortamda kullanılmak üzere hazırlanan yazılım, ses, görüntü ve benzeri her türlü gayri maddi malları,</p>
<p><strong>Hizmet: </strong>Bir ücret veya menfaat karşılığında yapılan ya da yapılması taahhüt edilen mal sağlama dışındaki her türlü tüketici işleminin konusunu,</p>
<p><strong>Mesafeli Sözleşme: </strong>Satıcı ile tüketicinin eş zamanlı fiziksel varlığı olmaksızın, mal veya hizmetlerin uzaktan pazarlanmasına yönelik olarak oluşturulmuş bir sistem çerçevesinde, taraflar arasında sözleşmenin kurulduğu ana kadar ve kurulduğu an da dahil olmak üzere uzaktan iletişim araçlarının kullanılması suretiyle kurulan sözleşmeleri,</p>
<p><strong>Kalıcı Veri Saklayıcısı: </strong>Tüketicinin gönderdiği veya kendisine gönderilen bilgiyi, bu bilginin amacına uygun olarak makul bir süre incelemesine elverecek şekilde kaydedilmesini ve değiştirilmeden kopyalanmasını sağlayan ve bu bilgiye aynen ulaşılmasına imkân veren kısa mesaj, elektronik posta, internet, disk, CD, DVD, hafıza kartı ve benzeri her türlü araç veya ortamı</p>
<p>İfade eder.</p>

<p><strong>2. SÖZLEŞMENİN KONUSU VE TARAFLAR</strong></p>
<p><strong>2.1 </strong>İşbu sözleşme, aşağıda detay bilgileri bulunan ALICI'nın, SATICI tarafından işletilmekte olan ${SELLER.website} (bundan sonra İNTERNET SİTESİ olarak anılacaktır) internet sitesi üzerinden yapmış olduğu ürün ve hizmetlerin satışı ve ürünlerin teslimat adresine gönderimi ile ilgili olarak Tüketicilerin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak, hukuk ve yükümlülüklerini belirler. Sözleşmede hüküm bulunmayan hallerde yasal mevzuat hükümleri uygulanır.</p>
<p><strong>2.2 </strong>Alıcı, satışa konu mal veya hizmetlerin temel nitelikleri, satış fiyatı, ödeme şekli, teslimat koşulları ve satışa konu mal veya hizmetler ile ilgili tüm ön bilgiler ve cayma hakkı konusunda bilgi sahibi olduğunu, bu ön bilgileri elektronik ortamda teyit ettiğini ve sonrasında mal veya hizmetleri sipariş verdiğini iş bu sözleşme hükümlerince kabul ve beyan eder. İnternet sitesinin ödeme sayfasında yer alan ön bilgilendirme formu ve fatura işbu sözleşmenin ayrılmaz parçalarıdır.</p>

<p><strong>2.3 Satıcı Bilgileri</strong></p>
${buildInfoTable([
  ['Unvanı:', SELLER.name],
  ['Adresi:', SELLER.address],
  ['Telefon Numarası', SELLER.phone],
  ['MERSİS Numarası', SELLER.mersisNo],
])}

<p><strong>2.4 Alıcı Bilgileri</strong></p>
${buildInfoTable([
  ['Adı Soyadı/Unvanı:', buyer.fullName],
  ['Adresi:', buyer.address],
  ['Telefon Numarası', buyer.phone],
  ['E-posta adresi', buyer.email],
])}

<p><strong>3. SÖZLEŞME KONUSU ÜRÜN VE HİZMETLER</strong></p>
${buildProductTable(products, currency)}

${buildInfoTable([
  ['Ürün Teslim/Kargo Ücreti:', orderSummary.shippingCost > 0 ? formatCurrency(orderSummary.shippingCost, currency) : 'Ücretsiz'],
  ['KDV Dahil Toplam Tutar', formatCurrency(orderSummary.total, currency)],
])}

<p><strong>4. TESLİMAT</strong></p>
<p><strong>4.1 </strong>İnternet sitesi üzerinden hizmet satışlarında, hizmetin niteliğine göre anında ifa ve teslim gerçekleştirilir. Böyle bir durumda fatura kalıcı veri saklayıcısı aracı ile alıcıya gönderilir.</p>
<p><strong>4.2 </strong>İnternet sitesi üzerinden ürün satışlarında ürün, alıcının internet sitesi üzerinde belirttiği teslimat adresine veya kendisinin yönlendirdiği adresteki kişi/kuruma, faturasıyla birlikte en geç 30 gün içinde teslim edilir. Teslim, kargo masrafları alıcıya aittir. İşbu yükümlülüğünün yerine getirilmemesi durumunda alıcı, sözleşmeyi feshedebilir. Sözleşmenin feshi durumunda, satıcı tahsil edilen tüm ödemeleri fesih bildiriminin kendisine ulaştığı tarihten itibaren 14 gün içinde alıcıya iade eder.</p>
<p><strong>4.3 </strong>Sipariş konusu mal ya da hizmet ediminin yerine getirilmesinin imkansızlaştığı hallerde satıcı bu durumu öğrendiği tarihten itibaren üç gün içinde alıcıya kalıcı veri saklayıcısı ile bildirecek, varsa teslimat masrafları da dâhil olmak üzere tahsil edilen tüm ödemeleri bildirim tarihinden itibaren en geç on dört gün içinde iade edecektir.</p>
<p><strong>4.4 </strong>Alıcı, ürünü teslim aldığı anda kontrol etmekle ve üründe kargodan kaynaklanan bir sorun gördüğünde, ürünü kabul etmemekle ve kargo firması yetkilisine tutanak tutturmakla sorumludur. Aksi halde satıcı sorumluluk kabul etmeyecektir.</p>

<p><strong>5. ÖDEME ŞEKLİ</strong></p>
<p><strong>5.1 </strong>Alıcı, kendi anlaşmalı olduğu Bankası ile internet sitesi üzerinden kredi kartı ile taksitli alışveriş yapabilir. Bu durumdaki alışveriş, doğrudan anılan kuruluşca sağlanmış taksitli ödeme imkanıdır; bu çerçevede gerçekleşen satışlar işbu sözleşmenin tarafları yönünden taksitli satış sayılmaz.</p>

${buildInfoTable([
  ['Ödeme Şekli:', paymentMethod],
  ['Teslim Edilecek Kişi/Kurum:', buyer.fullName],
  ['Teslim Edilecek Kişi/Kurum Telefon Numarası:', buyer.phone],
  ['Teslimat Adresi:', deliveryAddress],
  ['Fatura Adresi:', buyer.address],
])}

<p><strong>6. GENEL HÜKÜMLER</strong></p>
<p><strong>6.1 </strong>Alıcı, internet sitesinde gösterilen ürün ve hizmetlerin temel nitelikleri, satış fiyatı, ödeme şekli ve teslimatına ilişkin ön bilgileri okuyup, bilgi sahibi olduğunu ve elektronik ortamda gerekli onayı verdiğini kabul eder.</p>
<p><strong>6.2 </strong>Satıcı, sözleşme konusu ürünün eksiksiz bir şekilde, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile teslim edilmesinden sorumludur.</p>
<p><strong>6.3 </strong>Sözleşmeye konu olan ürün veya hizmetin, internet sitesi üzerinde sahip olması gereken özellikleri taşımaması sebebiyle sözleşmeye aykırılık teşkil etmesi durumunda alıcı, satılanı geri vermeye hazır olduğunu bildirerek sözleşmeden dönme, satılanı alıkoyup ayıp oranında satış bedelinden indirim isteme, aşırı bir masraf gerektirmediği takdirde, bütün masrafları satıcıya ait olmak üzere satılanın ücretsiz onarılmasını isteme, imkân varsa, satılanın ayıpsız bir misli ile değiştirilmesini isteme seçimlik haklarından birini kullanabilir. Ücretsiz onarım veya malın ayıpsız misli ile değiştirilmesi haklarından birinin seçilmesi durumunda bu talebin satıcıya, yöneltilmesinden itibaren azami 30 iş günü içinde bu talep yerine getirilir. Alıcının sözleşmeden dönme veya ayıp oranında bedelden indirim hakkını seçtiği durumlarda, ödemiş olduğu bedelin tümü veya bedelden yapılan indirim tutarı derhâl alıcıya iade edilir. Ayıplı maldan sorumluluk, ayıp daha sonra ortaya çıkmış olsa bile, malın alıcıya teslim tarihinden itibaren iki yıllık zamanaşımına tabidir. Alıcının, sözleşmenin kurulduğu tarihte ayıptan haberdar olduğu veya haberdar olmasının kendisinden beklendiği hâllerde, sözleşmeye aykırılık söz konusu olmaz. Bunların dışındaki ayıplara karşı alıcının seçimlik hakları yukarıda belirtildiği üzere mevcuttur.</p>
<p><strong>6.4 </strong>Alıcı tarafından herhangi bir nedenle ürün/hizmet bedeli ödenmez veya banka kayıtlarında iptal edilir ise, satıcı ürünün/hizmetin teslimi yükümlülüğünde olmayacaktır.</p>

<p><strong>7. CAYMA HAKKI</strong></p>
<p><strong>7.1 </strong>Alıcı, 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin mal/ürün satışlarına ilişkin olarak sözleşmeden cayma hakkına sahiptir. Elektronik ortamda anında ifa edilen hizmetler veya alıcıya anında teslim edilen gayrimaddi mallara ilişkin satışlarda cayma hakkı kullanılamaz.</p>
<p><strong>7.2 </strong>Alıcı 14 günlük süre içerisinde cayma hakkı kullanılacak ürünleri kutusu, ambalajı, varsa standart aksesuarları ile birlikte eksiksiz ve hasarsız olarak teslim etmelidir. Ürün koruma bandının sökülmesi, hasar görmesi, ürün-aksesuarlarda eksiklik olması ya da ürünlerin kullanılması, tahrip edilmesi halinde cayma hakkı kullanılamaz.</p>
<p><strong>7.3 </strong>Alıcının cayma hakkı süresi, hizmet alımına ilişkin sözleşmelerde sözleşmenin kurulduğu gün; ürün alımına ilişkin sözleşmelerde ise alıcının veya alıcı tarafından belirlenen üçüncü kişinin malı teslim aldığı gün başlar. Aynı zamanda alıcı, sözleşmenin kurulmasından malın teslimine kadar olan süre içinde de cayma hakkını kullanabilir.</p>
<p><strong>7.4 </strong>Cayma hakkı süresinin belirlenmesinde; tek sipariş konusu olup ayrı ayrı teslim edilen ürünlerde, alıcının veya alıcı tarafından belirlenen üçüncü kişinin son ürünü teslim aldığı gün; birden fazla parçadan oluşan ürünlerde, alıcının veya alıcı tarafından belirlenen üçüncü kişinin son parçayı teslim aldığı gün; belirli bir süre boyunca ürünün düzenli tesliminin yapıldığı sözleşmelerde, alıcının veya alıcı tarafından belirlenen üçüncü kişinin ilk malı teslim aldığı gün esas alınır.</p>
<p><strong>7.5 </strong>Cayma hakkının kullanıldığına dair bildirimin cayma hakkı süresi dolmadan, kalıcı veri saklayıcısı ile satıcıya yöneltilmesi gerekmektedir. İlgili hakkınızı ${SELLER.website} internet sitemiz üzerinden, ${SELLER.phone} telefon numarası üzerinden veya ${SELLER.email} eposta üzerinden kullanabilirsiniz.</p>
<p><strong>7.6 </strong>Satıcı, alıcının cayma hakkını kullandığına ilişkin bildirimin kendisine ulaştığı tarihten itibaren 14 gün içinde, varsa malın alıcıya teslim, kargo masrafları da dahil olmak üzere tahsil edilen tüm ödemeleri iade edecektir. Satıcı, söz konusu tüm geri ödemeleri, alıcının satın alırken kullandığı ödeme aracına uygun bir şekilde ve alıcıya herhangi bir masraf veya yükümlülük getirmeden tek seferde gerçekleştirecektir.</p>
<p><strong>7.7 </strong>Alıcı cayma hakkını kullandığına ilişkin bildirimi satıcıya yönelttiği tarihten itibaren 10 gün içinde malı satıcıya geri göndermek zorundadır.</p>
<p><strong>7.8 </strong>Alıcı aşağıdaki sözleşmelerde cayma hakkını kullanamaz:</p>
<p>a) Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ve satıcı kontrolünde olmayan mal veya hizmetlere ilişkin sözleşmeler.</p>
<p>b) Alıcının istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler.</p>
<p>c) Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine ilişkin sözleşmeler.</p>
<p>ç) Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanların teslimine ilişkin sözleşmeler.</p>
<p>d) Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan mallara ilişkin sözleşmeler.</p>
<p>e) Malın tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olması halinde maddi ortamda sunulan kitap, dijital içerik ve bilgisayar sarf malzemelerine ilişkin sözleşmeler.</p>
<p>f) Abonelik sözleşmesi kapsamında sağlananlar dışında, gazete ve dergi gibi süreli yayınların teslimine ilişkin sözleşmeler.</p>
<p>g) Belirli bir tarihte veya dönemde yapılması gereken, konaklama, eşya taşıma, araba kiralama, yiyecek-içecek tedariki ve eğlence veya dinlenme amacıyla yapılan boş zamanın değerlendirilmesine ilişkin sözleşmeler.</p>
<p>ğ) Elektronik ortamda anında ifa edilen hizmetler veya alıcıya anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler.</p>
<p>h) Cayma hakkı süresi sona ermeden önce, alıcının onayı ile ifasına başlanan hizmetlere ilişkin sözleşmeler.</p>

<p><strong>8. MÜCBİR SEBEPLER</strong></p>
<p><strong>8.1 </strong>Sözleşmenin yürürlüğe girdiği tarihte mevcut olmayan veya öngörülemeyen, tarafların kontrolleri dışında gelişen, ortaya çıkmasıyla taraflardan birinin ya da her ikisinin de sözleşme ile yüklendikleri borç ve sorumluluklarını kısmen ya da tamamen yerine getirmelerini ya da bunları zamanında yerine getirmelerini olanaksızlaştıran durumlar, mücbir sebep (Doğal afet, savaş, terör, ayaklanma, değişen mevzuat hükümleri, el koyma veya grev, lokavt, üretim ve iletişim tesislerinde önemli ölçüde arıza vb.) olarak kabul edilecektir. Mücbir sebep şahsında gerçekleşen taraf, diğer tarafa durumu en kısa sürede bildirecektir.</p>
<p><strong>8.2 </strong>Mücbir sebebin devamı esnasında tarafların edimlerini yerine getirememelerinden dolayı herhangi bir sorumlulukları doğmayacaktır. Mücbir sebep durumu 30 gün süreyle devam ederse, taraflardan her birinin, tek taraflı olarak fesih hakkı doğmuş olacaktır.</p>

<p><strong>9. DELİL ANLAŞMASI</strong></p>
<p><strong>9.1 </strong>İşbu sözleşmeden doğabilecek her türlü uyuşmazlığın çözümünde satıcı kayıtları (bilgisayar, ses kayıtları gibi manyetik ortamdaki kayıtlar dahil) kesin delil oluşturur.</p>

<p><strong>10. UYUŞMAZLIK DURUMUNDA YETKİLİ MAHKEME</strong></p>
<p><strong>10.1 </strong>Gümrük ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri, aşan durumlarda alıcının ve satıcının yerleşim yerindeki Tüketici Mahkemeleri ve İcra Müdürlükleri yetkilidir.</p>

<p><strong>11. KABUL BEYANI</strong></p>
<p><strong>11.1 </strong>Alıcı, İnternet Sitesinde yer alan ve işbu Sözleşme'de ve ayrılmaz parçasını oluşturan Ön Bilgilendirme Formu'nda yazılı tüm koşulları ve açıklamaları okuduğunu, satışa konu ürünler/hizmetlerin temel özellik, nitelikleri, satış fiyatı, ödeme şekli, teslimat koşulları, satıcı ve satışa konu ürünler/hizmetler ile ilgili diğer tüm hususlarda önceden bilgi sahibi olduğunu, tamamını internet sitesinde elektronik ortamda gördüğünü, okuduğunu, içeriğini kabul ettiğini ve yine tüm bunlara elektronik ortamda onay, kabul iznini vererek ürünleri/hizmetleri sipariş ile işbu Sözleşme hükümlerini kabul ettiğini kabul ve beyan eder.</p>

<p><strong>12. YÜRÜRLÜK</strong></p>
<p><strong>12.1 </strong>İşbu Sözleşme, taraflarca okunarak, alıcı tarafından elektronik ortamda onaylanmak ve olumlu bir fiili hareket olarak ödeme yapmak suretiyle akdedilmiş ve yürürlüğe girmiştir.</p>

<p>Sözleşme Tarihi: <strong>${date}</strong></p>
`.trim();
}

export { DOC_VERSION };
