import { AddressData } from '@/lib/api/types';
import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { z } from 'zod';

type AddressRow = {
  id: string;
  provider_id: string;
  name: string;
  contact_name: string;
  contact_surname: string;
  phone_code: string | null;
  phone_number: string | null;
  city: string;
  district: string | null;
  postcode: string | null;
  line1: string;
  line2: string | null;
  country_code: string;
  email: string | null;
  tax_number: string | null;
  passport_number: string | null;
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
  isDefault: !!row.is_default,
  city: row.city,
  district: row.district || '',
  postcode: row.postcode || '',
  line1: row.line1,
  line2: row.line2 || '',
  line3: '',
  state: '',
  countryCode: row.country_code as AddressData['countryCode'],
});

const addressSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contactName: z.string().trim().min(2).max(100),
  contactSurname: z.string().trim().min(2).max(100),
  phoneCode: z.coerce.string().trim().min(1).max(10),
  phoneNumber: z.coerce.string().trim().min(7).max(20),
  email: z.string().trim().email().optional().or(z.literal('')),
  taxNumber: z.string().trim().max(30).optional().or(z.literal('')),
  passportNumber: z.string().trim().max(30).optional().or(z.literal('')),
  line1: z.string().trim().min(5).max(200),
  line2: z.string().trim().max(200).optional().or(z.literal('')),
  line3: z.string().trim().max(200).optional().or(z.literal('')),
  postcode: z.string().trim().max(20).optional().or(z.literal('')),
  district: z.string().trim().max(100).optional().or(z.literal('')),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().max(100).optional().or(z.literal('')),
  countryCode: z.string().trim().length(2),
  isDefault: z.boolean().optional(),
});

const toRow = (data: AddressData, providerId: string, isDefault?: boolean) => {
  const baseRow: Omit<AddressRow, 'id' | 'created_at' | 'is_default'> = {
    provider_id: providerId,
    name: data.name,
    contact_name: data.contactName,
    contact_surname: data.contactSurname,
    phone_code: data.phoneCode || null,
    phone_number: data.phoneNumber || null,
    email: data.email || null,
    tax_number: data.taxNumber || null,
    passport_number: data.passportNumber || null,
    city: data.city,
    district: data.district || null,
    postcode: data.postcode || null,
    line1: data.line1,
    line2: data.line2 || null,
    country_code: (data.countryCode || 'TR').toUpperCase(),
  };

  if (typeof isDefault === 'boolean') {
    return { ...baseRow, is_default: isDefault };
  }

  return baseRow;
};

export const GET = async (req: NextRequest) => {
  try {
    // Rate limiting
    const userIp = getClientIp(req);
    if (!(await rateLimit(`addresses_get:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

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

export const POST = async (req: NextRequest) => {
  try {
    const userIp = getClientIp(req);
    if (!(await rateLimit(`addresses_post:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: AddressData;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = addressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { count } = await supabase
      .from('addresses')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', user.id);

    const wantsDefault = !!validation.data.isDefault;
    const shouldDefault = wantsDefault || (count ?? 0) === 0;

    if (shouldDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('provider_id', user.id);
    }

    const row = toRow(validation.data as AddressData, user.id, shouldDefault ? true : undefined);

    const { data, error } = await supabase
      .from('addresses')
      .insert(row)
      .select('*')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
    }

    return NextResponse.json(rowToAddressData(data as AddressRow), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const userIp = getClientIp(req);
    if (!(await rateLimit(`addresses_patch:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { id?: string } & AddressData;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body?.id) {
      return NextResponse.json({ error: 'Missing address id' }, { status: 400 });
    }

    const validation = addressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const wantsDefault = !!validation.data.isDefault;
    if (wantsDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('provider_id', user.id);
    }

    const row = toRow(validation.data as AddressData, user.id, wantsDefault ? true : undefined);

    const { data, error } = await supabase
      .from('addresses')
      .update(row)
      .eq('id', body.id)
      .eq('provider_id', user.id)
      .select('*')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
    }

    return NextResponse.json(rowToAddressData(data as AddressRow));
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const userIp = getClientIp(req);
    if (!(await rateLimit(`addresses_delete:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { id?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body?.id) {
      return NextResponse.json({ error: 'Missing address id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', body.id)
      .eq('provider_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
