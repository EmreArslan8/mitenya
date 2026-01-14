import { createSupabaseBrowser } from '../supabase/browser';
import { AddressData } from './types';

export const EMPTY_TAX_NUMBER = '111111';
export const EMPTY_EMAIL = '';

// Database row type
interface AddressRow {
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
}

// Convert database row to AddressData
const rowToAddressData = (row: AddressRow): AddressData => ({
  id: row.id as unknown as number, // Keep as string internally but type expects number
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

// Convert AddressData to database row format
const addressDataToRow = (data: AddressData, providerId: string): Omit<AddressRow, 'id' | 'created_at'> => ({
  provider_id: providerId,
  name: data.name,
  contact_name: data.contactName,
  contact_surname: data.contactSurname,
  phone_code: data.phoneCode,
  phone_number: data.phoneNumber,
  city: data.city,
  district: data.district || '',
  postcode: data.postcode || '',
  line1: data.line1,
  country_code: data.countryCode || 'TR',
});

const useAddress = () => {
  const supabase = createSupabaseBrowser();

  /** Get current user's provider ID */
  const getProviderId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  };

  /** Fetch Address List */
  const fetchAddresses = async (): Promise<AddressData[]> => {
    try {
      const providerId = await getProviderId();
      if (!providerId) {
        console.log('No user logged in');
        return [];
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch addresses error:', error);
        return [];
      }

      return (data || []).map(rowToAddressData);
    } catch (error) {
      console.error('Fetch addresses error:', error);
      return [];
    }
  };

  /** Add address */
  const addAddress = async (data: AddressData): Promise<string | undefined> => {
    try {
      const providerId = await getProviderId();
      if (!providerId) {
        console.error('No user logged in');
        return undefined;
      }

      const row = addressDataToRow(data, providerId);

      const { data: inserted, error } = await supabase
        .from('addresses')
        .insert(row)
        .select('id')
        .single();

      if (error) {
        console.error('Add address error:', error);
        return undefined;
      }

      return inserted?.id;
    } catch (error) {
      console.error('Add address error:', error);
      return undefined;
    }
  };

  /** Edit address */
  const editAddress = async (
    data: { entryId: string } & AddressData
  ): Promise<boolean> => {
    try {
      const providerId = await getProviderId();
      if (!providerId) {
        console.error('No user logged in');
        return false;
      }

      const row = addressDataToRow(data, providerId);

      const { error } = await supabase
        .from('addresses')
        .update(row)
        .eq('id', data.entryId)
        .eq('provider_id', providerId); // Security: only update own addresses

      if (error) {
        console.error('Edit address error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Edit address error:', error);
      return false;
    }
  };

  /** Delete address */
  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const providerId = await getProviderId();
      if (!providerId) {
        console.error('No user logged in');
        return false;
      }

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('provider_id', providerId); // Security: only delete own addresses

      if (error) {
        console.error('Delete address error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete address error:', error);
      return false;
    }
  };

  return {
    fetchAddresses,
    addAddress,
    editAddress,
    deleteAddress,
  };
};

export default useAddress;
