import LegalDocumentView from '@/components/contracts/LegalDocumentView';
import { getLegalDocument } from '@/content/legal';
import { notFound } from 'next/navigation';

const document = getLegalDocument('kullanim-kosullari');

export const metadata = {
  title: document?.metaTitle ?? document?.title ?? 'Kullanım Koşulları',
  description: document?.metaDescription ?? 'Kullanım koşulları metni.',
};

const KullanimKosullariPage = () => {
  if (!document) {
    notFound();
  }

  return <LegalDocumentView document={document} />;
};

export default KullanimKosullariPage;
