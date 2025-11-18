import Icon from '@/components/Icon';
import { Stack, Typography, Select, MenuItem } from '@mui/material';

const FormikDropdown = ({
  formik,
  width = '100%',
  fieldKey,
  required = false,
  disabled = false,
  label,
  options,
}: {
  formik: any;
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
          {required && <Icon name="asterisk" color='error' fontSize={8} />}
        </Typography>
      )}
      <Select
        fullWidth
        required={required}
        disabled={disabled}
        size="small"
        id={fieldKey}
        name={fieldKey}
        value={formik.values[fieldKey]}
        onChange={(e) => formik.setFieldValue(fieldKey, e.target.value)}
        error={formik.touched[fieldKey] && Boolean(formik.errors[fieldKey])}
      >
        {options.map((e) => (
          <MenuItem value={e.value} key={e.value} sx={{}}>
            {e.label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
};

export default FormikDropdown;
