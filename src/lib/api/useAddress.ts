import { AddressData } from './types';

export const EMPTY_TAX_NUMBER = '111111';
export const EMPTY_EMAIL = '';

const useAddress = () => {
  /** Fetch Address List */
  const fetchAddresses = async (): Promise<AddressData[]> => {
    try {
      const res = await fetch('/api/addresses');
      if (!res.ok) {
        console.error('Fetch addresses error:', res.statusText);
        return [];
      }
      return (await res.json()) as AddressData[];
    } catch (error) {
      console.error('Fetch addresses error:', error);
      return [];
    }
  };

  const addAddress = async (data: AddressData): Promise<string | undefined> => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        console.error('Add address error:', await res.text());
        return undefined;
      }
      const created = (await res.json()) as AddressData;
      return created?.id?.toString();
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
      const res = await fetch('/api/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: data.entryId }),
      });
      if (!res.ok) {
        console.error('Edit address error:', await res.text());
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
      const res = await fetch('/api/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        console.error('Delete address error:', await res.text());
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
