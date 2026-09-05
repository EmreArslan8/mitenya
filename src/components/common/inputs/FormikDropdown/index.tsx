
import { Stack, Typography, Select, MenuItem, SxProps } from '@mui/material';
import { Asterisk } from '@/components/icons';

const FormikDropdown = ({
  formik,
  width = '100%',
  fieldKey,
  required = false,
  disabled = false,
  label,
  options,
  selectSx,
  onChange,
  size = 'small',
}: {
  formik: any;
  width?: string | number;
  fieldKey: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  options: { label: string; value: string | number | undefined }[];
  selectSx?: SxProps;
  onChange?: () => void;
  size?: 'small' | 'medium';
}) => {
  return (
    <Stack gap={0.5} width={width} display="inline-flex">
      {label && (
        <Typography variant="infoLabel" component="label">
          {label}
          {required && <Asterisk color='error' size={8} />}
        </Typography>
      )}
      <Select
        fullWidth
        required={required}
        disabled={disabled}
        size={size}
        id={fieldKey}
        name={fieldKey}
        value={formik.values[fieldKey]}
        onChange={(e) => {
          formik.setFieldValue(fieldKey, e.target.value);
          onChange?.();
        }}
        error={formik.touched[fieldKey] && Boolean(formik.errors[fieldKey])}
        displayEmpty
        sx={{
          borderRadius: 1,
          backgroundColor: '#F7F7F8',
          '& .MuiSelect-select': { display: 'flex', alignItems: 'center', px: 1.5 },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.12)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#C1121F', borderWidth: 1 },
          ...selectSx,
        }}
      >
        {options.map((e, idx) => (
          <MenuItem value={e.value} key={`${e.value}-${idx}`}>
            {e.label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
};

export default FormikDropdown;
