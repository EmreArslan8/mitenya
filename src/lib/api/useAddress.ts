import useAxios from '../hooks/useAxios';
import { AddressData } from './types';

export const EMPTY_TAX_NUMBER = '111111';
export const EMPTY_EMAIL = '';

/**
 * Backend responses are assumed to be arrays based on your current implementation
 */
type BackendArrayResponse<T> = [T] | [T, unknown] | [];

/** Safe helper: extract first element from array response */
const extractFirst = <T,>(res: unknown): T | undefined => {
  const arr = res as BackendArrayResponse<T>;
  return Array.isArray(arr) ? (arr[0] as T) : undefined;
};

const useAddress = () => {
  const axios = useAxios();

  /** Fetch Address List */
  const fetchAddresses = async (): Promise<AddressData[]> => {
    try {
      const response = await axios.get(`/customers/v1/me/addressbook/entries`);

      const list = extractFirst<AddressData[]>(response.data);

      if (!list) return [];

      return list.map((e) => ({
        ...e,
        email: e.email === EMPTY_EMAIL ? undefined : e.email,
        taxNumber: e.taxNumber === EMPTY_TAX_NUMBER ? undefined : e.taxNumber,
      }));
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  /** Add address */
  const addAddress = async (data: AddressData): Promise<number | undefined> => {
    try {
      const response = await axios.post(`/customers/v1/me/addressbook/entries`, {
        ...data,
        email: data.email || EMPTY_EMAIL,
        taxNumber: data.taxNumber || EMPTY_TAX_NUMBER,
      });

      return extractFirst<number>(response.data);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  /** Edit address */
  const editAddress = async (
    data: { entryId: string } & AddressData
  ): Promise<boolean> => {
    try {
      const response = await axios.put(
        `/customers/v1/me/addressbook/entries/${data.entryId}`,
        {
          ...data,
          email: data.email || EMPTY_EMAIL,
          taxNumber: data.taxNumber || EMPTY_TAX_NUMBER,
        }
      );

      // If second element exists → it's an error
      const arr = response.data as BackendArrayResponse<unknown>;
      return !(arr.length > 1);
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  /** Delete address */
  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.delete(
        `/customers/v1/me/addressbook/entries/${id}`
      );

      const arr = response.data as BackendArrayResponse<unknown>;
      return !(arr.length > 1);
    } catch (error) {
      console.log(error);
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
