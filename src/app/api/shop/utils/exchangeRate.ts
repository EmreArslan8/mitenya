import { bring } from "@/lib/api/bring";
import "server-only";

const getExchangeRate = async ({ from = "USD", to = "TRY" } = {}): Promise<
  number | undefined
> => {
  const url = "/currencyexchangerates/v1";
  const res = await bring(url, {
    params: { from, to },
    next: { revalidate: 3600 },
  });
  return res[0];
};

export default getExchangeRate;
