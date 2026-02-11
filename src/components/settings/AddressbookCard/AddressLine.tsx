'use client';

import EditAddressModal from '@/components/AddressCard/modals/EditAddressModal';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { IconButton, Menu, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from './styles';
import { Pencil, Trash } from 'lucide-react';

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
        <Stack sx={styles.addressInfo}>
          <Typography sx={styles.addressName}>
            {data.name}
          </Typography>
          <Typography sx={styles.addressLine}>
            {[data.line1, data.line2, data.line3].filter((e) => e).join(', ')}
          </Typography>
        </Stack>

        <Stack sx={styles.addressActions}>
          <IconButton
            onClick={() => setEditModalOpen(true)}
            sx={styles.iconButton}
          >
            <Pencil size={15} />
          </IconButton>
          <IconButton
            onClick={handleDeleteButtonClick}
            sx={{ ...styles.iconButton, color: 'error.main' }}
          >
            <Trash size={15} color="currentColor" />
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)', borderRadius: '12px' } }}
        MenuListProps={{ sx: { p: 0 } }}
      >
        <Card title="Adresi silmek istediğinize emin misiniz?" sx={{ width: 240 }}>
          <Stack p={2} gap={1}>
            <Button
              color="secondary"
              variant="outlined"
              size="small"
              onClick={handleDeleteMenuClose}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13 }}
            >
              Vazgeç
            </Button>
            <Button
              loading={deleteLoading}
              color="error"
              disabled={data.id === undefined}
              variant="contained"
              size="small"
              onClick={() => {
                if (data.id !== undefined) handleDelete(data.id);
              }}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13 }}
            >
              Sil
            </Button>
          </Stack>
        </Card>
      </Menu>
    </>
  );
};

export default AddressLine;
