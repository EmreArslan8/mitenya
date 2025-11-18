'use client';

import Icon from '@/components/Icon';
import FormikDropdown from '@/components/common/inputs/FormikDropdown';
import PhoneNumberInput from '@/components/common/inputs/FormikPhoneNumberInput';
import FormikTextField from '@/components/common/inputs/FormikTextField';
import { AddressData } from '@/lib/api/types';
import tokenize from '@/lib/utils/tokenize';
import { Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import React, { useEffect, useRef } from 'react';

type AddressFormFields = {
  name: string;
  contactName: string;
  contactSurname: string;
  phoneCode: string;
  phoneNumber: string;
  taxNumber: string;
  lines: string;
  postcode: string;
  district: string;
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

  const validate = (values: AddressFormFields) => {
    const errors: Partial<Record<keyof AddressFormFields, string>> = {};

    if (!values.name) errors.name = 'Required';
    if (!values.contactName) errors.contactName = 'Required';
    if (!values.contactSurname) errors.contactSurname = 'Required';
    if (!values.phoneNumber) errors.phoneNumber = 'Required';
    if (!values.lines || values.lines.length < 10)
      errors.lines = 'Minimum 10 characters required';
    if (!values.city) errors.city = 'Required';
    if (!values.district) errors.district = 'Required';
    if (!values.postcode) errors.postcode = 'Required';

    return errors;
  };

  const formik = useFormik<AddressFormFields>({
    initialValues: {
      name: '',
      contactName: '',
      contactSurname: '',
      phoneCode: '+90',
      phoneNumber: '',
      taxNumber: '',
      lines: '',
      postcode: '',
      district: '',
      city: '',
      countryCode: 'TR',
      email: '',
      ...initialValues,
    },
    enableReinitialize: true,
    validate,
    onSubmit: (values) => {
      const { lines, ...rest } = values;
      const [line1, line2, line3] = tokenize(lines, 30);

      onSubmit({
        ...rest,
        line1,
        line2,
        line3,
      } as AddressData);
    },
  });

  useEffect(() => {
    if (isMounted.current) formik.handleSubmit();
    else isMounted.current = true;
  }, [submitTrigger]);

  return (
    <Stack gap={1.5}>
      <form onSubmit={formik.handleSubmit}>

        {/* Address Title */}
        <FormikTextField
          fieldKey="name"
          label="Address Title"
          formik={formik}
          required
          disabled={disabledFields.name}
        />

        {/* Contact Fields */}
        <Stack direction="row" gap={2}>
          <FormikTextField
            fieldKey="contactName"
            label="First Name"
            formik={formik}
            required
            disabled={disabledFields.contactName}
          />
          <FormikTextField
            fieldKey="contactSurname"
            label="Surname"
            formik={formik}
            required
            disabled={disabledFields.contactSurname}
          />
        </Stack>

        {/* Phone Number */}
        <Stack>
          <Typography variant="infoLabel">
            Phone Number <Icon name="asterisk" color="error" fontSize={8} />
          </Typography>
          <PhoneNumberInput formik={formik} fullWidth />
        </Stack>

        {/* Email */}
        <FormikTextField
          fieldKey="email"
          label="Email"
          formik={formik}
          disabled={disabledFields.email}
        />

        {/* Tax Number */}
        <FormikTextField
          fieldKey="taxNumber"
          label="Tax Number (optional)"
          formik={formik}
          disabled={disabledFields.taxNumber}
        />

        {/* Address Lines */}
        <FormikTextField
          fieldKey="lines"
          label="Address Line"
          formik={formik}
          required
          limit={90}
          props={{ multiline: true, maxRows: 3 }}
        />

        {/* City + District */}
        <Stack direction="row" gap={2}>
          <FormikTextField
            fieldKey="city"
            label="City"
            formik={formik}
            required
          />

          <FormikTextField
            fieldKey="district"
            label="District"
            formik={formik}
            required
          />
        </Stack>

        {/* Country + Postcode */}
        <Stack direction="row" gap={2}>
          <FormikDropdown
            formik={formik}
            fieldKey="countryCode"
            label="Country"
            options={[
              { label: 'Turkey', value: 'TR' },
              { label: 'United States', value: 'US' },
              { label: 'United Kingdom', value: 'UK' },
            ]}
            disabled={disabledFields.countryCode}
            required
          />

          <FormikTextField
            fieldKey="postcode"
            label="Postcode"
            formik={formik}
            required
            disabled={disabledFields.postcode}
          />
        </Stack>
      </form>
    </Stack>
  );
};

export default AddressForm;
