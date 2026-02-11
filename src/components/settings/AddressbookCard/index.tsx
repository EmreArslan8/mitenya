'use client';

import NewAddressModal from '@/components/AddressCard/modals/NewAddressModal';
import Button from '@/components/common/Button';
import { AddressData } from '@/lib/api/types';
import { Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import AddressLine from './AddressLine';
import styles from './styles';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Plus } from 'lucide-react';

const AddressbookCard = ({ addresses }: { addresses: AddressData[] }) => {
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    setLoading(true);
    window.location.reload();
  };

  return (
    <>
      <Stack sx={styles.wrapper}>
        {/* Header */}
        <Stack sx={styles.header}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography sx={styles.headerLabel}>Adreslerim</Typography>
            <Typography sx={styles.headerCount}>({addresses?.length ?? 0})</Typography>
          </Stack>
        </Stack>

        {/* Address list */}
        <Stack sx={styles.cardBody}>
          {addresses?.map((e, i) => (
            <Stack key={e.name}>
              <AddressLine data={e} onChange={handleChange} />
              {i < addresses.length - 1 && <Divider sx={styles.divider} />}
            </Stack>
          ))}

          {/* Add address */}
          <Button
            fullWidth
            size="small"
            color="tertiary"
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={() => setNewAddressModalOpen(true)}
            sx={styles.addButton}
          >
            Yeni Adres Ekle
          </Button>
        </Stack>

        <NewAddressModal
          open={newAddressModalOpen}
          onClose={() => setNewAddressModalOpen(false)}
          onAddressAdded={handleChange}
          defaultName={`Adres ${(addresses?.length ?? 0) + 1}`}
        />
      </Stack>
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default AddressbookCard;
