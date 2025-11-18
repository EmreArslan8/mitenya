import Icon from '@/components/Icon';
import { usePalette } from '@/theme/ThemeRegistry';
import { Box, InputAdornment, Stack, TextField, TextFieldProps, Typography } from '@mui/material';
import { ChangeEvent, ReactNode, useMemo, useState } from 'react';
import { FormikProps } from "formik";


const FormikTextField = ({
  formik,
  width = '100%',
  fieldKey,
  required = false,
  label,
  limit,
  placeholder,
  disabled = false,
  props = {},
  helperText = '',
  showHelperText = false,
}: {
  formik: FormikProps<any>;
  width?: string | number;
  fieldKey: string;
  required?: boolean;
  label?: ReactNode;
  limit?: number;
  placeholder?: string;
  disabled?: boolean;
  props?: TextFieldProps;
  helperText?: ReactNode;
  showHelperText?: boolean;
}) => {
  const palette = usePalette();
  const [remainingChars, setRemainingChars] = useState(
    limit ? limit - (formik.values[fieldKey]?.length ?? 0) : 1
  );
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    limit && setRemainingChars(limit - e.target.value.length);
  };

  const counterColor = useMemo(() => {
    if (remainingChars <= 0) return palette.error.main;
    else if (limit === remainingChars) return palette.text.light;
    else return 'inherit';
  }, [remainingChars, limit]);

  return (
    <Stack gap={0.5} width={width} display="inline-flex">
      {label && (
        <Typography
          variant="infoLabel"
          component="label"
          color={
            formik.touched[fieldKey] && formik.errors[fieldKey]
              ? palette.error.main
              : undefined
          }
        >
          {label}
          {required && <Icon name="asterisk" color="error" fontSize={8} />}
        </Typography>
      )}
      <TextField
        fullWidth
        required={required}
        disabled={disabled}
        size="small"
        id={fieldKey}
        name={fieldKey}
        value={formik.values[fieldKey]}
        onChange={handleChange}
        placeholder={placeholder ?? undefined}
        error={formik.touched[fieldKey] && Boolean(formik.errors[fieldKey])}
        {...props}
        InputProps={{
          endAdornment: formik.values[fieldKey] && limit && (
            <InputAdornment position="end">
              <Box color={counterColor}>{remainingChars}</Box>
            </InputAdornment>
          ),
          sx: { ...props.InputProps?.sx },
        }}
        helperText={
          showHelperText && formik.touched[fieldKey] && formik.errors[fieldKey]
            ? String(formik.errors[fieldKey])
            : helperText
        }
        sx={{ '& .MuiFormHelperText-root': { mx: 1, mt: '2px' } }}
      />
    </Stack>
  );
};

export default FormikTextField;
