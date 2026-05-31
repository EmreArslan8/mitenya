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
      fullWidth
      border
      title={title}
      CardProps={{
        sx: {
          width: { xs: '100%', sm: 'min(900px, calc(100vw - 32px))' },
          maxWidth: { xs: '100%', sm: 900 },
        },
      }}
      BodyProps={{
        sx: {
          maxHeight: { xs: 'min(72dvh, calc(100dvh - 112px))', sm: '70vh' },
          overflowY: 'auto',
          overflowX: 'hidden',
          gap: 2,
        },
      }}
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
