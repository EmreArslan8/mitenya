'use client';

import NewAddressModal from '@/components/AddressCard/modals/NewAddressModal';
import Icon from '@/components/Icon';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { AddressData } from '@/lib/api/types';
import { Divider, Stack } from '@mui/material';

import { useState } from 'react';
import AddressLine from './AddressLine';
import styles from './styles';
import LoadingOverlay from '@/components/LoadingOverlay';

const AddressbookCard = ({ addresses }: { addresses: AddressData[] }) => {
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    setLoading(true);
    window.location.reload();
  };

  return (
    <>
      <Card iconName="menu_book" title={('address.addresses')} border>
        <Stack sx={styles.cardBody}>
          {addresses?.map((e) => [
            <AddressLine data={e} onChange={handleChange} key={e.name} />,
            <Divider flexItem key={`${e.name}-divider`} />,
          ])}
          <Button
            fullWidth
            size="small"
            color="tertiary"
            startIcon={<Icon name="add" />}
            onClick={() => setNewAddressModalOpen(true)}
            sx={{ mt: 1 }}
          >
            {('address.addAddress')}
          </Button>
        </Stack>
        <NewAddressModal
          open={newAddressModalOpen}
          onClose={() => setNewAddressModalOpen(false)}
          onAddressAdded={handleChange}
          defaultName={`${('address.nameDefaultValue', { ns: 'common' })} ${
            (addresses?.length ?? 0) + 1
          }`}
        />
      </Card>
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default AddressbookCard;
