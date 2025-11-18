'use client';

import EditAddressModal from '@/components/AddressCard/modals/EditAddressModal';
import Icon from '@/components/Icon';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { IconButton, Menu, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from './styles';

const AddressLine = ({ data, onChange }: { data: AddressData; onChange: () => void }) => {
  const { deleteAddress } = useAddress();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteMenuAnchor, setDeleteMenuAnchor] = useState<HTMLElement | null>(null);
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteButtonClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setDeleteMenuAnchor(event.currentTarget);

  const handleDeleteMenuClose = () => {
    setDeleteMenuOpen(false);
    setDeleteMenuAnchor(null);
  };

  const handleDelete = (id: string | number) => {
    setDeleteLoading(true);
    deleteAddress(id.toString()).then((result) => {
      setDeleteLoading(false);
      if (!result) return;
      handleDeleteMenuClose();
      setTimeout(onChange, 200);
    });
  };

  useEffect(() => {
    setDeleteMenuOpen(Boolean(deleteMenuAnchor));
  }, [deleteMenuAnchor]);
  
  return (
    <>
      <Stack sx={styles.address}>
        <Stack sx={styles.addressSection} gap={1} width="100%">
          <Typography variant="body" whiteSpace="nowrap">
            {data.name}
          </Typography>
          <Typography variant="body" sx={styles.line}>
            {[data.line1, data.line2, data.line3].filter((e) => e).join(', ')}{' '}
          </Typography>
        </Stack>
        <Stack sx={styles.addressSection} flexShrink={0}>
          <IconButton onClick={() => setEditModalOpen(true)}>
            <Icon name="edit" fontSize={20} />
          </IconButton>
          <IconButton onClick={handleDeleteButtonClick}>
            <Icon name="delete" color="error" fontSize={22} />
          </IconButton>
        </Stack>
      </Stack>
      <EditAddressModal
        initialData={data}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdited={onChange}
      />
      <Menu
        elevation={0}
        open={deleteMenuOpen}
        anchorEl={deleteMenuAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{ sx: { boxShadow: '0px 0px 16px 0px #00000040' } }}
        MenuListProps={{ sx: { p: 0 } }}
      >
        <Card title={('address.deleteTitle')} sx={{ width: 200 }}>
          <Stack p={2} gap={1.5}>
            <Button
              color="secondary"
              variant="outlined"
              size="small"
              onClick={handleDeleteMenuClose}
            >
              {('address.deleteCancel')}
            </Button>
            <Button
              loading={deleteLoading}
              color="error"
              variant="contained"
              size="small"
              onClick={() => handleDelete(data.id)}
            >
              {('address.deleteConfirm')}
            </Button>
          </Stack>
        </Card>
      </Menu>
    </>
  );
};

export default AddressLine;
