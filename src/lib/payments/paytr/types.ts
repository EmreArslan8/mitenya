export type PaytrCallbackPayload = {
  merchantOid: string;
  status: string;
  totalAmount: string;
  failedReasonCode: string;
  failedReasonMsg: string;
  paymentType: string;
  currency: string;
  rawPayload: Record<string, string>;
};

export type ProcessPaytrCallbackInput = {
  payload: PaytrCallbackPayload;
  callerIp: string;
  userAgent: string;
};
