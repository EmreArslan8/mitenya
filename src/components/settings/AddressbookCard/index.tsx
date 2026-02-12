'use client';

import NewAddressModal from '@/components/AddressCard/modals/NewAddressModal';
import Button from '@/components/common/Button';
import { AddressData } from '@/lib/api/types';
import { Stack, Typography } from '@mui/material';
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
      <Stack sx={styles.container}>
        <Stack sx={styles.header}>
          <Typography sx={styles.headerLabel}>Adres Bilgilerim</Typography>
          <Button
            size="small"
            color="tertiary"
            variant="text"
            startIcon={<Plus size={18} />}
            onClick={() => setNewAddressModalOpen(true)}
            sx={styles.headerAddButton}
          >
            Yeni Adres Ekle
          </Button>
        </Stack>

        <Stack sx={styles.cardBody}>
          {addresses?.map((e) => (
            <Stack key={String(e.id ?? `${e.name}-${e.line1}`)} sx={styles.cardItem}>
              <AddressLine data={e} onChange={handleChange} />
            </Stack>
          ))}

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
