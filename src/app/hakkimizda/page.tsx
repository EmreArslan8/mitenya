import { Metadata } from 'next';
import HakkimizdaView from './view';

export const metadata: Metadata = {
  title: 'Hakkımızda | Mitenya',
  description:
    'Mitenya olarak doğal ve etkili kozmetik ürünlerle güzelliğinizi ön plana çıkarıyoruz. Markamızı, misyonumuzu ve değerlerimizi keşfedin.',
  alternates: {
    canonical: '/hakkimizda',
  },
};

const HakkimizdaPage = () => {
  return <HakkimizdaView />;
};

export default HakkimizdaPage;
