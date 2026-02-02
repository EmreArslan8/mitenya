import LegalDocumentView from '@/components/contracts/LegalDocumentView';
import { getLegalDocument } from '@/content/legal';
import { notFound } from 'next/navigation';

const document = getLegalDocument('uyelik-ve-kullanim-sartlari');

export const metadata = {
  title: document?.metaTitle ?? document?.title ?? 'Üyelik ve Kullanım Şartları',
  description: document?.metaDescription ?? 'Üyelik ve kullanım şartları sözleşmesi.',
};

const UyelikVeKullanimSartlariPage = () => {
  if (!document) {
    notFound();
  }

  return <LegalDocumentView document={document} />;
};

export default UyelikVeKullanimSartlariPage;
