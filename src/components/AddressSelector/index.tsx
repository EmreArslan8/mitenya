import { useAuth } from '@/contexts/AuthContext';
import { AddressData } from '@/lib/api/types';
import { Divider, MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import NewAddressModal from '../AddressCard/modals/NewAddressModal';
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
  const styles = useStyles();
  // TODO: Read the locale from cookie in the redirect helper.

  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);

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
          <Button
            fullWidth
            size="small"
            startIcon={<Plus />}
            onClick={() => setNewAddressModalOpen(true)}
            sx={styles.addButton}
          >
            Yeni adres ekle
          </Button>
        </Select>
      ) : (
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<Plus />}
          onClick={() => (isAuthenticated ? setNewAddressModalOpen(true) : openAuthenticator())}
          sx={styles.addButton}
        >
          Yeni adres ekle
        </Button>
      )}
      <NewAddressModal
        open={newAddressModalOpen}
        onClose={() => setNewAddressModalOpen(false)}
        onAddressAdded={onAddressAdded}
        defaultName={`Adres ${options.length + 1}`}
      />
    </Stack>
  );
};

export default AddressSelector;
