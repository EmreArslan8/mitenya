import { useAuth } from '@/contexts/AuthContext';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { Divider, MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import AddressForm from '../AddressCard/AddressForm';
import Button from '../common/Button';
import useStyles from './styles';
import { ChevronDown, Plus } from 'lucide-react';

interface AddressSelectorProps {
  value?: AddressData;
  onChange: (selected: AddressData) => void;
  options: AddressData[];
  onAddressAdded: (newOption: AddressData) => void;
}

const AddressSelector = ({ value, onChange, options, onAddressAdded }: AddressSelectorProps) => {
  const { isAuthenticated, openAuthenticator } = useAuth();
  const { addAddress } = useAddress();
  const styles = useStyles();
  // TODO: Read the locale from cookie in the redirect helper.

  const [showForm, setShowForm] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (options.length === 0 && isAuthenticated) setShowForm(true);
  }, [options.length, isAuthenticated]);

  const handleSubmit = (address: AddressData) => {
    setSaving(true);
    setError(false);
    addAddress(address).then((id) => {
      setSaving(false);
      if (!id) {
        setError(true);
        return;
      }
      onAddressAdded?.({ ...address, id });
      setShowForm(false);
    });
  };

  return (
    <Stack gap={0.5}>
      {options.length ? (
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
                <Typography variant="body" fontSize={14} fontStyle="italic">
                  {option.line1}
                </Typography>
              </MenuItem>,
              <Divider flexItem sx={styles.divider} key={`${option.name}-divider`} />,
            ])}
          {!showForm && (
            <Button
              fullWidth
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Plus />}
              onClick={() => {
                if (!isAuthenticated) return openAuthenticator();
                setShowForm(true);
              }}
              sx={{ mt: 0.5 }}
            >
              Yeni adres ekle
            </Button>
          )}
        </Select>
      ) : (
        <Stack gap={1}>
          {!showForm && (
            <Button
              fullWidth
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Plus />}
              onClick={() => (isAuthenticated ? setShowForm(true) : openAuthenticator())}
              sx={{ mt: 0.5 }}
            >
              Yeni adres ekle
            </Button>
          )}
        </Stack>
      )}
      {showForm && (
        <Stack gap={1.5} mt={1}>
          <AddressForm
            onSubmit={handleSubmit}
            submitTrigger={submitTrigger}
            initialValues={{ name: `Adres ${options.length + 1}` }}
          />
          {error && (
            <Typography variant="body" color="error.main">
              Adres eklenemedi, tekrar deneyin.
            </Typography>
          )}
          <Stack direction="row" gap={1}>
            <LoadingButton
              fullWidth
              loading={saving}
              variant="contained"
              onClick={() => setSubmitTrigger((prev) => prev + 1)}
            >
              Adresi Kaydet
            </LoadingButton>
            {options.length > 0 && (
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={() => setShowForm(false)}
              >
                Vazgeç
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default AddressSelector;
