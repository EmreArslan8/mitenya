'use client';

import { ChangeEvent, ReactNode, useId, useMemo, useState } from 'react';
import type { FormikProps } from 'formik';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { cn } from '@/lib/utils/cn';

/**
 * Formik'e bağlı metin alanı — ADR-0002 Faz 3'te MUI'den `ui/TextField`'a taşındı.
 *
 * Korunan davranışlar:
 *   · etiket + zorunluluk yıldızı
 *   · `limit` verildiğinde karakter sayacı (0'a inince hata rengi)
 *   · `formik.touched/errors` ile hata durumu
 *
 * Düzelen: etiket artık girdiye `htmlFor` ile bağlı (eski sürümde değildi —
 * ekran okuyucu alanı adlandıramıyordu).
 *
 * Temizlenen: `formik: any` ve `props: any` gitti (ADR §11.4).
 */

type FormikTextFieldProps<Values extends Record<string, unknown>> = {
  /** Formik nesnesi. `fieldKey` yalnızca gerçek alan adlarından biri olabilir. */
  formik: FormikProps<Values>;
  fieldKey: keyof Values & string;
  label?: ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** Karakter sınırı — verilirse sağda kalan karakter sayacı çıkar. */
  limit?: number;
  helperText?: ReactNode;
  /** Doğrulama hatasını yardım metni olarak göster. */
  showHelperText?: boolean;
  /** Dış sarmalayıcı genişliği (eski `width` prop'unun karşılığı). */
  className?: string;
  /** Girdi KUTUSUNA uygulanır (yükseklik, zemin vb.). */
  fieldClassName?: string;
  type?: TextFieldProps['type'];
  autoComplete?: string;
  inputMode?: TextFieldProps['inputMode'];
  size?: TextFieldProps['size'];
  variant?: TextFieldProps['variant'];
  multiline?: boolean;
  minRows?: number;
};

const FormikTextField = <Values extends Record<string, unknown>>({
  formik,
  fieldKey,
  label,
  placeholder,
  required = false,
  disabled = false,
  limit,
  helperText = '',
  showHelperText = false,
  className,
  fieldClassName,
  type,
  autoComplete,
  inputMode,
  size = 'small',
  variant,
  multiline,
  minRows,
}: FormikTextFieldProps<Values>) => {
  /*
   * id `fieldKey` DEĞİL: checkout'ta iki AddressForm aynı anda render
   * olabiliyor (teslimat + fatura). `ui/TextField` artık label↔input bağını
   * kurduğu için çakışan id'ler etiketin YANLIŞ forma odaklanmasına ve
   * `aria-describedby`nin yanlış hata metnini göstermesine yol açıyordu
   * (review bulgusu). `name` çakışmaz, çünkü her form kendi Formik'inde.
   */
  const uid = useId();
  const inputId = `${fieldKey}-${uid}`;
  const value = String(formik.values[fieldKey] ?? '');
  const [remainingChars, setRemainingChars] = useState(limit ? limit - value.length : 1);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    if (limit) setRemainingChars(limit - e.target.value.length);
  };

  const counterClass = useMemo(() => {
    if (remainingChars <= 0) return 'text-error';
    if (limit === remainingChars) return 'text-text-light';
    return 'text-inherit';
  }, [remainingChars, limit]);

  const touched = Boolean(formik.touched[fieldKey]);
  const fieldError = formik.errors[fieldKey];
  const error = touched && fieldError ? String(fieldError) : false;

  return (
    <TextField
      id={inputId}
      name={fieldKey}
      label={label}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      type={type}
      autoComplete={autoComplete}
      inputMode={inputMode}
      size={size}
      variant={variant}
      multiline={multiline}
      minRows={minRows}
      value={value}
      onChange={handleChange}
      onBlur={formik.handleBlur}
      /* Eski davranış: hata rengi her zaman (touched+error), mesaj yalnızca
         `showHelperText` ise. `string` mesajı da basar, `true` sadece boyar. */
      error={showHelperText ? error : Boolean(error)}
      helperText={helperText}
      wrapperClassName={className}
      className={fieldClassName}
      endSlot={
        value && limit ? (
          <span className={cn('shrink-0 text-[13px]', counterClass)}>{remainingChars}</span>
        ) : undefined
      }
    />
  );
};

export default FormikTextField;
