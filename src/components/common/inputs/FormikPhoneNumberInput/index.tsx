import { Autocomplete, Box, Stack, TextField, createFilterOptions } from '@mui/material';

import phoneCodes from '@/lib/utils/phoneCodes';
import styles from './styles';
import emojiFlags from 'emoji-flags';
import { Country } from '@/lib/utils/countries';

interface FormikPhoneNumberInputProps {
  formik: any;
  size?: 'small' | 'medium';
  disabled?: boolean;
  fullWidth?: boolean;
}

const FormikPhoneNumberInput = ({
  formik,
  size = 'small',
  disabled = false,
  fullWidth = false,
}: FormikPhoneNumberInputProps) => {
  const t = useTranslations('common');

  const renderOption = (props: any, option: any) => (
    <li key={option.code}>
      <Box sx={{ '& > img': { mr: 1.5, flexShrink: 0 } }} {...props}>
        <Box sx={{ color: '#101b218a', width: 60 }}>{option.phoneCode}</Box>
        <Box sx={{ marginRight: 4, display: { xs: 'none', sm: 'inline' } }}>
          {emojiFlags[option.code as Country]?.emoji} {option.localName}
        </Box>
      </Box>
    </li>
  );

  const renderInput = (params: any) => (
    <TextField
      {...params}
      variant="outlined"
      size={size}
      id="phoneCode"
      name="phoneCode"
      placeholder="+123"
      required
      sx={styles.autocompleteInput}
      error={formik.touched.phoneCode && Boolean(formik.errors.phoneCode)}
    />
  );

  const filterOptions = createFilterOptions({
    stringify: ({ name, code, phoneCode, localName, turkishName }: any) =>
      `${code} ${name}  ${phoneCode} ${localName} ${turkishName}`,
  });
  return (
    <Stack direction="row" sx={{ direction: 'ltr' }}>
      <Autocomplete
        filterOptions={filterOptions}
        options={phoneCodes}
        defaultValue={phoneCodes.find((e) => e.phoneCode === formik.values.phoneCode)}
        noOptionsText={t('noOptions')}
        disabled={disabled}
        autoHighlight
        disableClearable
        getOptionLabel={(option) => `${option.phoneCode}`}
        componentsProps={{ paper: { sx: { minWidth: 'max-content' } } }}
        onChange={(e, value) => formik.setFieldValue('phoneCode', value.phoneCode)}
        renderOption={renderOption}
        renderInput={renderInput}
        sx={{ width: 100, flexShrink: 0 }}
      />
      <TextField
        fullWidth
        size={size}
        id="phoneNumber"
        name="phoneNumber"
        type="number"
        required
        placeholder="123 456 78 90"
        disabled={disabled}
        value={formik.values.phoneNumber}
        onChange={formik.handleChange}
        InputProps={{ sx: { borderRadius: '0 8px 8px 0' } }}
        sx={{ ...styles.inputNoArrows, width: { xs: '100%', lg: fullWidth ? '100%' : 120 } }}
        error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
      />
    </Stack>
  );
};

export default FormikPhoneNumberInput;
