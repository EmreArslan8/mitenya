export interface EdgeCreateOrderResponse {
  order?: {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
  };
  success_token?: string;
  error?: string;
  details?: {
    code?: string;
    [key: string]: unknown;
  };
}

export async function createOrderViaEdge(
  payload: Record<string, unknown>,
  accessToken: string,
  internalSecret?: string
) {
  const edgeHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };

  if (accessToken) {
    edgeHeaders.Authorization = `Bearer ${accessToken}`;
  }

  if (internalSecret) {
    edgeHeaders['x-edge-internal-secret'] = internalSecret;
  }

  const callCreateOrderEdge = async (data: Record<string, unknown>) => {
    const edgeResponse = await fetch(
      'https://iimmsbvyxizrdfresfcb.functions.supabase.co/create-order',
      {
        method: 'POST',
        headers: edgeHeaders,
        body: JSON.stringify(data),
      }
    );

    const edgeText = await edgeResponse.text();
    let edgeData: EdgeCreateOrderResponse = {};
    try {
      edgeData = edgeText ? (JSON.parse(edgeText) as EdgeCreateOrderResponse) : {};
    } catch {
      edgeData = {};
    }

    return { edgeResponse, edgeData, edgeText };
  };

  let { edgeResponse, edgeData, edgeText } = await callCreateOrderEdge(payload);

  if (!edgeResponse.ok && edgeData?.details?.code === '42804') {
    const fallbackPayload = { ...payload };
    delete fallbackPayload.status;
    ({ edgeResponse, edgeData, edgeText } = await callCreateOrderEdge(fallbackPayload));
  }

  return { edgeResponse, edgeData, edgeText };
}
