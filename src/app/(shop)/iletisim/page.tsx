import { Metadata } from 'next';
import IletisimView from './view';

export const metadata: Metadata = {
  title: 'İletişim | Mitenya',
  description:
    'Mitenya ile iletişime geçin. Sorularınız, önerileriniz veya işbirliği talepleriniz için bize ulaşın.',
  alternates: {
    canonical: '/iletisim',
  },
};

const IletisimPage = () => {
  return <IletisimView />;
};

export default IletisimPage;
