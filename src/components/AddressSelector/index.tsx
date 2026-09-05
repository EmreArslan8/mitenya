import { useAuth } from '@/contexts/AuthContext';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { Divider, MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import AddressForm from '../AddressCard/AddressForm';
import NewAddressModal from '../AddressCard/modals/NewAddressModal';
import Button from '../common/Button';
import useStyles from './styles';
import { ChevronDown, Plus } from '@/components/icons';

interface AddressSelectorProps {
  value?: AddressData;
  onChange: (selected: AddressData) => void;
  options: AddressData[];
  onAddressAdded: (newOption: AddressData) => void;
}

const AddressSelector = ({ value, onChange, options, onAddressAdded }: AddressSelectorProps) => {
  const { isAuthenticated } = useAuth();
  const { addAddress } = useAddress();
  const styles = useStyles();
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleInlineSubmit = async (address: AddressData) => {
    if (!isAuthenticated) {
      onAddressAdded({ ...address, id: `guest-${Date.now()}` });
      return;
    }
    setSaving(true);
    const id = await addAddress(address);
    setSaving(false);
    if (id) onAddressAdded({ ...address, id });
  };

  // Adres yoksa (misafir veya kayıtlı adressiz kullanıcı): form direkt açık
  if (!options.length) {
    return (
      <Stack gap={2}>
        <AddressForm
          onSubmit={handleInlineSubmit}
          submitTrigger={submitTrigger}
          initialValues={{ name: 'Adresim' }}
        />
        <Button
          variant="contained"
          size="small"
          loading={saving}
          onClick={() => setSubmitTrigger((p) => p + 1)}
          sx={{ width: { sm: '75%' }, mx: 'auto' }}
        >
          Kaydet
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={0.5}>
      <Select
        fullWidth
        value={value?.id?.toString() ?? ''}
        IconComponent={(props) => (
          <Stack {...props}>
            <ChevronDown />
          </Stack>
        )}
        MenuProps={{ PaperProps: { sx: styles.paper } }}
        onChange={(e: SelectChangeEvent) =>
          e.target.value &&
          onChange(options.find((option) => option.id?.toString() === e.target.value)!)
        }
        renderValue={(value: string) => {
          const address = options.find((e) => e.id?.toString() === value)!;
          return (
            <Stack>
              <Typography variant="infoValue">{address.name}</Typography>
              <Typography variant="caption">
                {[address.line1, address.line2, address.line3].filter(Boolean).join('')}
              </Typography>
            </Stack>
          );
        }}
        sx={styles.select}
      >
        {options
          .filter((option) => option.id !== undefined)
          .map((option) => [
            <MenuItem value={option.id!.toString()} sx={styles.option} key={option.id}>
              <Typography variant="body">{option.name}</Typography>
              <Typography variant="body" fontSize={14} fontStyle="italic" fontFamily="var(--font-albert-sans-italic)">
                {option.line1}
              </Typography>
            </MenuItem>,
            <Divider flexItem sx={styles.divider} key={`${option.name}-divider`} />,
          ])}
        <Button
          fullWidth
          size="small"
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setNewAddressModalOpen(true)}
          sx={styles.addButton}
        >
          Yeni adres ekle
        </Button>
      </Select>
      <NewAddressModal
        open={newAddressModalOpen}
        onClose={() => setNewAddressModalOpen(false)}
        onAddressAdded={onAddressAdded}
        defaultName={`Adres ${options.length + 1}`}
        guestMode={!isAuthenticated}
      />
    </Stack>
  );
};

export default AddressSelector;
