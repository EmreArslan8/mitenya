'use client';

import { useMemo, useState, useId } from 'react';
import { useCombobox } from 'downshift';
import type { FormikProps } from 'formik';
import { Asterisk, ChevronDown } from '@/components/icons';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';

/**
 * Yazarak arayıp seçilen alan (combobox) — MUI `<Autocomplete>` yerine.
 *
 * BAĞIMLILIK KARARI (ADR-0002 §11.2): `downshift` (~12 KB) kullanılıyor.
 * Radix'te combobox primitifi YOK. Elle yazmak `aria-activedescendant`,
 * tip-ahead, ok tuşları, dış tıklama ve seçili öğeye kaydırmayı doğru kurmayı
 * gerektirir; bunlar sessizce bozulur ve ekran okuyucu kullanıcıları için
 * alanı kullanılamaz hâle getirir. `downshift` headless'tır — görünüm bizde.
 *
 * Erişilebilirlik: `downshift` `role="combobox"`, `aria-expanded`,
 * `aria-controls` ve `aria-activedescendant`'ı kendi yönetir. Etiket ↔ girdi
 * bağı `getLabelProps` ile kuruluyor (MUI sürümünde bu bağ YOKTU).
 */

type Option = { label: string; value: string | number | undefined };

type FormikAutocompleteProps<Values extends Record<string, unknown>> = {
  formik: FormikProps<Values>;
  fieldKey: keyof Values & string;
  options: Option[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'soft';
};

const FormikAutocomplete = <Values extends Record<string, unknown>>({
  formik,
  fieldKey,
  options,
  label,
  required = false,
  disabled = false,
  className,
  size = 'large',
  variant = 'soft',
}: FormikAutocompleteProps<Values>) => {
  const listId = useId();
  const selectedValue = formik.values[fieldKey];
  const selectedOption = useMemo(
    () => options.find((o) => o.value === selectedValue) ?? null,
    [options, selectedValue],
  );

  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    if (!q) return options;
    return options.filter((o) => o.label.toLocaleLowerCase('tr').includes(q));
  }, [options, query]);

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getItemProps,
    getToggleButtonProps,
    highlightedIndex,
  } = useCombobox({
    id: listId,
    items: filtered,
    itemToString: (item) => item?.label ?? '',
    selectedItem: selectedOption,
    onInputValueChange: ({ inputValue }) => setQuery(inputValue ?? ''),
    onSelectedItemChange: ({ selectedItem }) => {
      formik.setFieldValue(fieldKey, selectedItem ? selectedItem.value : '');
      setQuery('');
    },
  });

  const touched = Boolean(formik.touched[fieldKey]);
  const fieldError = touched && formik.errors[fieldKey] ? String(formik.errors[fieldKey]) : '';

  return (
    <div className={cn('relative flex w-full flex-col gap-1', className)}>
      {label && (
        <label
          {...getLabelProps()}
          className="inline-flex items-center gap-0.5 text-[14px] leading-[16.8px] text-text sm:text-[15px] sm:leading-[18px]"
        >
          {label}
          {required && <Asterisk size={8} className="text-error" />}
        </label>
      )}

      <Input
        {...getInputProps({ disabled })}
        error={Boolean(fieldError)}
        size={size}
        variant={variant}
        endSlot={
          <button
            type="button"
            {...getToggleButtonProps({ disabled })}
            aria-label="Seçenekleri aç"
            className="flex size-6 shrink-0 items-center justify-center text-text-light"
          >
            <ChevronDown size={18} className={cn('transition-transform', isOpen && 'rotate-180')} />
          </button>
        }
      />

      <ul
        {...getMenuProps()}
        className={cn(
          'absolute left-0 right-0 top-full z-[1400] mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-100 bg-white p-1 shadow-lg',
          !isOpen && 'hidden',
        )}
      >
        {isOpen &&
          filtered.map((item, index) => (
            <li
              key={`${String(item.value ?? item.label)}-${index}`}
              {...getItemProps({ item, index })}
              className={cn(
                'cursor-pointer rounded-md px-3 py-2 text-[14px] text-text',
                highlightedIndex === index && 'bg-gray-50',
                selectedOption?.value === item.value && 'font-semibold',
              )}
            >
              {item.label}
            </li>
          ))}
        {isOpen && filtered.length === 0 && (
          <li className="px-3 py-2 text-[14px] text-text-light">Sonuç bulunamadı</li>
        )}
      </ul>

      {fieldError && (
        <span role="alert" className="px-1 text-[12px] leading-[1.4] text-error">
          {fieldError}
        </span>
      )}
    </div>
  );
};

export default FormikAutocomplete;
