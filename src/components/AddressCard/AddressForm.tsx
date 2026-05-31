'use client';

import FormikAutocomplete from '@/components/common/inputs/FormikAutoComplete';
import FormikDropdown from '@/components/common/inputs/FormikDropdown';
import PhoneNumberInput from '@/components/common/inputs/FormikPhoneNumberInput';
import FormikTextField from '@/components/common/inputs/FormikTextField';
import { AddressData } from '@/lib/api/types';
import { DestinationCountry } from '@/lib/utils/countries';
import tokenize from '@/lib/utils/tokenize';
import { Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Asterisk } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type AddressFormFields = {
  name: string;
  contactName: string;
  contactSurname: string;
  phoneNumber: string;
  taxNumber: string;
  lines: string;
  district: string;
  neighborhood: string;
  city: string;
  countryCode: string;
  email: string;
};

interface AddressFormProps {
  onSubmit: (address: AddressData) => void;
  initialValues?: Partial<AddressData>;
  disabledFields?: Partial<Record<keyof AddressData, boolean>>;
  submitTrigger?: unknown;
}

const AddressForm = ({
  onSubmit,
  initialValues,
  disabledFields = {},
  submitTrigger,
}: AddressFormProps) => {
  const isMounted = useRef(false);
  const [cities, setCities] = useState<Array<{ id: number; name: string; plaka: number }>>([]);
  const [districts, setDistricts] = useState<
    Array<{ id: number; name: string; kimlikNo: number; il_id: number }>
  >([]);
  const [neighborhoods, setNeighborhoods] = useState<
    Array<{ id: number; name: string; il_id: number; ilce_id: number }>
  >([]);

  const validate = (values: AddressFormFields) => {
    const errors: Partial<Record<keyof AddressFormFields, string>> = {};

    if (!values.name) errors.name = 'Zorunlu alan';
    if (!values.contactName) errors.contactName = 'Zorunlu alan';
    if (!values.contactSurname) errors.contactSurname = 'Zorunlu alan';
    if (!values.phoneNumber) errors.phoneNumber = 'Zorunlu alan';
    if (!values.lines || values.lines.length < 10) errors.lines = 'En az 10 karakter girin';
    if (!values.city) errors.city = 'Zorunlu alan';
    if (!values.district) errors.district = 'Zorunlu alan';
    if (!values.neighborhood) errors.neighborhood = 'Zorunlu alan';

    return errors;
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: '#fff',
      height: 'auto',
      minHeight: 48,
    },
    '& .MuiSelect-select': {
      padding: '13px 12px !important',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0,0,0,0.23)',
    },
    '& input::placeholder': {
      color: '#9B9BA1',
      opacity: 1,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#C1121F',
      borderWidth: 1,
    },
  } as const;

  const inputProps = { style: { padding: '13px 12px', fontSize: 15 } };

  const dropdownSx = {
    borderRadius: 1,
    backgroundColor: '#fff',
    height: 'auto',
    minHeight: 48,
    '& .MuiSelect-select': { padding: '13px 12px !important', minHeight: 'unset !important' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#C1121F', borderWidth: 1 },
    '& .MuiInputBase-input': { padding: '13px 12px', fontSize: 15 },
  } as const;

  const autocompleteSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: '#fff',
      height: 'auto',
      minHeight: 48,
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#C1121F',
      borderWidth: 1,
    },
    '& .MuiInputBase-input': { padding: '13px 12px', fontSize: 15 },
  } as const;

  const formik = useFormik<AddressFormFields>({
    initialValues: {
      name: '',
      contactName: '',
      contactSurname: '',
      phoneNumber: '',
      taxNumber: '',
      lines: '',
      district: '',
      neighborhood: '',
      city: '',
      countryCode: 'TR',
      email: '',
      ...initialValues,
    },
    enableReinitialize: true,
    validate,
    onSubmit: (values) => {
      const { lines, ...rest } = values;
      const [line1, line2] = tokenize(lines, 30);

      onSubmit({
        ...rest,
        phoneCode: '+90',
        phoneNumber: values.phoneNumber.replace(/^0+/, ''),
        countryCode: rest.countryCode as DestinationCountry,
        line1,
        line2: values.neighborhood || line2,
        line3: '',
        postcode: '',
        state: '',
      });
    },
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch('/geo/tr/iller.json').then((r) => r.json()),
      fetch('/geo/tr/ilceler.json').then((r) => r.json()),
    ])
      .then(([cityData, districtData]) => {
        if (!mounted) return;
        setCities(cityData || []);
        setDistricts(districtData || []);
      })
      .catch(() => {
        if (!mounted) return;
        setCities([]);
        setDistricts([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!formik.values.city) {
      setNeighborhoods([]);
      return;
    }
    const city = cities.find((c) => c.name === formik.values.city);
    if (!city) return;

    const district = districts.find(
      (d) => d.il_id === city.id && d.name === formik.values.district
    );
    if (!district) {
      setNeighborhoods([]);
      return;
    }

    formik.setFieldValue('neighborhood', '');
    fetch(`/geo/tr/mahalleler/${city.id}_${district.id}.json`)
      .then((r) => r.json())
      .then((data) => setNeighborhoods(data || []))
      .catch(() => setNeighborhoods([]));
  }, [formik.values.city, formik.values.district, cities, districts]);

  useEffect(() => {
    if (isMounted.current) formik.handleSubmit();
    else isMounted.current = true;
  }, [submitTrigger]);

  return (
    <Stack gap={2} sx={{ '& .MuiFormLabel-root, & .MuiTypography-infoLabel': { fontSize: { xs: 14, sm: 13 } } }}>
      <form onSubmit={formik.handleSubmit}>
        <Stack gap={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
            <FormikTextField
              fieldKey="contactName"
              label="Ad"
              formik={formik}
              required
              disabled={disabledFields.contactName}
              placeholder="Adınızı Giriniz"
              props={{ sx: fieldSx, inputProps }}
            />
            <FormikTextField
              fieldKey="contactSurname"
              label="Soyad"
              formik={formik}
              required
              disabled={disabledFields.contactSurname}
              placeholder="Soyadınızı Giriniz"
              props={{ sx: fieldSx, inputProps }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'flex-end' }}>
            <Stack width="100%">
              <PhoneNumberInput formik={formik} label="Telefon" fullWidth size="small" />
            </Stack>

            <FormikDropdown
              formik={formik}
              fieldKey="city"
              label="İl"
              options={cities.map((c) => ({ label: c.name, value: c.name }))}
              required
              selectSx={dropdownSx}
              size="small"
              onChange={() => {
                formik.setFieldValue('district', '');
                formik.setFieldValue('neighborhood', '');
                setNeighborhoods([]);
              }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
            <FormikDropdown
              formik={formik}
              fieldKey="district"
              label="İlçe"
              options={districts
                .filter((d) => d.il_id === cities.find((c) => c.name === formik.values.city)?.id)
                .map((d) => ({ label: d.name, value: d.name }))}
              required
              selectSx={dropdownSx}
              size="small"
            />
            <FormikAutocomplete
              formik={formik}
              fieldKey="neighborhood"
              label="Mahalle"
              options={neighborhoods.map((n) => ({ label: n.name, value: n.name }))}
              required
              textFieldSx={autocompleteSx}
              size="small"
            />
          </Stack>

          <Stack gap={0.5}>
            <Typography variant="subtitle2" fontWeight={700}>
              Adres <Asterisk color="error" size={8} />
            </Typography>
            <Typography variant="body2" color="text.secondary" fontSize={12}>
              Kargonuzun size sorunsuz bir şekilde ulaşabilmesi için mahalle, cadde, sokak,
              bina gibi detay bilgileri eksiksiz girdiğinizden emin olun.
            </Typography>
            <FormikTextField
              fieldKey="lines"
              formik={formik}
              required
              limit={90}
              placeholder="Cadde, mahalle sokak ve diğer bilgileri giriniz."
              props={{ multiline: true, minRows: 3, sx: fieldSx }}
            />
          </Stack>

          <FormikTextField
            fieldKey="name"
            label="Adres Başlığı"
            formik={formik}
            required
            disabled={disabledFields.name}
            placeholder="Adres Başlığı Giriniz"
            props={{ sx: fieldSx, inputProps }}
          />


          {/*
          <FormikTextField
            fieldKey="taxNumber"
            label="Vergi Numarası (opsiyonel)"
            formik={formik}
            disabled={disabledFields.taxNumber}
          />
          */}
        </Stack>
      </form>
    </Stack>
  );
};

export default AddressForm;
