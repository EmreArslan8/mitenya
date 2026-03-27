'use client';

import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import useCustomerData from '@/lib/api/useCustomerData';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { validatePassword } from '@/lib/utils/password';
import { withCsrfHeaders } from '@/lib/utils/csrf';
import {
  Grid,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import styles from './styles';
import { signOut } from '@/lib/utils/signOut';
import { useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';

const AccountCard = () => {
  const { customerData, setCustomerData } = useAuth();
  const { createCustomer } = useCustomerData();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  const [email, setEmail] = useState(customerData?.email ?? '');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    setSuccessMessage(null);
    try {
      const newEmail = email.trim();
      const currentEmail = customerData?.email ?? '';
      const emailChanged = newEmail !== currentEmail && newEmail !== '';

      if (emailChanged) {
        const supabase = createSupabaseBrowser();
        const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });
        if (emailError) throw new Error('E-posta güncellenemedi.');
        setEmail(currentEmail);
        setSuccessMessage('Doğrulama linki yeni e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.');
      }

      const updated = await createCustomer({
        name: name.trim(),
        surname: surname.trim(),
        email: currentEmail,
        culture: customerData?.culture ?? 'tr',
        phoneNumber: phone.trim(),
      });
      if (!updated) throw new Error('Güncellenemedi');
      setCustomerData?.(updated);
      if (!emailChanged) setSuccessMessage('Üye bilgileri güncellendi.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Güncellenemedi';
      setProfileError(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordError(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setPasswordError('Mevcut şifrenizi giriniz.');
      return;
    }
    if (!newPassword || !newPasswordRepeat) {
      setPasswordError('Yeni şifre alanlarını doldurunuz.');
      return;
    }
    const pwErr = validatePassword(newPassword);
    if (pwErr) {
      setPasswordError(pwErr);
      return;
    }
    if (newPassword !== newPasswordRepeat) {
      setPasswordError('Yeni şifre tekrar alanı ile uyuşmuyor.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', withCsrfHeaders({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      }));
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data?.error ?? 'Şifre güncellenemedi.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordRepeat('');
      setSuccessMessage('Şifreniz başarıyla güncellendi.');
    } catch {
      setPasswordError('Şifre güncellenemedi.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async (password: string) => {
    setDeletingAccount(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/auth/delete-account', withCsrfHeaders({
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: password }),
      }));
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error ?? 'Hesap silinemedi.');
      }
      await signOut();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Hesap silinemedi.';
      setDeleteError(message);
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <Stack sx={styles.wrapper}>
      <Stack sx={styles.header}>
        <Typography sx={styles.headerLabel}>Kullanici Bilgilerim</Typography>
      </Stack>

      <Stack sx={styles.cardBody}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack sx={styles.column}>
              <Typography sx={styles.sectionTitle}>Uyelik Bilgilerim</Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ad"
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    sx={styles.input}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Soyad"
                    size="small"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    fullWidth
                    sx={styles.input}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="E-Mail"
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    sx={styles.input}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" gap={1.5}>
                    <TextField
                      value="+90"
                      size="small"
                      InputProps={{ readOnly: true }}
                      sx={{ ...styles.input, width: 92 }}
                    />
                    <TextField
                      label="Cep Telefonu"
                      size="small"
                      value={formatPhone(phone)}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      fullWidth
                      sx={styles.input}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={styles.fieldLabel}>Dogum Tarihiniz</Typography>
                  <Stack direction="row" gap={1.5}>
                    <Select value={day} displayEmpty size="medium" onChange={(e) => setDay(e.target.value)} sx={styles.select}>
                      <MenuItem value="">Gun</MenuItem>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <MenuItem key={d} value={String(d)}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select value={month} displayEmpty size="medium" onChange={(e) => setMonth(e.target.value)} sx={styles.select}>
                      <MenuItem value="">Ay</MenuItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <MenuItem key={m} value={String(m)}>
                          {m}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select value={year} displayEmpty size="medium" onChange={(e) => setYear(e.target.value)} sx={styles.select}>
                      <MenuItem value="">Yil</MenuItem>
                      {Array.from({ length: 70 }, (_, i) => 2026 - i).map((y) => (
                        <MenuItem key={y} value={String(y)}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  {profileError && <Typography sx={styles.errorText}>{profileError}</Typography>}
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    sx={styles.primaryButton}
                    fullWidth
                  >
                    {savingProfile ? 'Guncelleniyor...' : 'Guncelle'}
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack sx={styles.column}>
              <Typography sx={styles.sectionTitle}>Sifre Guncelleme</Typography>
              <Stack gap={1.25}>
                <TextField
                  label="Su Anki Sifre"
                  size="small"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  sx={styles.input}
                />
                <TextField
                  label="Yeni Sifre"
                  size="small"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  sx={styles.input}
                />
                <Typography sx={styles.passwordHint}>
                  Şifreniz en az 8 karakter olmalı. 1 büyük harf, 1 küçük harf ve rakam içermelidir.
                </Typography>
                <TextField
                  label="Yeni Sifre (Tekrar)"
                  size="small"
                  type="password"
                  value={newPasswordRepeat}
                  onChange={(e) => setNewPasswordRepeat(e.target.value)}
                  fullWidth
                  sx={styles.input}
                />
                {passwordError && <Typography sx={styles.errorText}>{passwordError}</Typography>}
                <Button
                  variant="outlined"
                  onClick={handlePasswordUpdate}
                  disabled={savingPassword}
                  sx={styles.secondaryButton}
                  fullWidth
                >
                  {savingPassword ? 'Guncelleniyor...' : 'Guncelle'}
                </Button>
                <Stack sx={styles.twoFactorBox}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={styles.twoFactorTitle}>Iki Adimli Dogrulama</Typography>
                    <Switch
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    />
                  </Stack>
                  <Typography sx={styles.twoFactorDesc}>
                    Iki adimli dogrulamayi etkinlestirdiginizde, oturum acarken ek dogrulama kodu istenir.
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {successMessage && <Typography sx={styles.successText}>{successMessage}</Typography>}

        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
          {showDeleteConfirm ? (
            <Stack gap={1} sx={{ maxWidth: 360 }}>
              <Typography sx={styles.deleteWarning}>
                Hesabınız kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam etmek için şifrenizi girin.
              </Typography>
              <TextField
                size="small"
                type="password"
                placeholder="Şifreniz"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                sx={styles.input}
                disabled={deletingAccount}
              />
              {deleteError && <Typography sx={styles.errorText}>{deleteError}</Typography>}
              <Stack direction="row" gap={1}>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={() => handleDeleteAccount(deletePassword)}
                  disabled={deletingAccount || !deletePassword}
                  sx={styles.logoutButton}
                >
                  {deletingAccount ? 'Siliniyor...' : 'Hesabımı Sil'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); setDeletePassword(''); }}
                  disabled={deletingAccount}
                  sx={styles.logoutButton}
                >
                  İptal
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Button
              size="small"
              color="error"
              variant="text"
              onClick={() => setShowDeleteConfirm(true)}
              sx={styles.logoutButton}
            >
              Hesabı Sil
            </Button>
          )}
          <Button
            size="small"
            color="error"
            variant="tonal"
            onClick={signOut}
            startIcon={<LogOut size={14} />}
            sx={styles.logoutButton}
          >
            Cikis Yap
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AccountCard;
