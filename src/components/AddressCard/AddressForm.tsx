'use client';

import FormikAutocomplete from '@/components/common/inputs/FormikAutoComplete';
import FormikDropdown from '@/components/common/inputs/FormikDropdown';
import PhoneNumberInput from '@/components/common/inputs/FormikPhoneNumberInput';
import FormikTextField from '@/components/common/inputs/FormikTextField';
import { AddressData } from '@/lib/api/types';
import { DestinationCountry } from '@/lib/utils/countries';
import tokenize from '@/lib/utils/tokenize';
import { Typography } from '@/components/ui/Typography';
import { useFormik } from 'formik';
import { Asterisk } from '@/components/icons';
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
    <div className="flex flex-col gap-4 [&_label]:text-sm sm:[&_label]:text-[13px]">
      <form onSubmit={formik.handleSubmit}>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <FormikTextField
              size="large"
              fieldKey="contactName"
              label="Ad"
              formik={formik}
              required
              disabled={disabledFields.contactName}
              placeholder="Adınızı Giriniz"
            />
            <FormikTextField
              size="large"
              fieldKey="contactSurname"
              label="Soyad"
              formik={formik}
              required
              disabled={disabledFields.contactSurname}
              placeholder="Soyadınızı Giriniz"
            />
          </div>

          <div className="grid items-end gap-2 sm:grid-cols-2">
            <div className="w-full">
              <PhoneNumberInput formik={formik} label="Telefon" />
            </div>

            <FormikDropdown
              formik={formik}
              fieldKey="city"
              label="İl"
              options={cities.map((c) => ({ label: c.name, value: c.name }))}
              required
              size="large"
              onChange={() => {
                formik.setFieldValue('district', '');
                formik.setFieldValue('neighborhood', '');
                setNeighborhoods([]);
              }}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <FormikDropdown
              formik={formik}
              fieldKey="district"
              label="İlçe"
              options={districts
                .filter((d) => d.il_id === cities.find((c) => c.name === formik.values.city)?.id)
                .map((d) => ({ label: d.name, value: d.name }))}
              required
              size="large"
            />
            <FormikAutocomplete
              variant="outlined"
              formik={formik}
              fieldKey="neighborhood"
              label="Mahalle"
              options={neighborhoods.map((n) => ({ label: n.name, value: n.name }))}
              required
              size="large"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Typography variant="subtitle2" className="flex items-center font-bold">
              Adres <span className="text-error"><Asterisk size={8} /></span>
            </Typography>
            <Typography variant="caption" className="text-text-secondary">
              Kargonuzun size sorunsuz bir şekilde ulaşabilmesi için mahalle, cadde, sokak,
              bina gibi detay bilgileri eksiksiz girdiğinizden emin olun.
            </Typography>
            <FormikTextField
              size="large"
              fieldKey="lines"
              formik={formik}
              required
              limit={90}
              placeholder="Cadde, mahalle sokak ve diğer bilgileri giriniz."
              multiline
              minRows={3}
            />
          </div>

          <FormikTextField
            fieldKey="name"
            size="large"
            label="Adres Başlığı"
            formik={formik}
            required
            disabled={disabledFields.name}
            placeholder="Adres Başlığı Giriniz"
          />


          {/*
          <FormikTextField
            fieldKey="taxNumber"
            label="Vergi Numarası (opsiyonel)"
            formik={formik}
            disabled={disabledFields.taxNumber}
          />
          */}
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
