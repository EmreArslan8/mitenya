import ModalCard from '@/components/common/ModalCard';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useState } from 'react';
import AddressForm from '../AddressForm';
import { AlertTriangle, CheckCircle2, MapPinPlus } from '@/components/icons';

interface NewAddressModalProps {
  open: boolean;
  onClose: () => void;
  onAddressAdded?: (address: AddressData) => void;
  defaultName?: string;
  closeOnSuccess?: boolean;
  guestMode?: boolean;
}

const NewAddressModal = ({
  open,
  onClose,
  onAddressAdded,
  defaultName,
  closeOnSuccess = false,
  guestMode = false,
}: NewAddressModalProps) => {
  const { addAddress } = useAddress();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(0);

  const handleSubmit = (address: AddressData) => {
    if (guestMode) {
      const tempId = `guest-${Date.now()}`;
      onAddressAdded?.({ ...address, id: tempId });
      handleClose();
      return;
    }
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
      className="sm:max-w-[560px]"
      bodyClassName="max-h-[min(78vh,720px)] overflow-y-auto"
    >
      <div className={success || error ? 'hidden' : 'flex flex-col'}>
        <AddressForm
          onSubmit={handleSubmit}
          submitTrigger={submitTrigger}
          initialValues={{ name: defaultName }}
        />
        <Button
          fullWidth
          loading={loading}
          variant="contained"
          onClick={() => setSubmitTrigger((prev) => prev + 1)}
          className="mx-auto mt-4 sm:w-3/4 md:mt-6"
        >
          Adresi Kaydet
        </Button>
      </div>
      {success && (
        <div className="flex min-w-[300px] flex-col items-center gap-4 px-4 pb-5 pt-4 text-center sm:px-5">
          <div className="flex flex-col items-center gap-2 pb-4 text-success">
            <CheckCircle2 size={80} />
            <Typography>Adres eklendi</Typography>
          </div>
          <Button fullWidth variant="contained" onClick={handleClose}>
            Tamam
          </Button>
        </div>
      )}
      {error && (
        <div className="flex min-w-[300px] flex-col items-center gap-4 px-4 pb-5 pt-4 text-center sm:px-5">
          <div className="flex flex-col items-center gap-2 pb-4 text-error">
            <AlertTriangle size={80} />
            <Typography>Adres eklenemedi</Typography>
          </div>
          <Button fullWidth variant="contained" onClick={() => setError(false)}>
            Geri
          </Button>
        </div>
      )}
    </ModalCard>
  );
};

export default NewAddressModal;
