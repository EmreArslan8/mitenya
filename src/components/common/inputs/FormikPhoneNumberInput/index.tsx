import {
  Autocomplete,
  Box,
  Stack,
  TextField,
  createFilterOptions,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from '@mui/material';

import phoneCodes from '@/lib/utils/phoneCodes';
import styles from './styles';
import { FormikProps } from 'formik';
import React from 'react';

interface PhoneCodeOption {
  name: string;
  code: string;
  phoneCode: string;
  localName: string;
  turkishName: string;
}

interface FormikPhoneNumberInputProps {
  formik: FormikProps<any>;
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

  // 🔥 renderOption doğru tip: (props, option) → JSX
  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: PhoneCodeOption,
    state: AutocompleteRenderOptionState
  ) => (
    <li {...props} key={option.code}>
      <Box sx={{ '& > img': { mr: 1.5, flexShrink: 0 } }}>
        <Box sx={{ color: '#101b218a', width: 60 }}>{option.phoneCode}</Box>
        <Box sx={{ mr: 4, display: { xs: 'none', sm: 'inline' } }}>{option.localName}</Box>
      </Box>
    </li>
  );

  // 🔥 renderInput doğru tip: AutocompleteRenderInputParams
  const renderInput = (params: AutocompleteRenderInputParams) => (
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

  // 🔥 createFilterOptions doğru generic
  const filterOptions = createFilterOptions<PhoneCodeOption>({
    stringify: (opt) =>
      `${opt.code} ${opt.name} ${opt.phoneCode} ${opt.localName} ${opt.turkishName}`,
  });

  return (
    <Stack direction="row" sx={{ direction: 'ltr' }}>
      <Autocomplete<PhoneCodeOption>
        filterOptions={filterOptions}
        options={phoneCodes as PhoneCodeOption[]}
        defaultValue={
          phoneCodes.find((e) => e.phoneCode === formik.values.phoneCode) as PhoneCodeOption
        }
        disabled={disabled}
        autoHighlight
        disableClearable={false} // ❗ Tip hatası burada çözülüyor
        getOptionLabel={(option) => option.phoneCode}
        onChange={(_, value) =>
          formik.setFieldValue('phoneCode', value?.phoneCode ?? '')
        }
        renderOption={renderOption}
        renderInput={renderInput}
        componentsProps={{ paper: { sx: { minWidth: 'max-content' } } }}
        sx={{ width: 100, flexShrink: 0 }}
      />

      {/* Phone Number */}
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
        sx={{
          ...styles.inputNoArrows,
          width: { xs: '100%', lg: fullWidth ? '100%' : 120 },
        }}
        error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
      />
    </Stack>
  );
};

export default FormikPhoneNumberInput;
