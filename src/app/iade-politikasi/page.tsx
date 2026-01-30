import LegalDocumentView from '@/components/contracts/LegalDocumentView';
import { getLegalDocument } from '@/content/legal';
import { notFound } from 'next/navigation';

const document = getLegalDocument('iade-politikasi');

export const metadata = {
  title: document?.metaTitle ?? document?.title ?? 'İade Politikası',
  description:
    document?.metaDescription ?? 'İade ve cayma koşulları hakkında bilgilendirme metni.',
};

const IadePolitikasiPage = () => {
  if (!document) {
    notFound();
  }

  return <LegalDocumentView document={document} />;
};

export default IadePolitikasiPage;
