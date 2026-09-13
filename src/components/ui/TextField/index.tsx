import type { Ref } from 'react';
import { ReactNode, useId } from 'react';
import { Asterisk } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { Input, type InputProps } from '@/components/ui/Input';

/**
 * Etiketli metin alanı — MUI `<TextField>` karşılığı.
 *
 * MUI'nin `TextField`'ı üç şeyin birleşimiydi: etiket + girdi + yardım/hata
 * metni; ve bunları `aria` ile birbirine bağlardı. **Elle yazarken en kolay
 * kaybedilen şey bu bağdır** — bu bileşenin asıl varlık sebebi o bağı tek
 * yerde, doğru kurmak:
 *
 *   <label htmlFor>  ↔  <input id>          etikete tıklayınca odaklanır
 *   aria-describedby ↔  hata/yardım metni   ekran okuyucu mesajı okur
 *   aria-invalid                            hata durumu duyurulur
 *
 * ⚠️ Mevcut `FormikTextField` bu bağı KURMUYORDU: etiketi
 * `<Typography component="label">` olarak basıp `htmlFor` vermiyordu
 * (FormikTextField/index.tsx:51 vs :63). Yani bugüne kadar ekran okuyucu bu
 * alanları adlandıramıyordu ve etikete tıklamak işe yaramıyordu. Bu bileşen
 * o hatayı düzeltiyor — ADR-0002 Faz 3, F3.0 testlerinde tespit edildi.
 *
 * Hata metni renkle DEĞİL, metinle de belirtilir (WCAG 1.4.1).
 */

export type TextFieldProps = Omit<InputProps, 'describedBy' | 'error'> & {
  label?: ReactNode;
  /**
   * Hata durumu. `string` verilirse hem hatalı görünür hem mesaj basılır;
   * `true` verilirse yalnızca hatalı görünür (mesajı çağıran gösterecekse).
   */
  error?: string | boolean;
  /** Hata yokken gösterilen açıklama. */
  helperText?: ReactNode;
  /** Etiketin yanında kırmızı yıldız gösterir. */
  required?: boolean;
  /** Dış sarmalayıcıya uygulanır (genişlik vb.). */
  wrapperClassName?: string;
  labelClassName?: string;
  /**
   * Girdi elemanına doğrudan erişim. Maskeleme yapan alanlar imleci
   * konumlandırmak için buna ihtiyaç duyuyor (FormikPhoneNumberInput).
   */
  inputRef?: Ref<HTMLInputElement>;
};

export function TextField({
  label,
  error,
  helperText,
  required,
  id,
  wrapperClassName,
  labelClassName,
  inputRef,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const errorText = typeof error === 'string' && error ? error : undefined;
  const hasError = Boolean(error);
  const message = errorText ?? helperText;

  return (
    <div className={cn('flex w-full flex-col gap-1', wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-center gap-0.5 text-[14px] font-normal leading-[16.8px] sm:text-[15px] sm:leading-[18px]',
            hasError ? 'text-error' : 'text-text',
            labelClassName,
          )}
        >
          {label}
          {required && <Asterisk size={8} className="text-error" />}
        </label>
      )}

      <Input
        {...inputProps}
        ref={inputRef}
        id={inputId}
        required={required}
        error={hasError}
        describedBy={message ? messageId : undefined}
      />

      {message && (
        <span
          id={messageId}
          role={errorText ? 'alert' : undefined}
          className={cn(
            'px-1 text-[12px] leading-[1.4]',
            errorText ? 'text-error' : 'text-text-light',
          )}
        >
          {message}
        </span>
      )}
    </div>
  );
}

export default TextField;
