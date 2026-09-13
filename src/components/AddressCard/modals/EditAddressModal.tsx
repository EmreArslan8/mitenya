import ModalCard from '@/components/common/ModalCard';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useState } from 'react';
import AddressForm from '../AddressForm';
import { CircleCheckBig } from '@/components/icons';
import { Pencil } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';

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
      customIcon={<Pencil size={24} />}
      showCloseIcon
      title= "Adres Düzenle"
      className="sm:max-w-[560px]"
      bodyClassName="max-h-[min(78vh,720px)] overflow-y-auto"
    >
      <div className={success || error ? 'hidden' : 'flex flex-col'}>
        <AddressForm
          onSubmit={handleSubmit}
          submitTrigger={submitTrigger}
          initialValues={{ ...initialValues, dateOfBirth: formattedDate }} 
        />
        <Button
          fullWidth
          loading={loading}
          variant="contained"
          onClick={() => setSubmitTrigger((prev) => prev + 1)}
          className="mx-auto mt-4 sm:w-3/4 md:mt-6"
        >
          Değişiklikleri kaydet
        </Button>
      </div>
      {success && (
        <div className="flex min-w-[300px] flex-col items-center gap-4 px-4 pb-5 pt-4 text-center sm:px-5">
          <div className="flex flex-col items-center gap-2 pb-4 text-success">
            <CircleCheckBig size={80} />
            <Typography> Adres değiştirildi. </Typography>
          </div>
          <Button fullWidth variant="contained" onClick={handleClose}>
          Tamam
          </Button>
        </div>
      )}
      {error && (
        <div className="flex min-w-[300px] flex-col items-center gap-4 px-4 pb-5 pt-4 text-center sm:px-5">
          <div className="flex flex-col items-center gap-2 pb-4 text-error">
            <TriangleAlert size={80} />
            <Typography> Bir sunucu hatası oluştu, lütfen tekrar deneyin. </Typography>
          </div>
          <Button fullWidth variant="contained" onClick={() => setError(false)}>
          Geri Dön
          </Button>
        </div>
      )}
    </ModalCard>
  );
};

export default EditAddressModal;
