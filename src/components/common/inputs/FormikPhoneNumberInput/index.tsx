import { TextField } from '@/components/ui/TextField';
import { ChangeEvent, FocusEvent, MouseEvent, useId, useLayoutEffect, useMemo, useRef } from 'react';

interface FormikPhoneNumberInputProps {
  formik: any;
  label?: string;
  disabled?: boolean;
}

const formatPhone = (raw: string): string => {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (!d) return '';
  let r = '';
  r += d.slice(0, 3);
  if (d.length >= 3) r += ') ';
  if (d.length > 3) r += d.slice(3, 6);
  if (d.length > 6) r += ' ' + d.slice(6, 8);
  if (d.length > 8) r += ' ' + d.slice(8, 10);
  return r;
};

const countDigitsBeforePos = (value: string, pos: number): number => {
  let count = 0;
  for (let i = 0; i < Math.min(pos, value.length); i += 1) {
    if (/\d/.test(value[i])) count += 1;
  }
  return count;
};

const caretPosForDigits = (value: string, digitsCount: number): number => {
  if (digitsCount <= 0) return 0;
  let count = 0;
  for (let i = 0; i < value.length; i += 1) {
    if (/\d/.test(value[i])) {
      count += 1;
      if (count >= digitsCount) {
        let pos = i + 1;
        while (pos < value.length && /\D/.test(value[pos])) pos += 1;
        return pos;
      }
    }
  }
  return value.length;
};

const FormikPhoneNumberInput = ({
  formik,
  label,
  disabled = false,
}: FormikPhoneNumberInputProps) => {
  // Sabit id çakışıyordu: checkout'ta iki adres formu (review bulgusu).
  const uid = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caretDigitsRef = useRef<number | null>(null);
  const prevRawRef = useRef<string>('');
  const formattedValue = useMemo(
    () => formatPhone(formik.values.phoneNumber ?? ''),
    [formik.values.phoneNumber]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const selectionStart = e.target.selectionStart ?? input.length;
    caretDigitsRef.current = countDigitsBeforePos(input, selectionStart);
    const digits = input.replace(/\D/g, '');
    const inputType = (e.nativeEvent as InputEvent | undefined)?.inputType ?? '';
    const isDelete = inputType.startsWith('delete');
    const shouldDropDigit = isDelete && digits.length === prevRawRef.current.length;
    const trimmedDigits = shouldDropDigit ? digits.slice(0, -1) : digits;
    const raw = (trimmedDigits.startsWith('0') ? trimmedDigits.slice(1) : trimmedDigits).slice(0, 10);
    prevRawRef.current = raw;
    formik.setFieldValue('phoneNumber', raw);
  };

  const moveCaretPastPrefix = (el: HTMLInputElement | null) => {
    if (!el || typeof el.setSelectionRange !== 'function') return;
    const pos = el.selectionStart ?? 0;
    if (pos <= 0) {
      requestAnimationFrame(() => {
        el.setSelectionRange(0, 0);
      });
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    moveCaretPastPrefix(e.currentTarget);
  };

  const handleClick = (e: MouseEvent<HTMLInputElement>) => {
    moveCaretPastPrefix(e.currentTarget);
  };

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el || caretDigitsRef.current === null) return;
    const pos = caretPosForDigits(formattedValue, caretDigitsRef.current);
    requestAnimationFrame(() => {
      el.setSelectionRange(pos, pos);
    });
    caretDigitsRef.current = null;
    prevRawRef.current = formik.values.phoneNumber ?? '';
  }, [formattedValue]);

  const touched = Boolean(formik.touched.phoneNumber);
  const fieldError = formik.errors.phoneNumber;

  return (
    /*
     * ADR-0002 Faz 3: MUI TextField -> ui/TextField.
     * MASKELEME VE İMLEÇ MANTIĞINA DOKUNULMADI (formatPhone,
     * countDigitsBeforePos, caretPosForDigits, useLayoutEffect) — yalnızca
     * görsel kabuk değişti.
     *
     * Eski sx karşılıkları:
     *   zemin (eski #F7F7F8) -> ui/Input variant="soft" (gray-50)
     *   yükseklik 48 -> size="large" · ikisi de artık ui/Input'ta tek karar
     *   kenarlık rgba(0,0,0,.12) · odakta #C1121F (= palette.error.main)
     *   letterSpacing .08em + tabular-nums · placeholder #9B9BA1 (= text.light)
     */
    <TextField
      id={`phoneNumber-${uid}`}
      name="phoneNumber"
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      required
      label={label}
      placeholder="___) ___ __ __"
      disabled={disabled}
      size="large"
      value={formattedValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onClick={handleClick}
      inputRef={inputRef}
      error={touched && fieldError ? String(fieldError) : false}
      variant="soft"
      inputClassName="tracking-[0.08em] [font-variant-numeric:tabular-nums] placeholder:tracking-[0.08em]"
      startSlot={<span className="shrink-0 text-inherit">0 (</span>}
    />
  );
};

export default FormikPhoneNumberInput;
