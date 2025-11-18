import useAxios from '../hooks/useAxios';
import { CreateCustomerRequestData, CustomerData } from './types';

const useCustomerData = () => {
  const axios = useAxios();

  const getCustomerData = async (): Promise<CustomerData | undefined> => {
    try {
      const url = '/customers/v1/me';
      const results = await axios.get(url);
      return (results as any)[0];
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  const createCustomer = async (
    data: CreateCustomerRequestData
  ): Promise<CustomerData | undefined> => {
    try {
      const url = '/customers/v1/me/';
      const results = await axios.post(url, {
        ...data,
        warehouseId: '2a6e9f83-06f9-4758-ae0a-43d01fb4a60b',
      });
      return (results as any)[0];
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  return { getCustomerData, createCustomer };
};

export default useCustomerData;
