import ModalCard from '@/components/common/ModalCard';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { LoadingButton } from '@mui/lab';
import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import Icon from '../../Icon';
import AddressForm from '../AddressForm';
import styles from '../styles';

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
  const t = useTranslations('common');
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
      iconName="add_location_alt"
      showCloseIcon
      title={t('address.addAddress')}
      CardProps={{ sx: styles.modalCard }}
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
          {t('address.addAddressSubmitButton')}
        </LoadingButton>
      </Stack>
      {success && (
        <Stack sx={styles.cardBody} alignItems="center" textAlign="center" minWidth={300}>
          <Stack gap={1} pb={2}>
            <Icon name="task_alt" fontSize={80} color="success" />
            <Typography>{t('address.addAddressSuccess')}</Typography>
          </Stack>
          <Button fullWidth variant="contained" onClick={handleClose}>
            {t('address.ok')}
          </Button>
        </Stack>
      )}
      {error && (
        <Stack sx={styles.cardBody} alignItems="center" textAlign="center" minWidth={300}>
          <Stack gap={1} pb={2}>
            <Icon name="warning" fontSize={80} color="error" />
            <Typography>{t('address.addAddressError')}</Typography>
          </Stack>
          <Button fullWidth variant="contained" onClick={() => setError(false)}>
            {t('address.goBack')}
          </Button>
        </Stack>
      )}
    </ModalCard>
  );
};

export default NewAddressModal;
