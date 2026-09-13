'use client';

import { Button } from '@/components/ui/Button';
import { validatePassword } from '@/lib/utils/password';
import { withCsrfHeaders } from '@/lib/utils/csrf';
import { useState } from 'react';
import { Switch } from '@/components/ui/Switch';
import { TextField } from '@/components/ui/TextField';

const SecurityCard = () => {
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const passwordFormValid =
    currentPassword.length > 0 &&
    validatePassword(newPassword) === null &&
    newPassword === newPasswordRepeat;

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

  return (
    <div className="flex w-full flex-col gap-4">
      <header className="rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-5 sm:py-[18px]">
        <h2 className="text-lg font-semibold text-text">Sifre Degisikligi</h2>
      </header>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-[18px]">
          <div className="flex max-w-[420px] flex-col gap-1.5">
            <TextField
              label="Mevcut Sifre"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              labelClassName="text-[14px] font-semibold text-text"
              size="large"
            />
          </div>

          <div className="flex max-w-[420px] flex-col gap-1.5">
            <TextField
              label="Yeni Sifre"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              labelClassName="text-[14px] font-semibold text-text"
              size="large"
            />
          </div>

          <div className="flex max-w-[420px] flex-col gap-1.5">
            <TextField
              label="Yeni Sifre (Tekrar)"
              type="password"
              autoComplete="new-password"
              value={newPasswordRepeat}
              onChange={(e) => setNewPasswordRepeat(e.target.value)}
              labelClassName="text-[14px] font-semibold text-text"
              size="large"
            />
          </div>

          {passwordError && <p className="mt-1 text-[13px] text-error">{passwordError}</p>}
          {successMessage && <p className="mt-1 text-[13px] text-success">{successMessage}</p>}
        </div>

        <div className="border-t border-gray-200 bg-bg-light px-4 py-3 sm:px-5 sm:py-3.5">
          <Button
            variant="contained"
            onClick={handlePasswordUpdate}
            disabled={savingPassword || !passwordFormValid}
            className="h-[52px] w-full max-w-[420px] rounded-lg text-lg normal-case disabled:border-gray-100 disabled:bg-gray-100 disabled:text-text-medium"
          >
            {savingPassword ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-5 sm:py-[18px]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Iki Adimli Dogrulama</h2>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
            aria-label="İki adımlı doğrulama"
          />
        </div>
        <p className="mt-2 max-w-[960px] text-base leading-[1.55] text-text-medium">
          Iki adimli dogrulama yontemini etkinlestirdiginizde, kisisel sifrelerinize ek olarak kayitli cep telefonunuza gelen dogrulama koduyla oturum acarsiniz.
        </p>
      </section>
    </div>
  );
};

export default SecurityCard;
