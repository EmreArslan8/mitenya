import { Stack, Typography } from '@mui/material';
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
      border
      title={title}
      CardProps={{ sx: { maxWidth: 900 } }}
      BodyProps={{ sx: { maxHeight: '70vh', overflowY: 'auto', gap: 2 } }}
    >
      {updatedAt && (
        <Typography variant="body" sx={{ color: 'text.secondary', fontSize: 13 }}>
          Son Güncelleme: {updatedAt}
        </Typography>
      )}
      <Stack>
        <LegalDocumentContent html={html} />
      </Stack>
    </ModalCard>
  );
};

export default LegalDocumentModal;
