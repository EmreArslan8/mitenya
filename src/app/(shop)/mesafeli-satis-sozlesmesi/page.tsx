import LegalDocumentView from '@/components/contracts/LegalDocumentView';
import { getLegalDocument } from '@/content/legal';
import { notFound } from 'next/navigation';

const document = getLegalDocument('mesafeli-satis-sozlesmesi');

export const metadata = {
  title: document?.metaTitle ?? document?.title ?? 'Mesafeli Satış Sözleşmesi',
  description: document?.metaDescription ?? 'Mesafeli satış sözleşmesi.',
  robots: { index: false, follow: false },
};

const MesafeliSatisSozlesmesiPage = () => {
  if (!document) {
    notFound();
  }

  return <LegalDocumentView document={document} />;
};

export default MesafeliSatisSozlesmesiPage;
