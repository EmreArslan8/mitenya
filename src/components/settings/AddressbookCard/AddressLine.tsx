'use client';

import EditAddressModal from '@/components/AddressCard/modals/EditAddressModal';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { IconButton, Menu, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from './styles';
import { Check, Trash } from 'lucide-react';

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

  const contactFullName = [data.contactName, data.contactSurname].filter(Boolean).join(' ').trim();
  const addressLine = [data.line1, data.line2, data.line3].filter((e) => e).join(', ');
  const cityLine = [data.district, data.city].filter((e) => e).join(' / ');
  const phoneLine = [data.phoneCode, data.phoneNumber].filter((e) => e).join(' ');

  return (
    <>
      <Stack sx={styles.address}>
        <Stack sx={styles.addressHeader}>
          <Typography sx={styles.addressName}>{data.name}</Typography>
          {data.isDefault && (
            <Stack sx={styles.defaultBadge}>
              <Check size={11} />
            </Stack>
          )}
        </Stack>

        <Stack sx={styles.addressInfo}>
          {contactFullName && <Typography sx={styles.contactName}>{contactFullName}</Typography>}
          <Typography sx={styles.addressLine}>{addressLine}</Typography>
          {cityLine && <Typography sx={styles.locationLine}>{cityLine}</Typography>}
          {phoneLine && <Typography sx={styles.phoneLine}>{phoneLine}</Typography>}
        </Stack>

        <Stack sx={styles.addressActions}>
          <IconButton
            onClick={handleDeleteButtonClick}
            sx={styles.deleteIconButton}
          >
            <Trash size={15} />
          </IconButton>

          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setEditModalOpen(true)}
            sx={styles.editButton}
          >
            Adresi Duzenle
          </Button>
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
