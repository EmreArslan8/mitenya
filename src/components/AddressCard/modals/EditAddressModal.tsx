import ModalCard from '@/components/common/ModalCard';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { LoadingButton } from '@mui/lab';
import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import Icon from '../../Icon';
import AddressForm from '../AddressForm';
import styles from '../styles';

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
      title= {('address.editTitle')}
      CardProps={{ sx: styles.modalCard }}
    >
      <Stack sx={{ display: success || error ? 'none' : 'flex' }}>
        <AddressForm
          onSubmit={handleSubmit}
          submitTrigger={submitTrigger}
          initialValues={{ ...initialValues, dateOfBirth: formattedDate }} // Formda doğru tarih formatını gösterme
        />
        <LoadingButton
          fullWidth
          loading={loading}
          variant="contained"
          onClick={() => setSubmitTrigger((prev) => prev + 1)}
          sx={{ width: { sm: '75%' }, mt: { xs: 2, md: 3 }, mx: 'auto' }}
        >
          {('address.editSaveButton')}
        </LoadingButton>
      </Stack>
      {success && (
        <Stack sx={styles.cardBody} alignItems="center" textAlign="center" minWidth={300}>
          <Stack gap={1} pb={2}>
            <Icon name="task_alt" fontSize={80} color="success" />
            <Typography> {('address.editSuccess')}</Typography>
          </Stack>
          <Button fullWidth variant="contained" onClick={handleClose}>
            {('address.ok')}
          </Button>
        </Stack>
      )}
      {error && (
        <Stack sx={styles.cardBody} alignItems="center" textAlign="center" minWidth={300}>
          <Stack gap={1} pb={2}>
            <Icon name="warning" fontSize={80} color="error" />
            <Typography> {('address.editError')}</Typography>
          </Stack>
          <Button fullWidth variant="contained" onClick={() => setError(false)}>
            {('address.goBack')}
          </Button>
        </Stack>
      )}
    </ModalCard>
  );
};

export default EditAddressModal;
