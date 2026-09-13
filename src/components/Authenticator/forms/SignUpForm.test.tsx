import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';
import SignUpForm from './SignUpForm';

/**
 * ADR-0002 Faz 3 / F3.0 — KARAKTERİZASYON TESTİ (dönüşümden ÖNCE yazıldı).
 * Korunan davranışlar: zorunlu alanlar, şifre kuralları, şifre eşleşmesi ve
 * **sözleşme onayı olmadan kayıt yapılamaması**.
 */

vi.mock('./GoogleAuthButton', () => ({
  default: () => <button type="button">Google ile devam et</button>,
}));

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Ad Soyad'), 'Test Kullanıcı');
  await user.type(screen.getByLabelText('E-posta adresi'), 'test@mitenya.com');
  await user.type(screen.getByLabelText('Şifre'), 'Sifre123');
  await user.type(screen.getByLabelText('Şifre Tekrar'), 'Sifre123');
};

const setup = () => {
  const onSubmit = vi.fn().mockResolvedValue(true);
  render(<SignUpForm onSubmit={onSubmit} returnUrl="/" />);
  return { onSubmit, user: userEvent.setup() };
};

describe('SignUpForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('dört alanı da etiketleriyle sunar', () => {
    setup();
    expect(screen.getByLabelText('Ad Soyad')).toBeInTheDocument();
    expect(screen.getByLabelText('E-posta adresi')).toBeInTheDocument();
    expect(screen.getByLabelText('Şifre')).toBeInTheDocument();
    expect(screen.getByLabelText('Şifre Tekrar')).toBeInTheDocument();
  });

  it('şifre alanları autoComplete="new-password" taşır (şifre yöneticisi)', () => {
    setup();
    expect(screen.getByLabelText('Şifre')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('Şifre Tekrar')).toHaveAttribute('autocomplete', 'new-password');
  });

  it('boş formda zorunluluk hataları gösterilir', async () => {
    const { onSubmit, user } = setup();
    await user.click(screen.getByRole('button', { name: /hesap oluştur/i }));

    expect(await screen.findByText('Ad Soyad zorunludur')).toBeInTheDocument();
    expect(screen.getByText('E-posta zorunludur')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('zayıf şifre reddedilir', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText('Ad Soyad'), 'Test');
    await user.type(screen.getByLabelText('E-posta adresi'), 'test@mitenya.com');
    await user.type(screen.getByLabelText('Şifre'), 'kisa');
    await user.click(screen.getByRole('button', { name: /hesap oluştur/i }));

    expect(await screen.findByText('Şifre en az 8 karakter olmalıdır')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('şifreler eşleşmezse hata verir', async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText('Ad Soyad'), 'Test');
    await user.type(screen.getByLabelText('E-posta adresi'), 'test@mitenya.com');
    await user.type(screen.getByLabelText('Şifre'), 'Sifre123');
    await user.type(screen.getByLabelText('Şifre Tekrar'), 'Baska123');
    await user.click(screen.getByRole('button', { name: /hesap oluştur/i }));

    expect(await screen.findByText('Şifreler eşleşmiyor')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sözleşme onayı olmadan kayıt YAPILMAZ', async () => {
    const { onSubmit, user } = setup();
    await fill(user);
    await user.click(screen.getByRole('button', { name: /hesap oluştur/i }));

    expect(
      await screen.findByText('Devam etmek için sözleşmeleri kabul etmelisiniz.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sözleşme onaylanınca kayıt yapılır', async () => {
    const { onSubmit, user } = setup();
    await fill(user);
    await user.click(screen.getByRole('checkbox', { name: /üyelik sözleşmesini kabul/i }));
    await user.click(screen.getByRole('button', { name: /hesap oluştur/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith('Test Kullanıcı', 'test@mitenya.com', 'Sifre123'),
    );
  });
});
