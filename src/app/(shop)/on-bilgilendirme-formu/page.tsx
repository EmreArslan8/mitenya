import LegalDocumentView from '@/components/contracts/LegalDocumentView';
import { getLegalDocument } from '@/content/legal';
import { notFound } from 'next/navigation';

const document = getLegalDocument('on-bilgilendirme-formu');

export const metadata = {
  title: document?.metaTitle ?? document?.title ?? 'Ön Bilgilendirme Formu',
  description: document?.metaDescription ?? 'Mesafeli satış ön bilgilendirme formu.',
  robots: { index: false, follow: false },
};

const OnBilgilendirmeFormuPage = () => {
  if (!document) {
    notFound();
  }

  return <LegalDocumentView document={document} />;
};

export default OnBilgilendirmeFormuPage;
