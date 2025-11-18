import type { NextApiRequest, NextApiResponse } from "next";

const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === "production";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ message?: string; ok?: boolean; error?: unknown }>
) => {
  if (!isProduction) {
    res
      .status(412)
      .json({ message: "Rejected: Not in production environment." });
    return;
  }

  const { type, event, c: _customerData, details } = req.query;

  let customerData = "guest";
  if (_customerData) {
    const reqCustomerData = JSON.parse(_customerData as string);
    customerData =
      reqCustomerData.fullName +
      " " +
      reqCustomerData.phoneCode +
      reqCustomerData.phoneNumber +
      " " +
      reqCustomerData.email;
  }

  try {
    const response = await fetch(
      `https://maker.ifttt.com/trigger/${type}/json/with/key/blQ7IOIguoq6qAGEF_cr0g`,
      {
        method: "POST",
        body: JSON.stringify({ event, customerData, details }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
    if (!response) throw new Error("Internal Server Error");
    res.status(200).json({ ok: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

export default handler;
