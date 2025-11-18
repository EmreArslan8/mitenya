import { LinearProgress, Modal } from '@mui/material';

interface LoadingOverlayProps {
  loading: boolean;
}

const LoadingOverlay = ({ loading }: LoadingOverlayProps) => {
  return (
    <Modal
      open={loading}
      sx={{
        '& .MuiBackdrop-root': { background: '#FFFFFF70' },
        '&:focus': { outline: 'none !important' },
      }}
    >
      <LinearProgress />
    </Modal>
  );
};

export default LoadingOverlay;
