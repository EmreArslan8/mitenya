import ModalCard from '@/components/common/ModalCard';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { LoadingButton } from '@mui/lab';
import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import AddressForm from '../AddressForm';
import styles from '../styles';
import { AlertTriangle, CheckCircle2, MapPinPlus } from 'lucide-react';

interface NewAddressModalProps {
  open: boolean;
  onClose: () => void;
  onAddressAdded?: (address: AddressData) => void;
  defaultName?: string;
  closeOnSuccess?: boolean;
}

const NewAddressModal = ({
  open,
  onClose,
  onAddressAdded,
  defaultName,
  closeOnSuccess = false,
}: NewAddressModalProps) => {
  const { addAddress } = useAddress();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(0);

  const handleSubmit = (address: AddressData) => {
    setLoading(true);
    addAddress(address).then((id) => {
      setLoading(false);
      if (!id) return setError(true);
      onAddressAdded?.({ ...address, id });
      if (closeOnSuccess) setSuccess(true);
      else handleClose();
    });
  };

  const handleClose = () => {
    setLoading(false);
    setSuccess(false);
    setError(false);
    onClose();
  };

  return (
    <ModalCard
      open={open}
      onClose={handleClose}
      customIcon={<MapPinPlus size={22} />}
      showCloseIcon
      title="Adres Ekle"
      CardProps={{ sx: styles.modalCard }}
      BodyProps={{ sx: { maxHeight: 'min(78vh, 720px)', overflowY: 'auto' } }}
    >
      <Stack sx={{ display: success || error ? 'none' : 'flex' }}>
        <AddressForm
          onSubmit={handleSubmit}
          submitTrigger={submitTrigger}
          initialValues={{ name: defaultName }}
        />
        <LoadingButton
          fullWidth
          loading={loading}
          variant="contained"
          onClick={() => setSubmitTrigger((prev) => prev + 1)}
          sx={{ width: { sm: '75%' }, mt: { xs: 2, md: 3 }, mx: 'auto' }}
        >
          Adresi Kaydet
        </LoadingButton>
      </Stack>
      {success && (
        <Stack sx={styles.cardBody} alignItems="center" textAlign="center" minWidth={300}>
          <Stack gap={1} pb={2}>
            <CheckCircle2 size={80} color="var(--mui-palette-success-main)" />
            <Typography>Adres eklendi</Typography>
          </Stack>
          <Button fullWidth variant="contained" onClick={handleClose}>
            Tamam
          </Button>
        </Stack>
      )}
      {error && (
        <Stack sx={styles.cardBody} alignItems="center" textAlign="center" minWidth={300}>
          <Stack gap={1} pb={2}>
            <AlertTriangle size={80} color="error.main" />
            <Typography>Adres eklenemedi</Typography>
          </Stack>
          <Button fullWidth variant="contained" onClick={() => setError(false)}>
            Geri
          </Button>
        </Stack>
      )}
    </ModalCard>
  );
};

export default NewAddressModal;
