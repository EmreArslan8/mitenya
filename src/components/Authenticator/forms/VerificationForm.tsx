'use client';

import { Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FormEvent, useEffect, useState } from 'react';
import Button from '@/components/common/Button';

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
    <Stack gap={3}>
      <Typography variant="body2" color="text.secondary">
        <strong>{email}</strong> adresine gönderilen 6 haneli kodu gir.
      </Typography>

      <Stack component="form" gap={3} onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={code}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            if (val.length <= 6) setCode(val);
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          placeholder="000000"
          inputProps={{ maxLength: 6 }}
        />
        <Stack direction="row" gap={1}>
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
          <LoadingButton loading={loading} variant="contained" disabled={code.length < 6} type="submit" fullWidth>
            Doğrula
          </LoadingButton>
        </Stack>
      </Stack>

      <Button variant="text" size="small" arrow="start" onClick={onBack} sx={{ alignSelf: 'flex-start' }}>
        Geri dön
      </Button>
    </Stack>
  );
};

export default VerificationForm;
