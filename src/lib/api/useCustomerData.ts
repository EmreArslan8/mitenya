import useAxios from "../hooks/useAxios";
import { mapSupabaseCustomer } from "../utils/customerMapper";
import { CreateCustomerRequestData, CustomerData, CustomerDB } from "./types";

const useCustomerData = () => {
  const axios = useAxios();

  // ---------------------- GET CUSTOMER ----------------------
  const getCustomerData = async (): Promise<CustomerData | undefined> => {
    console.log("🟦 [API] Calling GET /customers/v1/me");

    try {
      // Axios interceptor [data, error] tuple döndürüyor
      const [data, error] = await axios.get("/customers/v1/me");
      console.log("🟩 [API] GET RESPONSE:", data);

      if (error) {
        console.log("🟥 [API] GET ERROR:", error);
        return undefined;
      }

      const raw = data?.customer as CustomerDB | undefined;
      if (!raw) return undefined;

      return mapSupabaseCustomer(raw);
    } catch (error) {
      console.log("🟥 [API] GET ERROR:", error);
      return undefined;
    }
  };

  // ---------------------- CREATE OR UPDATE CUSTOMER ----------------------
  const createCustomer = async (reqData: CreateCustomerRequestData) => {
    console.log("🟦 [API] Calling POST /customers/v1/me with:", reqData);

    const payload = {
      name: reqData.name,
      surname: reqData.surname,
      email: reqData.email,
      culture: reqData.culture,
      phoneNumber: reqData.phoneNumber ?? null,
      phoneCode: reqData.phoneCode ?? null,
    };

    console.log("🟧 [API] Sending Payload:", payload);

    try {
      // Axios interceptor [data, error] tuple döndürüyor
      const [data, error] = await axios.post("/customers/v1/me", payload);

      if (error) {
        console.log("🟥 [API] POST ERROR:", error);
        return undefined;
      }

      const raw = data?.customer as CustomerDB | undefined;
      console.log("🟩 [API] POST RESPONSE:", raw);

      return raw ? mapSupabaseCustomer(raw) : undefined;
    } catch (err) {
      console.log("🟥 [API] POST ERROR:", err);
      return undefined;
    }
  };
  
  

  return { getCustomerData, createCustomer };
};

export default useCustomerData;
