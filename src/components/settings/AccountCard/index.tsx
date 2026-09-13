'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import useCustomerData from '@/lib/api/useCustomerData';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { validatePassword } from '@/lib/utils/password';
import { withCsrfHeaders } from '@/lib/utils/csrf';
import { signOut } from '@/lib/utils/signOut';
import { useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import { Select, SelectItem } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { TextField } from '@/components/ui/TextField';

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
    <section className="overflow-hidden rounded-[14px] border border-gray-100 bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-[18px] sm:px-6">
        <h2 className="text-base text-text">Kullanici Bilgilerim</h2>
      </header>

      <div className="flex flex-col gap-6 px-5 py-[26px] sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="flex h-full flex-col gap-4">
              <h3 className="mb-3.5 text-lg text-text">Uyelik Bilgilerim</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <TextField
                    label="Ad"
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="large"
                  />
                </div>
                <div>
                  <TextField
                    label="Soyad"
                    autoComplete="family-name"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    size="large"
                  />
                </div>
                <div className="sm:col-span-2">
                  <TextField
                    label="E-Mail"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="large"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex gap-3">
                    <Input
                      value="+90"
                      readOnly
                      aria-label="Ülke kodu"
                      size="large"
                      className="w-[92px]"
                    />
                    <TextField
                      label="Cep Telefonu"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={formatPhone(phone)}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      size="large"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="mb-3 text-sm text-text">Dogum Tarihiniz</p>
                  <div className="flex gap-3 [&>*]:flex-1">
                    <Select
                      value={day}
                      onValueChange={setDay}
                      placeholder="Gun"
                      aria-label="Gun"
                      clearLabel="Gun seçimini kaldır"
                    >
                      {/* MUI'de placeholder bir `<MenuItem value="">` idi; Radix boş
                          değerli öğeye izin vermez — yerine `placeholder` prop'u. */}
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select
                      value={month}
                      onValueChange={setMonth}
                      placeholder="Ay"
                      aria-label="Ay"
                      clearLabel="Ay seçimini kaldır"
                    >
                      {/* MUI'de placeholder bir `<MenuItem value="">` idi; Radix boş
                          değerli öğeye izin vermez — yerine `placeholder` prop'u. */}
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select
                      value={year}
                      onValueChange={setYear}
                      placeholder="Yil"
                      aria-label="Yil"
                      clearLabel="Yil seçimini kaldır"
                    >
                      {/* MUI'de placeholder bir `<MenuItem value="">` idi; Radix boş
                          değerli öğeye izin vermez — yerine `placeholder` prop'u. */}
                      {Array.from({ length: 70 }, (_, i) => 2026 - i).map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  {profileError && <p className="mb-2 text-[13px] text-error">{profileError}</p>}
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="mt-1 h-11 rounded-[11px] text-sm normal-case disabled:border-gray-100 disabled:bg-gray-100 disabled:text-text-medium"
                    fullWidth
                  >
                    {savingProfile ? 'Guncelleniyor...' : 'Guncelle'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-gray-100 md:border-l md:pl-6">
            <div className="flex h-full flex-col gap-4">
              <h3 className="mb-3.5 text-lg text-text">Sifre Guncelleme</h3>
              <div className="flex flex-col gap-2.5">
                <TextField
                  label="Su Anki Sifre"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  size="large"
                />
                <TextField
                  label="Yeni Sifre"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  size="large"
                />
                <p className="text-[13px] leading-normal text-text-medium">
                  Şifreniz en az 8 karakter olmalı. 1 büyük harf, 1 küçük harf ve rakam içermelidir.
                </p>
                <TextField
                  label="Yeni Sifre (Tekrar)"
                  type="password"
                  autoComplete="new-password"
                  value={newPasswordRepeat}
                  onChange={(e) => setNewPasswordRepeat(e.target.value)}
                  size="large"
                />
                {passwordError && <p className="text-[13px] text-error">{passwordError}</p>}
                <Button
                  variant="outlined"
                  onClick={handlePasswordUpdate}
                  disabled={savingPassword}
                  className="h-11 rounded-[11px] text-sm normal-case disabled:border-gray-100 disabled:bg-gray-100 disabled:text-text-medium"
                  fullWidth
                >
                  {savingPassword ? 'Guncelleniyor...' : 'Guncelle'}
                </Button>
                <div className="mt-1 rounded-[11px] bg-bg-light p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base text-text">Iki Adimli Dogrulama</h4>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                      aria-label="İki adımlı doğrulama"
                    />
                  </div>
                  <p className="mt-1.5 text-[13px] leading-normal text-text-medium">
                    Iki adimli dogrulamayi etkinlestirdiginizde, oturum acarken ek dogrulama kodu istenir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {successMessage && <p className="text-[13px] text-success">{successMessage}</p>}

        <div className="flex flex-wrap items-start justify-between gap-2">
          {showDeleteConfirm ? (
            <div className="flex max-w-[360px] flex-col gap-2">
              <p className="max-w-[400px] text-[13px] leading-normal text-error">
                Hesabınız kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam etmek için şifrenizi girin.
              </p>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Şifreniz"
                aria-label="Hesap silme onayı için şifreniz"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                size="large"
                disabled={deletingAccount}
              />
              {deleteError && <p className="text-[13px] text-error">{deleteError}</p>}
              <div className="flex gap-2">
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={() => handleDeleteAccount(deletePassword)}
                  disabled={deletingAccount || !deletePassword}
                  className="rounded-[10px] text-[13px] normal-case"
                >
                  {deletingAccount ? 'Siliniyor...' : 'Hesabımı Sil'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); setDeletePassword(''); }}
                  disabled={deletingAccount}
                  className="rounded-[10px] text-[13px] normal-case"
                >
                  İptal
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="small"
              color="error"
              variant="text"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-[10px] text-[13px] normal-case"
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
            className="rounded-[10px] text-[13px] normal-case"
          >
            Cikis Yap
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AccountCard;
