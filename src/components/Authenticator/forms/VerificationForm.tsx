'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
  email: string;
  onResend: () => void;
  onBack: () => void;
  onSubmit: (code: string) => Promise<boolean>;
}

const VerificationForm = ({ email, onResend, onBack, onSubmit }: Props) => {
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(code);
    setLoading(false);
  };

  useEffect(() => {
    if (seconds > 0) {
      const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [seconds]);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-text-medium-light">
        <strong>{email}</strong> adresine gönderilen 6 haneli kodu gir.
      </p>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          value={code}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            if (val.length <= 6) setCode(val);
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          placeholder="000000"
          maxLength={6}
          aria-label="Doğrulama kodu"
        />
        <div className="flex gap-2">
          <Button
            variant="outlined"
            disabled={seconds > 0}
            onClick={() => {
              onResend();
              setSeconds(60);
            }}
          >
            Yeniden Gönder {seconds > 0 && `(${seconds})`}
          </Button>
          <Button loading={loading} variant="contained" disabled={code.length < 6} type="submit" fullWidth>
            Doğrula
          </Button>
        </div>
      </form>

      <Button variant="text" size="small" arrow="start" onClick={onBack} className="self-start">
        Geri dön
      </Button>
    </div>
  );
};

export default VerificationForm;
