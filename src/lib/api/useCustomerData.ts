import useAxios from "../hooks/useAxios";
import { mapSupabaseCustomer } from "../utils/customerMapper";
import { CreateCustomerRequestData, CustomerData, CustomerDB } from "./types";

const useCustomerData = () => {
  const axios = useAxios();

  // ---------------------- GET CUSTOMER ----------------------
  const getCustomerData = async (): Promise<CustomerData | undefined> => {
    console.log("🟦 [API] Calling GET /customers/v1/me");

    try {
      const response = await axios.get("/customers/v1/me");
      console.log("🟩 [API] GET RESPONSE:", response.data);

      const raw = response.data?.customer as CustomerDB | undefined;
      if (!raw) return undefined;

      return mapSupabaseCustomer(raw);
    } catch (error) {
      console.log("🟥 [API] GET ERROR:", error);
      return undefined;
    }
  };

  // ---------------------- CREATE OR UPDATE CUSTOMER ----------------------
  const createCustomer = async (data: CreateCustomerRequestData) => {
    console.log("🟦 [API] Calling POST /customers/v1/me with:", data);
  
    const payload = {
      name: data.name,
      surname: data.surname,
      email: data.email,
      culture: data.culture,
      phoneNumber: data.phoneNumber ?? null,
      phoneCode: data.phoneCode ?? null,
    };
  
    console.log("🟧 [API] Sending Payload:", payload);
  
    try {
      const response = await axios.post("/customers/v1/me", {
        name: data.name,
        surname: data.surname,
        email: data.email,
        culture: data.culture,
        phoneNumber: data.phoneNumber,
      });
  
      const raw = response.data?.customer as CustomerDB | undefined;
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
