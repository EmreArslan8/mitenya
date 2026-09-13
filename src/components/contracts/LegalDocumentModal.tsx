import { Typography } from '@/components/ui/Typography';
import ModalCard from '@/components/common/ModalCard';
import LegalDocumentContent from './LegalDocumentContent';

interface LegalDocumentModalProps {
  open: boolean;
  title: string;
  updatedAt?: string;
  html: string;
  onClose: () => void;
}

const LegalDocumentModal = ({ open, title, updatedAt, html, onClose }: LegalDocumentModalProps) => {
  return (
    <ModalCard
      open={open}
      onClose={onClose}
      showCloseIcon
      fullWidth
      border
      title={title}
      className="w-full max-w-full sm:w-[min(900px,calc(100vw-32px))] sm:max-w-[900px]"
      bodyClassName="max-h-[min(72dvh,calc(100dvh-112px))] gap-4 overflow-x-hidden overflow-y-auto sm:max-h-[70vh]"
    >
      {updatedAt && (
        <Typography variant="progressLabel" className="text-text-secondary">
          Son Güncelleme: {updatedAt}
        </Typography>
      )}
      <div>
        <LegalDocumentContent html={html} />
      </div>
    </ModalCard>
  );
};

export default LegalDocumentModal;
