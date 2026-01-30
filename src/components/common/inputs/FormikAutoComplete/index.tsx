import { Autocomplete, Stack, TextField, Typography, SxProps } from '@mui/material';
import { Asterisk } from 'lucide-react';

const FormikAutocomplete = ({
  formik,
  width = '100%',
  fieldKey,
  required = false,
  disabled = false,
  label,
  options,
  textFieldSx,
}: {
  formik: any;
  width?: string | number;
  fieldKey: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  options: { label: string; value: string | number | undefined }[];
  textFieldSx?: SxProps;
}) => {

  return (
    <Stack gap={0.5} width={width} display="inline-flex">
      {label && (
        <Typography variant="infoLabel" component="label">
          {label}
          {required && <Asterisk color="error" size={8} />}
        </Typography>
      )}
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        value={options.find((option) => option.value === formik.values[fieldKey]) || null}
        onChange={(event, newValue) => {
          formik.setFieldValue(fieldKey, newValue ? newValue.value : '');
        }}
        disabled={disabled}
        renderOption={(props, option) => <li {...props}>{option.label}</li>}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            required={required}
            size="small"
            error={formik.touched[fieldKey] && Boolean(formik.errors[fieldKey])}
            helperText={formik.touched[fieldKey] && formik.errors[fieldKey]}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                backgroundColor: '#F7F7F8',
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.12)' },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#C1121F',
                borderWidth: 1,
              },
              ...textFieldSx,
            }}
          />
        )}
      />
    </Stack>
  );
};

export default FormikAutocomplete;
