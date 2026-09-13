import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';
import CheckoutCard from './index';

/**
 * ADR-0002 Faz 3 / F3.0 — KARAKTERİZASYON TESTİ (dönüşümden ÖNCE yazıldı).
 *
 * Korunan: kupon kodu girişi, boşlukların kırpılması, uygulanmış kuponda
 * alanın kilitlenmesi ve kuponun kaldırılabilmesi. Bu akış doğrudan ödenen
 * tutarı etkiliyor.
 */
const baseProps = {
  orderSummary: { subtotal: 1000, totalDue: 1000, currency: 'TRY' as const },
  discountCode: null,
  loading: false,
};

const setup = (props: Partial<Parameters<typeof CheckoutCard>[0]> = {}) => {
  const onSubmitDiscountCode = vi.fn();
  render(
    <CheckoutCard {...baseProps} onSubmitDiscountCode={onSubmitDiscountCode} {...props} />,
  );
  return { onSubmitDiscountCode, user: userEvent.setup() };
};

const couponInput = () =>
  screen.getByPlaceholderText('Kupon kodu giriniz') as HTMLInputElement;

describe('CheckoutCard — kupon kodu', () => {
  beforeEach(() => vi.clearAllMocks());

  it('kupon alanını sunar', () => {
    setup();
    expect(couponInput()).toBeInTheDocument();
    expect(couponInput()).not.toBeDisabled();
  });

  it('girilen kod form gönderilince iletilir', async () => {
    const { onSubmitDiscountCode, user } = setup();
    await user.type(couponInput(), 'INDIRIM10');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onSubmitDiscountCode).toHaveBeenCalledWith('INDIRIM10'));
  });

  it('baştaki/sondaki boşluklar kırpılır', async () => {
    const { onSubmitDiscountCode, user } = setup();
    await user.type(couponInput(), '  INDIRIM10  ');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onSubmitDiscountCode).toHaveBeenCalledWith('INDIRIM10'));
  });

  /**
   * DİKKAT: boş kod gönderilemez — "Kuponu Uygula" düğmesi `disabled={!code.trim()}`
   * (CheckoutCard/index.tsx:123). İlk yazdığım "boş kod null iletilir" beklentisi
   * yanlıştı; gerçek davranış budur.
   */
  it('boş kodla gönderim düğmesi devre dışıdır', async () => {
    const { onSubmitDiscountCode, user } = setup();
    // Kart başlığı da "İndirim Kuponu Uygula" metnini taşıyor; submit
    // düğmesini tipiyle ayırıyoruz.
    const submit = document.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submit).toBeDisabled();

    await user.click(couponInput());
    await user.keyboard('{Enter}');
    expect(onSubmitDiscountCode).not.toHaveBeenCalled();
  });

  it('uygulanmış kupon "Kaldır" ile temizlenir', async () => {
    const { onSubmitDiscountCode, user } = setup({
      orderSummary: { ...baseProps.orderSummary, discountCode: 'INDIRIM10' },
    });

    await user.click(screen.getByText('Kaldır').closest('button')!);
    await waitFor(() => expect(onSubmitDiscountCode).toHaveBeenCalledWith(null));
  });

  it('kupon uygulanmışsa alan kilitlenir ve kod gösterilir', () => {
    setup({
      orderSummary: { ...baseProps.orderSummary, discountCode: 'INDIRIM10', promotionDiscount: 100 },
    });

    expect(couponInput()).toBeDisabled();
    expect(screen.getByText(/INDIRIM10 uygulandı/)).toBeInTheDocument();
  });
});
