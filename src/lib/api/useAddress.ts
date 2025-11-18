import useAxios from '../hooks/useAxios';
import { AddressData } from './types';

export const EMPTY_TAX_NUMBER = '111111';
export const EMPTY_EMAIL = '';

const useAddress = () => {
  const axios = useAxios();

  const fetchAddresses = async (): Promise<AddressData[]> => {
    try {
      const response = await axios.get(`/customers/v1/me/addressbook/entries`);
      let addresses = (response as unknown as [AddressData[]])[0] as AddressData[];
      addresses = addresses.map((e) => ({
        ...e,
        email: e.email === EMPTY_EMAIL ? undefined : e.email,
        taxNumber: e.taxNumber === EMPTY_TAX_NUMBER ? undefined : e.taxNumber,
      }));
      return addresses;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const addAddress = async (data: AddressData): Promise<number | undefined> => {
    try {
      const response = await axios.post(`/customers/v1/me/addressbook/entries`, {
        ...data,
        email: data.email || EMPTY_EMAIL,
        taxNumber: data.taxNumber || EMPTY_TAX_NUMBER,
      });
      return (response as unknown as Array<any>)[0];
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  const editAddress = async (data: { entryId: string } & AddressData): Promise<boolean> => {
    try {
      const response = await axios.put(`/customers/v1/me/addressbook/entries/${data.entryId}`, {
        ...data,
        email: data.email || EMPTY_EMAIL,
        taxNumber: data.taxNumber || EMPTY_TAX_NUMBER,
      });
      return Boolean(!(response as unknown as Array<any>)[1]);
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`/customers/v1/me/addressbook/entries/${id}`);
      return Boolean(!(response as unknown as Array<any>)[1]);
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
