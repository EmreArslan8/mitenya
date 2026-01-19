import { AddressData } from '@/lib/api/types';
import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type AddressRow = {
  id: string;
  provider_id: string;
  name: string;
  contact_name: string;
  contact_surname: string;
  phone_code: string;
  phone_number: string;
  city: string;
  district: string;
  postcode: string;
  line1: string;
  country_code: string;
  created_at?: string;
};

const rowToAddressData = (row: AddressRow): AddressData => ({
  id: row.id as unknown as number,
  name: row.name,
  contactName: row.contact_name,
  contactSurname: row.contact_surname,
  phoneCode: row.phone_code,
  phoneNumber: row.phone_number,
  city: row.city,
  district: row.district || '',
  postcode: row.postcode || '',
  line1: row.line1,
  line2: '',
  line3: '',
  state: '',
  countryCode: row.country_code as AddressData['countryCode'],
});

export const GET = async () => {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json([], { status: 200 });
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }

    return NextResponse.json((data || []).map(rowToAddressData));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
