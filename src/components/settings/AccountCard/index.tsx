'use client';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { useAuth } from '@/contexts/AuthContext';
import useCustomerData from '@/lib/api/useCustomerData';
import { IconButton, Stack, TextField, Typography } from '@mui/material';
import styles from './styles';
import { signOut } from '@/lib/utils/signOut';
import { useMemo, useState } from 'react';
import { Pencil, X } from 'lucide-react';

const resetPasswordBaseUrl = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/reset-password`;

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
    } catch (err: any) {
      setError(err.message || 'Güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card iconName="lock" title="Hesabım" border>
      <Stack sx={styles.cardBody} gap={2}>
        <Stack direction="row" justifyContent="flex-end">
          <IconButton
            aria-label={isEditing ? 'Düzenlemeyi kapat' : 'Düzenle'}
            onClick={() => setIsEditing((prev) => !prev)}
            size="small"
          >
            {isEditing ? <X size={18} /> : <Pencil size={18} />}
          </IconButton>
        </Stack>
        <TextField
          label="Ad"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          InputProps={{ readOnly: !isEditing }}
          fullWidth
        />
        <TextField
          label="Soyad"
          size="small"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          InputProps={{ readOnly: !isEditing }}
          fullWidth
        />
        <TextField
          label="Telefon"
          size="small"
          value={formatPhone(phone)}
          placeholder="0 (___) ___ __ __"
          onChange={(e) => handlePhoneChange(e.target.value)}
          InputProps={{ readOnly: !isEditing }}
          fullWidth
        />

        {error && (
          <Typography color="error.main" fontSize={13}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success.main" fontSize={13}>
            Bilgileriniz güncellendi.
          </Typography>
        )}

        <Stack direction="row" gap={1} justifyContent="flex-end">
          {isEditing && (
            <Button size="small" variant="outlined" onClick={handleSave} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          )}
          <Button size="small" color="error" variant="tonal" onClick={signOut}>
            Çıkış Yap
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

export default AccountCard;
