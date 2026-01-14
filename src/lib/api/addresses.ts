import bring from './bring';
import { AddressData } from './types';
import { EMPTY_EMAIL, EMPTY_TAX_NUMBER } from './useAddress';

export const fetchAddresses = async (): Promise<AddressData[] | null> => {
  try {
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
