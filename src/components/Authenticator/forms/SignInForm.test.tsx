import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';
import SignInForm from './SignInForm';

/**
 * ADR-0002 Faz 3 / F3.0 — KARAKTERİZASYON TESTİ.
 *
 * Bu test, giriş formunun MUI'den Tailwind'e taşınmasından ÖNCE yazıldı ve
 * mevcut davranışa karşı yeşil olduğu doğrulandı. Dönüşümden sonra da yeşil
 * kalmalı — amacı yeni davranış tanımlamak değil, VAR OLANI korumak.
 *
 * Seçiciler bilerek role/label tabanlı (konvansiyon.md): `.MuiOutlinedInput-root`
 * gibi yapı seçicileri kullanılsaydı dönüşümde kırılır ve hiçbir şeyi korumazdı.
 */

vi.mock('./GoogleAuthButton', () => ({
  default: () => <button type="button">Google ile devam et</button>,
}));

const setup = () => {
  const onSubmit = vi.fn().mockResolvedValue(true);
  const onForgotPassword = vi.fn();
  render(<SignInForm onSubmit={onSubmit} onForgotPassword={onForgotPassword} returnUrl="/" />);
  return { onSubmit, onForgotPassword, user: userEvent.setup() };
};

describe('SignInForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('e-posta ve şifre alanlarını etiketleriyle sunar', () => {
    setup();
    expect(screen.getByLabelText('E-posta adresi')).toBeInTheDocument();
    expect(screen.getByLabelText('Şifre')).toBeInTheDocument();
  });

  it('e-posta alanı doğru type ve autoComplete taşır (tarayıcı otomatik doldurma)', () => {
    setup();
    const email = screen.getByLabelText('E-posta adresi');
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
  });

  it('boş formda submit edilince zorunluluk hataları gösterilir ve onSubmit çağrılmaz', async () => {
    const { onSubmit, user } = setup();
    await user.click(screen.getByRole('button', { name: /giriş yap/i }));

    expect(await screen.findByText('E-posta zorunludur')).toBeInTheDocument();
    expect(screen.getByText('Şifre zorunludur')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('geçersiz e-posta formatı reddedilir', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText('E-posta adresi'), 'gecersiz');
    await user.type(screen.getByLabelText('Şifre'), 'sifre123');
    await user.click(screen.getByRole('button', { name: /giriş yap/i }));

    expect(await screen.findByText('Geçerli bir e-posta adresi gir')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('geçerli bilgilerle onSubmit e-posta ve şifreyle çağrılır', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText('E-posta adresi'), 'kullanici@mitenya.com');
    await user.type(screen.getByLabelText('Şifre'), 'sifre123');
    await user.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith('kullanici@mitenya.com', 'sifre123'),
    );
  });

  it('sunucu reddederse hata mesajı gösterilir', async () => {
    const onSubmit = vi.fn().mockResolvedValue(false);
    const user = userEvent.setup();
    render(<SignInForm onSubmit={onSubmit} onForgotPassword={vi.fn()} returnUrl="/" />);

    await user.type(screen.getByLabelText('E-posta adresi'), 'kullanici@mitenya.com');
    await user.type(screen.getByLabelText('Şifre'), 'yanlis');
    await user.click(screen.getByRole('button', { name: /giriş yap/i }));

    expect(await screen.findByText('E-posta veya şifre hatalı')).toBeInTheDocument();
  });

  it('şifremi unuttum bağlantısı geri çağrıyı tetikler', async () => {
    const { onForgotPassword, user } = setup();
    await user.click(screen.getByRole('button', { name: /şifremi unuttum/i }));
    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });
});
