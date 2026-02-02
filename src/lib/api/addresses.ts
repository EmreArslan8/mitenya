import bring from './bring';
import { AddressData } from './types';
import { EMPTY_EMAIL, EMPTY_TAX_NUMBER } from './useAddress';
import { createSupabaseServer } from '@/lib/supabase/server';

type AddressRow = {
  id: string;
  provider_id: string;
  name: string;
  contact_name: string;
  contact_surname: string;
  phone_code: string | null;
  phone_number: string | null;
  email: string | null;
  tax_number: string | null;
  passport_number: string | null;
  line1: string;
  line2: string | null;
  district: string | null;
  postcode: string | null;
  city: string;
  country_code: string;
  is_default?: boolean | null;
  created_at?: string;
};

const rowToAddressData = (row: AddressRow): AddressData => ({
  id: row.id,
  name: row.name,
  contactName: row.contact_name,
  contactSurname: row.contact_surname,
  phoneCode: row.phone_code || '',
  phoneNumber: row.phone_number || '',
  email: row.email || '',
  taxNumber: row.tax_number || '',
  passportNumber: row.passport_number || '',
  line1: row.line1,
  line2: row.line2 || '',
  line3: '',
  postcode: row.postcode || '',
  district: row.district || '',
  city: row.city,
  state: '',
  countryCode: row.country_code as AddressData['countryCode'],
  isDefault: !!row.is_default,
});

export const fetchAddresses = async (): Promise<AddressData[] | null> => {
  try {
    if (typeof window === 'undefined') {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return null;

      return (data || []).map(rowToAddressData);
    }

    const [res] = await bring('/api/addresses');
    if (!res) return null;
    let addresses = res as AddressData[];
    addresses = addresses.map((e) => ({
      ...e,
      email: e.email === EMPTY_EMAIL ? undefined : e.email,
      taxNumber: e.taxNumber === EMPTY_TAX_NUMBER ? undefined : e.taxNumber,
    }));
    return addresses;
  } catch (error) {
    return [];
  }
};
