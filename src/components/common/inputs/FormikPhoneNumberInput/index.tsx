import { InputAdornment, TextField } from '@mui/material';
import { ChangeEvent, FocusEvent, MouseEvent, useLayoutEffect, useMemo, useRef } from 'react';

interface FormikPhoneNumberInputProps {
  formik: any;
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  fullWidth?: boolean;
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
  size = 'small',
  disabled = false,
}: FormikPhoneNumberInputProps) => {
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

  return (
    <TextField
      fullWidth
      size={size}
      id="phoneNumber"
      name="phoneNumber"
      type="tel"
      required
      label={label}
      placeholder="___) ___ __ __"
      disabled={disabled}
      value={formattedValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onClick={handleClick}
      inputRef={inputRef}
      inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
      InputProps={{
        startAdornment: (
          <InputAdornment
            position="start"
            sx={{ mr: 0, color: 'inherit', '& .MuiTypography-root': { color: 'inherit' } }}
          >
            0 (
          </InputAdornment>
        ),
        sx: {
          borderRadius: 1,
          backgroundColor: '#F7F7F8',
          px: 1.5,
          height: 'auto',
          minHeight: 48,
        },
      }}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-input': {
          paddingLeft: 0,
          letterSpacing: '0.08em',
          fontVariantNumeric: 'tabular-nums',
        },
        '& .MuiInputAdornment-positionStart': { marginRight: 0 },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.12)' },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#C1121F',
          borderWidth: 1,
        },
        '& input::placeholder': {
          color: '#9B9BA1',
          opacity: 1,
          letterSpacing: '0.08em',
        },
      }}
      error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
    />
  );
};

export default FormikPhoneNumberInput;
