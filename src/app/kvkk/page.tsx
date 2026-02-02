import LegalDocumentView from '@/components/contracts/LegalDocumentView';
import { getLegalDocument } from '@/content/legal';
import { notFound } from 'next/navigation';

const document = getLegalDocument('kvkk');

export const metadata = {
  title: document?.metaTitle ?? document?.title ?? 'KVKK Aydınlatma Metni',
  description:
    document?.metaDescription ??
    'Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
};

const KvkkPage = () => {
  if (!document) {
    notFound();
  }

  return <LegalDocumentView document={document} />;
};

export default KvkkPage;
