'use client';

import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';

interface PasswordFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
}

const PasswordField = ({ name, label, value, onChange, error, helperText, autoComplete }: PasswordFieldProps) => {
  const [show, setShow] = useState(false);
  return (
    <TextField
      fullWidth
      name={name}
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      autoComplete={autoComplete}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => setShow((s) => !s)}
              edge="end"
              aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
            >
              {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PasswordField;
