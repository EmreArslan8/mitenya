import LegalDocumentView from '@/components/contracts/LegalDocumentView';
import { getLegalDocument } from '@/content/legal';
import { notFound } from 'next/navigation';

const document = getLegalDocument('cerez-politikasi');

export const metadata = {
  title: document?.metaTitle ?? document?.title ?? 'Çerez Politikası',
  description: document?.metaDescription ?? 'Çerez politikası ve tercih yönetimi.',
  robots: { index: false, follow: false },
};

const CerezPolitikasiPage = () => {
  if (!document) {
    notFound();
  }

  return <LegalDocumentView document={document} />;
};

export default CerezPolitikasiPage;
