'use client';

import { Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import Button from '../common/Button';
import { LoadingButton } from '@mui/lab';
import ModalCard from '../common/ModalCard';

interface Props {
  email: string;
  onResend: () => void;
  onBack: () => void;
  onClose: () => void;
  onSubmit: (code: string) => Promise<boolean>;
}

const VerificationModal = ({ email, onResend, onBack, onClose, onSubmit }: Props) => {
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
    <ModalCard
      title={<Button arrow="start" size="small" onClick={onBack}>Geri</Button>}
      open
      onClose={onClose}
      showCloseIcon
      sx={{ alignItems: 'center', justifyContent: 'center' }}
      CardProps={{ sx: { width: { xs: 'calc(100% - 24px)', sm: 'fit-content' }, maxWidth: { xs: 420, sm: 480 }, borderRadius: 2, mx: 'auto' } }}
    >
      <Stack gap={2}>
        <Stack gap={0.5}>
          <Typography variant="h2" fontSize={22} fontWeight={700}>E-postanı doğrula</Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>{email}</strong> adresine gönderilen 6 haneli kodu gir.
          </Typography>
        </Stack>

        <Stack component="form" gap={3} onSubmit={handleSubmit}>
          <TextField
            fullWidth
            value={code}
            onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 6) setCode(val); }}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="000000"
            inputProps={{ maxLength: 6 }}
          />
          <Stack direction="row" gap={1}>
            <Button variant="outlined" disabled={seconds > 0} onClick={() => { onResend(); setSeconds(60); }}>
              Yeniden Gönder {seconds > 0 && `(${seconds})`}
            </Button>
            <LoadingButton loading={loading} variant="contained" disabled={code.length < 6} type="submit">
              Doğrula
            </LoadingButton>
          </Stack>
        </Stack>
      </Stack>
    </ModalCard>
  );
};

export default VerificationModal;
