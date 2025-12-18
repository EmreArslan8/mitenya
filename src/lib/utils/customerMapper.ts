// utils/customerMapper.ts

import { CustomerDB , CustomerData } from "../api/types";

export const mapCreateCustomerPayload = (body: any) => {
    return {
      full_name: `${body.name ?? ""} ${body.surname ?? ""}`.trim(),
      email: body.email ?? null,
      culture: body.culture ?? "en",
      phone: body.phone ?? null,
      warehouse_id: body.warehouseId ?? null,
    };
  };
  
  export const mapSupabaseCustomer = (raw: CustomerDB): CustomerData => {
    return {
      fullName: raw.full_name,
      email: raw.email,
      culture: raw.culture,
      phone: raw.phone ?? undefined,
    };
  };