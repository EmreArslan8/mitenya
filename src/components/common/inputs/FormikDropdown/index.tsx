'use client';

import { useId } from 'react';
import type { FormikProps } from 'formik';
import { Asterisk } from '@/components/icons';
import { Select, SelectItem } from '@/components/ui/Select';
import { cn } from '@/lib/utils/cn';

/**
 * Formik'e bağlı açılır seçim — ADR-0002 Faz 3'te MUI `Select`'ten
 * `ui/Select`'e (Radix) taşındı.
 *
 * İki düzeltme:
 *   1. Etiket artık girdiye `htmlFor` ile bağlı (eskiden değildi).
 *   2. `formik: any` gitti — jenerik tiplendi (ADR §11.4).
 *
 * DİKKAT — boş değer: MUI'de `displayEmpty` ile `value=""` bir seçenek
 * olabiliyordu. Radix boş değerli öğeye izin vermez; boş değer artık
 * "seçilmemiş" demek ve `placeholder` gösterilir. Seçenek listesinde boş
 * değerli giriş varsa placeholder'a dönüştürülür.
 */

type Option = { label: string; value: string | number | undefined };

type FormikDropdownProps<Values extends Record<string, unknown>> = {
  formik: FormikProps<Values>;
  fieldKey: keyof Values & string;
  options: Option[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'soft';
  className?: string;
  /** Tetikleyici KUTUYA uygulanır (yükseklik vb.). */
  fieldClassName?: string;
};

const FormikDropdown = <Values extends Record<string, unknown>>({
  formik,
  fieldKey,
  options,
  label,
  placeholder,
  required = false,
  disabled = false,
  onChange,
  size = 'small',
  variant = 'soft',
  className,
  fieldClassName,
}: FormikDropdownProps<Values>) => {
  const generatedId = useId();
  const id = `${fieldKey}-${generatedId}`;

  // Boş değerli seçenek Radix'te olamaz -> placeholder'a dönüşür.
  const emptyOption = options.find((o) => o.value === '' || o.value === undefined);
  const realOptions = options.filter((o) => o.value !== '' && o.value !== undefined);
  const effectivePlaceholder = placeholder ?? emptyOption?.label;

  const touched = Boolean(formik.touched[fieldKey]);
  const hasError = touched && Boolean(formik.errors[fieldKey]);

  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={id}
          className="inline-flex items-center gap-0.5 text-[14px] leading-[16.8px] text-text sm:text-[15px] sm:leading-[18px]"
        >
          {label}
          {required && <Asterisk size={8} className="text-error" />}
        </label>
      )}

      <Select
        /* id ZORUNLU: yoksa yukarıdaki `htmlFor` hiçbir öğeye bağlanmıyordu
           ve etikete tıklamak işe yaramıyordu (review bulgusu). */
        id={id}
        value={String(formik.values[fieldKey] ?? '')}
        onValueChange={(value) => {
          formik.setFieldValue(fieldKey, value);
          onChange?.();
        }}
        disabled={disabled}
        placeholder={effectivePlaceholder}
        aria-label={label}
        className={cn(
          // ui/Input varyantlarıyla aynı görünüm — tek karar (ADR §11.1).
          'rounded-lg px-3',
          variant === 'soft' ? 'border-black/[12%] bg-gray-50' : 'border-text-light bg-white',
          size === 'large' ? 'h-auto min-h-12' : size === 'medium' ? 'h-[46px]' : 'h-9',
          hasError && 'border-error',
          fieldClassName,
        )}
      >
        {realOptions.map((option, idx) => (
          <SelectItem value={String(option.value)} key={`${option.value}-${idx}`}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default FormikDropdown;
