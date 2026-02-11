'use client';

import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import useCustomerData from '@/lib/api/useCustomerData';
import { IconButton, Stack, TextField, Typography } from '@mui/material';
import styles from './styles';
import { signOut } from '@/lib/utils/signOut';
import { useMemo, useState } from 'react';
import { LogOut, Pencil, X } from 'lucide-react';

const AccountCard = () => {
  const { customerData, setCustomerData } = useAuth();
  const { createCustomer } = useCustomerData();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initial = useMemo(() => {
    const fullName = customerData?.fullName ?? '';
    const parts = fullName.trim().split(' ');
    const name = parts.shift() ?? '';
    const surname = parts.join(' ');
    return {
      name,
      surname,
      phone: customerData?.phone ?? '',
    };
  }, [customerData?.fullName, customerData?.phone]);

  const [name, setName] = useState(initial.name);
  const [surname, setSurname] = useState(initial.surname);
  const [phone, setPhone] = useState(initial.phone);

  const formatPhone = (raw: string): string => {
    const d = raw.replace(/\D/g, '').slice(0, 10);
    if (!d) return '';
    let r = '0 (';
    r += d.slice(0, 3);
    if (d.length >= 3) r += ') ';
    if (d.length > 3) r += d.slice(3, 6);
    if (d.length > 6) r += ' ' + d.slice(6, 8);
    if (d.length > 8) r += ' ' + d.slice(8, 10);
    return r;
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const trimmed = digits.startsWith('0') ? digits.slice(1) : digits;
    setPhone(trimmed.slice(0, 10));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await createCustomer({
        name: name.trim(),
        surname: surname.trim(),
        email: customerData?.email ?? '',
        culture: customerData?.culture ?? 'tr',
        phoneNumber: phone.trim(),
      });
      if (!updated) throw new Error('Güncellenemedi');
      setCustomerData?.(updated);
      setSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack sx={styles.wrapper}>
      {/* Header */}
      <Stack sx={styles.header}>
        <Typography sx={styles.headerLabel}>Hesabım</Typography>
        <IconButton
          aria-label={isEditing ? 'Düzenlemeyi kapat' : 'Düzenle'}
          onClick={() => setIsEditing((prev) => !prev)}
          size="small"
          sx={{
            my: -0.5,
            width: 28,
            height: 28,
            borderRadius: '8px',
            bgcolor: isEditing ? 'gray.50' : 'transparent',
          }}
        >
          {isEditing ? <X size={14} /> : <Pencil size={14} />}
        </IconButton>
      </Stack>

      {/* Body */}
      <Stack sx={styles.cardBody}>
        <TextField
          label="Ad"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          InputProps={{ readOnly: !isEditing }}
          fullWidth
          sx={styles.input}
        />
        <TextField
          label="Soyad"
          size="small"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          InputProps={{ readOnly: !isEditing }}
          fullWidth
          sx={styles.input}
        />
        <TextField
          label="Telefon"
          size="small"
          value={formatPhone(phone)}
          placeholder="0 (___) ___ __ __"
          onChange={(e) => handlePhoneChange(e.target.value)}
          InputProps={{ readOnly: !isEditing }}
          fullWidth
          sx={styles.input}
        />

        {error && (
          <Typography sx={{ color: 'error.main', fontSize: 13, fontWeight: 500 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography sx={{ color: 'success.main', fontSize: 13, fontWeight: 500 }}>
            Bilgileriniz güncellendi.
          </Typography>
        )}

        <Stack direction="row" gap={1} justifyContent="flex-end" pt={0.5}>
          {isEditing && (
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13 }}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          )}
          <Button
            size="small"
            color="error"
            variant="tonal"
            onClick={signOut}
            startIcon={<LogOut size={14} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13 }}
          >
            Çıkış Yap
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AccountCard;
