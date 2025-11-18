import useAxios from '../hooks/useAxios';
import { CreateCustomerRequestData, CustomerData } from './types';

const useCustomerData = () => {
  const axios = useAxios();

  const getCustomerData = async (): Promise<CustomerData | undefined> => {
    try {
      const url = '/customers/v1/me';
      const response = await axios.get(url);

      const data = response.data as CustomerData | CustomerData[] | undefined;

      if (Array.isArray(data)) return data[0];
      return data;
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
      const response = await axios.post(url, {
        ...data,
        warehouseId: '2a6e9f83-06f9-4758-ae0a-43d01fb4a60b',
      });

      const result = response.data as CustomerData | CustomerData[] | undefined;

      if (Array.isArray(result)) return result[0];
      return result;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  return { getCustomerData, createCustomer };
};

export default useCustomerData;
