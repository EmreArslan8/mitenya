import { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import useStyles from './styles';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, value, onChange, size = 'medium' }) => {
  const styles = useStyles(); 
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/\D/g, '');
    if (newValue.length > length) {
      newValue = newValue.slice(0, length);
    }
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && value.length) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const index = e.target.selectionStart || value.length;
    inputRef.current?.setSelectionRange(index, index);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.selectionStart = value.length;
    }
  }, [value]);

  return (
    <Box sx={styles.otpContainer(size)}>
      <TextField
        inputRef={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        autoComplete="one-time-code"
        inputMode="numeric"
        variant="outlined"
        fullWidth
        sx={styles.otpInput}
        inputProps={{
          maxLength: length,
          style: styles.inputText,
        }}
      />
      <Box sx={styles.digitOverlay}>
        {Array.from({ length }).map((_, index) => (
          <Box key={index} sx={styles.digitBox(size)}>
            {value[index] || ''}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default OTPInput;
