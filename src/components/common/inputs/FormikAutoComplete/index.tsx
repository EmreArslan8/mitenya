import Icon from '@/components/Icon';
import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import styles from './styles'; // Import your styles file
import { FormikProps } from 'formik';

const FormikAutocomplete = ({
  formik,
  width = '100%',
  fieldKey,
  required = false,
  disabled = false,
  label,
  options,
}: {
  formik: FormikProps<any>;
  width?: string | number;
  fieldKey: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  options: { label: string; value: string | number | undefined }[];
}) => {

  return (
    <Stack gap={0.5} width={width} display="inline-flex">
      {label && (
        <Typography variant="infoLabel" component="label">
          {label}
          {required && <Icon name="asterisk" color="error" fontSize={8} />}
        </Typography>
      )}
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label}
        value={options.find((option) => option.value === formik.values[fieldKey]) || null}
        onChange={(event, newValue) => {
          formik.setFieldValue(fieldKey, newValue ? newValue.value : '');
        }}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            required={required}
            size="small"
            error={formik.touched[fieldKey] && Boolean(formik.errors[fieldKey])}
            helperText={
              formik.touched[fieldKey] && typeof formik.errors[fieldKey] === "string"
                ? formik.errors[fieldKey]
                : ""
            }
            InputProps={{
              ...params.InputProps,
              sx: styles.autocompleteInput,
            }}
          />
        )}
      />
    </Stack>
  );
};

export default FormikAutocomplete;
