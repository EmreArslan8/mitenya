import { Stack } from '@mui/material';
import ModalCard from '../common/ModalCard';
import Image from 'next/image';

interface IdNumberModalProps {
  open: boolean;
  onClose: () => void;
}

const IdNumberModal = ({ open, onClose }: IdNumberModalProps) => {
  return (
    <ModalCard showCloseIcon open={open} onClose={onClose}>
      <Stack sx={{ position: 'relative', aspectRatio: '998/945', width: '100%' }}>
        <Image src="/static/images/pinfl.jpeg" alt="PINFL" />
      </Stack>
    </ModalCard>
  );
};

export default IdNumberModal;
