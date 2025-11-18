"use client";

import Icon from "@/components/Icon";
import FormikDropdown from "@/components/common/inputs/FormikDropdown";
import PhoneNumberInput from "@/components/common/inputs/FormikPhoneNumberInput";
import FormikTextField from "@/components/common/inputs/FormikTextField";
import { AddressData } from "@/lib/api/types";
import tokenize from "@/lib/utils/tokenize";
import { Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useRef } from "react";
import styles from "./styles";
import { destinationCountries, DestinationCountry } from "@/lib/utils/countries";

type AddressFormFields = {
  name: string;
  contactName: string;
  contactSurname?: string;
  phoneCode: string;
  phoneNumber: string;
  taxNumber: string;
  lines: string;
  district: string;
  city: string;
  postcode: string;
  state?: string | null;
  countryCode: DestinationCountry | null;
  email: string;
};

interface AddressFormProps {
  onSubmit: (address: AddressData) => void;
  initialValues?: Partial<AddressData>;
  disabledFields?: { [key in keyof Partial<AddressData>]: boolean };
  onValidationChange?: (isValid: boolean, errors?: string[]) => void;
  submitTrigger?: unknown;
}

const AddressForm = ({
  onSubmit,
  initialValues,
  disabledFields = {},
  onValidationChange,
  submitTrigger,
}: AddressFormProps) => {
  const isMounted = useRef(false);

  const validate = useCallback((values: AddressFormFields) => {
    const errors: Partial<Record<keyof AddressFormFields, string>> = {};
  
    if (!values.name) errors.name = " ";
    if (!values.contactName) errors.contactName = " ";
    if (!values.contactSurname) errors.contactSurname = " ";
    if (!values.phoneNumber) errors.phoneNumber = " ";
    if (!values.phoneCode) errors.phoneCode = " ";
    if (!values.city) errors.city = " ";
    if (!values.district) errors.district = " ";
    if (!values.countryCode) errors.countryCode = " ";
    if (!values.postcode) errors.postcode = " ";
    if (values.lines?.length > 90) errors.lines = " ";
  
    return errors;
  }, []);
  

  const formik = useFormik<AddressFormFields>({
    initialValues: {
      name: "",
      contactName: "",
      contactSurname: "",
      phoneNumber: "",
      phoneCode: "",
      taxNumber: "",
      lines:
        (initialValues?.line1 ?? "") +
        (initialValues?.line2 ?? "") +
        (initialValues?.line3 ?? ""),
      district: "",
      city: "",
      state: null,
      countryCode: null,
      email: "",
      postcode: "",
      ...initialValues,
    },
    enableReinitialize: true,
    validate,
    onSubmit: (values) => {
      const [line1, line2, line3] = tokenize(values.lines ?? "", 30);
    
      onSubmit({
        ...values,
        line1,
        line2,
        line3,
      } as AddressData);
    },    
  });

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isMounted.current) {
      if (formik.values.name) {
        formik.handleSubmit();
      }
    } else {
      isMounted.current = true;
    }
  }, [submitTrigger, formik.values.name]);
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!onValidationChange) return;
    const errors = validate(formik.values);
    onValidationChange(
      Object.values(errors).every((e) => !e),
      Object.keys(errors)
    );
  }, [formik.values, validate]);
  

  return (
    <Stack gap={1.5}>
      <form onSubmit={formik.handleSubmit} style={styles.form as React.CSSProperties}>
        <FormikTextField
          fieldKey="name"
          disabled={disabledFields.name}
          label="address.name"
          formik={formik}
          width="calc(50% - 8px)"
          required
        />
        <Stack direction="row" gap={2}>
          <FormikTextField
            fieldKey="contactName"
            disabled={disabledFields.contactName}
            label="address.contactName"
            formik={formik}
            required
          />

          <FormikTextField
            fieldKey="contactSurname"
            disabled={disabledFields.contactSurname}
            label="address.contactSurname"
            formik={formik}
            required
          />
        </Stack>

        <Stack gap={0.5} width="100%">
          <Typography variant="infoLabel">
            address.phoneNumber
            <Icon name="asterisk" color="error" fontSize={8} />
          </Typography>

          <PhoneNumberInput
            disabled={disabledFields.phoneCode || disabledFields.phoneNumber}
            fullWidth
            formik={formik}
          />
        </Stack>

        <FormikTextField
          fieldKey="email"
          disabled={disabledFields.email}
          label="address.email"
          formik={formik}
        />

        <FormikTextField
          fieldKey="lines"
          disabled={disabledFields.line1}
          label="address.lines"
          formik={formik}
          required
          limit={90}
          props={{ multiline: true, maxRows: 3 }}
        />

        <Stack direction="row" gap={2}>
          <FormikTextField
            fieldKey="city"
            disabled={disabledFields.city}
            label="address.city"
            formik={formik}
            required
          />

          <FormikTextField
            fieldKey="district"
            disabled={disabledFields.district}
            label="address.district"
            formik={formik}
            required
          />
        </Stack>

        <Stack direction="row" gap={2}>
          <FormikTextField
            fieldKey="state"
            disabled={disabledFields.state}
            label="address.stateOptional"
            formik={formik}
          />

          <FormikTextField
            fieldKey="postcode"
            disabled={disabledFields.postcode}
            label="address.postcode"
            formik={formik}
            required
          />
        </Stack>
      </form>
    </Stack>
  );
};

export default AddressForm;
