export interface CreatePaymentLinkParams {
  bookingId: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePaymentLinkResult {
  paymentUrl: string;
  providerPaymentId: string;
}

export interface VerifyWebhookParams {
  body: string;
  signature: string;
}

export interface WebhookPayload {
  providerPaymentId: string;
  status: 'completed' | 'failed';
  amount: number;
  currency: string;
}

export interface PaymentAdapter {
  name: string;
  createPaymentLink(params: CreatePaymentLinkParams): Promise<CreatePaymentLinkResult>;
  verifyWebhook(params: VerifyWebhookParams): Promise<WebhookPayload | null>;
}
