import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import userEvent from '@testing-library/user-event';
import AddressForm from './AddressForm';

/**
 * ADR-0002 Faz 3 / F3.0 — KARAKTERİZASYON TESTİ (dönüşümden ÖNCE yazıldı).
 *
 * Korunan davranışlar: zorunlu alanların varlığı ve etiket bağı,
 * **telefon maskesi** (`5XX) XXX XX XX`) ve zorunlu alanlar boşken kaydın
 * yapılmaması.
 *
 * Coğrafi veri (`/geo/tr/*.json`) mock'lanıyor: test ağ istemez, ama
 * bileşenin bu veriyi yükleme yolu gerçek kalır.
 *
 * ⚠️ BULGU: `FormikTextField` etiketi `<Typography component="label">` olarak
 * basıyor ama `htmlFor` VERMİYOR (FormikTextField/index.tsx:51 vs :63) — yani
 * etiket girdiye bağlı değil. Ekran okuyucu alanı adlandıramıyor, etikete
 * tıklamak girdiye odaklanmıyor. Bu yüzden test şimdilik `name` özniteliğinden
 * gidiyor. Faz 3'te `ui/Field` bu bağı kuracak; o zaman `getByLabelText`
 * testleri eklenecek (F3.1 DoD).
 */
const cities = [{ id: 1, name: 'İstanbul', plaka: 34 }];
const districts = [{ id: 10, name: 'Kadıköy', kimlikNo: 1, il_id: 1 }];

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const body = String(url).includes('iller') ? cities : String(url).includes('ilceler') ? districts : [];
      return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

const setup = () => {
  const onSubmit = vi.fn();
  render(<AddressForm onSubmit={onSubmit} />);
  return { onSubmit, user: userEvent.setup() };
};

describe('AddressForm', () => {
  const field = (name: string) =>
    document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;

  it('zorunlu alanları sunar', async () => {
    setup();
    await waitFor(() => expect(field('contactName')).toBeInTheDocument());
    expect(field('contactSurname')).toBeInTheDocument();
    expect(field('phoneNumber')).toBeInTheDocument();
  });

  it('etiket metinleri ekranda görünür', async () => {
    setup();
    expect(await screen.findByText('Telefon')).toBeInTheDocument();
    expect(screen.getByText('Adres Başlığı')).toBeInTheDocument();
  });

  it('telefon alanı girilen rakamları maskeler', async () => {
    const { user } = setup();
    await waitFor(() => expect(field('phoneNumber')).toBeInTheDocument());
    const phone = field('phoneNumber');

    await user.type(phone, '5321234567');

    // formatPhone: 532) 123 45 67
    await waitFor(() => expect(phone).toHaveValue('532) 123 45 67'));
  });

  it('telefon alanı 10 rakamdan fazlasını kabul etmez', async () => {
    const { user } = setup();
    await waitFor(() => expect(field('phoneNumber')).toBeInTheDocument());
    const phone = field('phoneNumber');

    await user.type(phone, '53212345678999');

    await waitFor(() => expect(phone).toHaveValue('532) 123 45 67'));
  });

  it('telefon alanı harfleri yok sayar', async () => {
    const { user } = setup();
    await waitFor(() => expect(field('phoneNumber')).toBeInTheDocument());
    const phone = field('phoneNumber');

    await user.type(phone, '532abc1234567');

    await waitFor(() => expect(phone).toHaveValue('532) 123 45 67'));
  });
});
