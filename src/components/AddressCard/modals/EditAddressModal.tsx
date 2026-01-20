import ModalCard from '@/components/common/ModalCard';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { LoadingButton } from '@mui/lab';
import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import AddressForm from '../AddressForm';
import styles from '../styles';
import { CircleCheckBig, TriangleAlert } from 'lucide-react';

interface EditAddressModalProps {
  initialData: AddressData;
  open: boolean;
  onClose: () => void;
  onEdited: (address: AddressData) => void;
}

const EditAddressModal = ({ initialData, open, onEdited, onClose }: EditAddressModalProps) => {
  const { editAddress } = useAddress();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(0);

  const { id, ...initialValues } = initialData;

  const formattedDate = initialValues?.dateOfBirth?.split(' ')[0]?.split('.').reverse().join('-');

  const handleClose = () => {
    setLoading(false);
    setSuccess(false);
    setError(false);
    onClose();
  };

  const handleSubmit = (values: AddressData) => {
    if (!id) {
      setError(true);
      return;
    }
    setLoading(true);
    editAddress({ entryId: id.toString(), ...(values as AddressData) }).then((result) => {
      if (result) {
        onEdited({ ...(values as AddressData), id });
        setSuccess(true);
      } else setError(true);
      setLoading(false);
    });
  };

  return (
    <ModalCard
      open={open}
      onClose={handleClose}
      iconName="edit"
      showCloseIcon
      title= "Adres Düzenle"
      CardProps={{ sx: styles.modalCard }}
    >
      <Stack sx={{ display: success || error ? 'none' : 'flex' }}>
        <AddressForm
          onSubmit={handleSubmit}
          submitTrigger={submitTrigger}
          initialValues={{ ...initialValues, dateOfBirth: formattedDate }} 
        />
        <LoadingButton
          fullWidth
          loading={loading}
          variant="contained"
          onClick={() => setSubmitTrigger((prev) => prev + 1)}
          sx={{ width: { sm: '75%' }, mt: { xs: 2, md: 3 }, mx: 'auto' }}
        >
          Değişiklikleri kaydet
        </LoadingButton>
      </Stack>
      {success && (
        <Stack sx={styles.cardBody} alignItems="center" textAlign="center" minWidth={300}>
          <Stack gap={1} pb={2}>
            <CircleCheckBig size={80} color="success" />
            <Typography> Adres değiştirildi. </Typography>
          </Stack>
          <Button fullWidth variant="contained" onClick={handleClose}>
          Tamam
          </Button>
        </Stack>
      )}
      {error && (
        <Stack sx={styles.cardBody} alignItems="center" textAlign="center" minWidth={300}>
          <Stack gap={1} pb={2}>
            <TriangleAlert size={80} color="error" />
            <Typography> Bir sunucu hatası oluştu, lütfen tekrar deneyin. </Typography>
          </Stack>
          <Button fullWidth variant="contained" onClick={() => setError(false)}>
          Geri Dön
          </Button>
        </Stack>
      )}
    </ModalCard>
  );
};

export default EditAddressModal;
