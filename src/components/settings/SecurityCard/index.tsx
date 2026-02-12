'use client';

import Button from '@/components/common/Button';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { Stack, Switch, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import styles from './styles';

const SecurityCard = () => {
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const passwordFormValid =
    newPassword.length >= 10 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    newPassword === newPasswordRepeat;

  const handlePasswordUpdate = async () => {
    setPasswordError(null);
    setSuccessMessage(null);

    if (!newPassword || !newPasswordRepeat) {
      setPasswordError('Yeni sifre alanlarini doldurunuz.');
      return;
    }
    if (newPassword.length < 10) {
      setPasswordError('Yeni sifre en az 10 karakter olmalidir.');
      return;
    }
    if (newPassword !== newPasswordRepeat) {
      setPasswordError('Yeni sifre tekrar alani ile uyusmuyor.');
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordRepeat('');
      setSuccessMessage('Sifreniz basariyla guncellendi.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sifre guncellenemedi.';
      setPasswordError(message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Stack sx={styles.wrapper}>
      <Stack sx={styles.sectionHeader}>
        <Typography sx={styles.sectionTitle}>Sifre Degisikligi</Typography>
      </Stack>

      <Stack sx={styles.formCard}>
        <Stack sx={styles.formBody}>
          <Stack sx={styles.fieldStack}>
            <Typography sx={styles.fieldLabel}>Mevcut Sifre</Typography>
            <TextField
              size="small"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              sx={styles.input}
            />
          </Stack>

          <Stack sx={styles.fieldStack}>
            <Typography sx={styles.fieldLabel}>Yeni Sifre</Typography>
            <TextField
              size="small"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              sx={styles.input}
            />
          </Stack>

          <Stack sx={styles.fieldStack}>
            <Typography sx={styles.fieldLabel}>Yeni Sifre (Tekrar)</Typography>
            <TextField
              size="small"
              type="password"
              value={newPasswordRepeat}
              onChange={(e) => setNewPasswordRepeat(e.target.value)}
              fullWidth
              sx={styles.input}
            />
          </Stack>

          {passwordError && <Typography sx={styles.errorText}>{passwordError}</Typography>}
          {successMessage && <Typography sx={styles.successText}>{successMessage}</Typography>}
        </Stack>

        <Stack sx={styles.actionArea}>
          <Button
            variant="contained"
            onClick={handlePasswordUpdate}
            disabled={savingPassword || !passwordFormValid}
            sx={styles.saveButton}
          >
            {savingPassword ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Stack>
      </Stack>

      <Stack sx={styles.twoFactorCard}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={styles.sectionTitle}>Iki Adimli Dogrulama</Typography>
          <Switch
            checked={twoFactorEnabled}
            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
          />
        </Stack>
        <Typography sx={styles.twoFactorDesc}>
          Iki adimli dogrulama yontemini etkinlestirdiginizde, kisisel sifrelerinize ek olarak kayitli cep telefonunuza gelen dogrulama koduyla oturum acarsiniz.
        </Typography>
      </Stack>
    </Stack>
  );
};

export default SecurityCard;
