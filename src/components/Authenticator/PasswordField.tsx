'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';

/**
 * Göster/gizle düğmeli şifre alanı.
 *
 * ADR-0002 Faz 3: MUI `TextField` + `InputAdornment` + `@mui/icons-material`
 * yerine `ui/TextField` + `lucide-react`. İkonlar zaten `lucide` (projede
 * `@mui/icons-material` yalnızca 1 yerde kalmıştı).
 *
 * Erişilebilirlik: göster/gizle gerçek bir `<button>`, `aria-label`'ı duruma
 * göre değişiyor ve `tabIndex={-1}` DEĞİL — klavyeyle ulaşılabilir.
 */
interface PasswordFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
}

const PasswordField = ({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  autoComplete,
}: PasswordFieldProps) => {
  const [show, setShow] = useState(false);

  return (
    <TextField
      name={name}
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      /* `error` boolean geliyor; mesajı `helperText` taşıyor (MUI'deki
         davranışın aynısı) — bu yüzden ikisi ayrı prop olarak veriliyor. */
      error={error ? helperText || true : false}
      helperText={error ? undefined : helperText}
      endSlot={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
          className="flex size-6 shrink-0 items-center justify-center rounded text-text-light outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
};

export default PasswordField;
