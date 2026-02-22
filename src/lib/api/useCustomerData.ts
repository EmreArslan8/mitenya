import useAxios from "../hooks/useAxios";
import { mapSupabaseCustomer } from "../utils/customerMapper";
import { CreateCustomerRequestData, CustomerData, CustomerDB } from "./types";

const useCustomerData = () => {
  const axios = useAxios();

  // ---------------------- GET CUSTOMER ----------------------
  const getCustomerData = async (): Promise<CustomerData | undefined> => {
    try {
      // Axios interceptor [data, error] tuple döndürüyor
      const [data, error] = await axios.get("/customers/v1/me");

      if (error) {
        return undefined;
      }

      const raw = data?.customer as CustomerDB | undefined;
      if (!raw) return undefined;

      return mapSupabaseCustomer(raw);
    } catch (_error) {
      return undefined;
    }
  };

  // ---------------------- CREATE OR UPDATE CUSTOMER ----------------------
  const createCustomer = async (reqData: CreateCustomerRequestData) => {
    const payload = {
      name: reqData.name,
      surname: reqData.surname,
      email: reqData.email,
      culture: reqData.culture,
      phoneNumber: reqData.phoneNumber ?? null,
      phoneCode: reqData.phoneCode ?? null,
    };

    try {
      // Axios interceptor [data, error] tuple döndürüyor
      const [data, error] = await axios.post("/customers/v1/me", payload);

      if (error) {
        return undefined;
      }

      const raw = data?.customer as CustomerDB | undefined;
      return raw ? mapSupabaseCustomer(raw) : undefined;
    } catch (_err) {
      return undefined;
    }
  };
  
  

  return { getCustomerData, createCustomer };
};

export default useCustomerData;
