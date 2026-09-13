import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from './ForgotPasswordForm';

/**
 * ADR-0002 Faz 3 / F3.0 — KARAKTERİZASYON TESTİ (dönüşümden ÖNCE yazıldı).
 * Korunan: e-posta doğrulaması, gönderim sonrası formun kapanması, hata mesajı.
 */
const setup = (result: { ok: boolean; message?: string } = { ok: true }) => {
  const onSubmit = vi.fn().mockResolvedValue(result);
  const onBack = vi.fn();
  render(<ForgotPasswordForm onBack={onBack} onSubmit={onSubmit} />);
  return { onSubmit, onBack, user: userEvent.setup() };
};

describe('ForgotPasswordForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('e-posta alanını etiketi ve autoComplete ile sunar', () => {
    setup();
    const email = screen.getByLabelText('E-posta adresi');
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
  });

  /**
   * DİKKAT: form, geçersiz e-postada gönderimi hata mesajıyla değil,
   * **düğmeyi devre dışı bırakarak** engelliyor (ForgotPasswordForm.tsx:68).
   * Hata metni ancak alan blur olunca (touched) çıkıyor. Test bu gerçek
   * davranışı sabitler — ilk yazdığım beklenti yanlıştı.
   */
  it('geçersiz e-postada gönder düğmesi devre dışı kalır', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText('E-posta adresi'), 'gecersiz');

    expect(screen.getByRole('button', { name: /bağlantı gönder/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('alan blur olunca doğrulama hatası gösterilir', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('E-posta adresi'), 'gecersiz');
    await user.tab();

    expect(await screen.findByText('Geçerli bir e-posta adresi gir')).toBeInTheDocument();
  });

  it('geçerli e-postayla gönderim yapılır ve başarı mesajı gösterilir', async () => {
    const { onSubmit, user } = setup({ ok: true, message: 'Bağlantı gönderildi' });
    await user.type(screen.getByLabelText('E-posta adresi'), 'kullanici@mitenya.com');
    await user.click(screen.getByRole('button', { name: /bağlantı gönder/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('kullanici@mitenya.com'));
    expect(await screen.findByText('Bağlantı gönderildi')).toBeInTheDocument();
  });

  it('sunucu hatasında hata mesajı gösterilir', async () => {
    const { user } = setup({ ok: false, message: 'Kullanıcı bulunamadı' });
    await user.type(screen.getByLabelText('E-posta adresi'), 'yok@mitenya.com');
    await user.click(screen.getByRole('button', { name: /bağlantı gönder/i }));

    expect(await screen.findByText('Kullanıcı bulunamadı')).toBeInTheDocument();
  });
});
