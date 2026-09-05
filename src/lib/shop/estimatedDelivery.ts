/** Kargo tahmini hep Türkiye saatine göre hesaplanır — sunucu nerede olursa olsun. */
const TIME_ZONE = 'Europe/Istanbul';

/**
 * "5 Eylül Cumartesi" biçiminde tahmini kargo günü döner.
 *
 * @param daysAhead bugünden kaç gün sonrası (varsayılan: ertesi gün)
 * @param from      referans an; testler için dışarıdan verilebilir
 */
const estimatedDeliveryLabel = (daysAhead = 1, from: Date = new Date()): string => {
  const target = new Date(from.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const parts = new Intl.DateTimeFormat('tr-TR', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).formatToParts(target);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  // Parça sırasını locale'e bırakmayıp kendimiz kuruyoruz.
  return `${get('day')} ${get('month')} ${get('weekday')}`;
};

export default estimatedDeliveryLabel;
