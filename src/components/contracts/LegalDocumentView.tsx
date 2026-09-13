import { Typography } from '@/components/ui/Typography';
import type { LegalDocument } from './types';
import LegalDocumentContent from './LegalDocumentContent';

const LegalDocumentView = ({ document }: { document: LegalDocument }) => {
  return (
    <div className="mx-auto mb-6 mt-[62px] flex w-full max-w-[900px] flex-col gap-6 sm:mt-0">
      <div className="flex flex-col gap-2">
        <Typography variant="h1">{document.title}</Typography>
        {document.updatedAt && (
          <Typography variant="progressLabel" className="text-text-secondary">
            Son Güncelleme: {document.updatedAt}
          </Typography>
        )}
      </div>
      <LegalDocumentContent html={document.html} />
    </div>
  );
};

export default LegalDocumentView;
