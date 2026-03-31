import type { PaymentAdapter, CreatePaymentLinkParams, CreatePaymentLinkResult, VerifyWebhookParams, WebhookPayload } from './types';
import crypto from 'crypto';

/**
 * Mock payment adapter for local development.
 * Generates a fake payment URL that resolves to the app's own mock confirmation page.
 */
export class MockPaymentAdapter implements PaymentAdapter {
  name = 'mock';

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<CreatePaymentLinkResult> {
    const providerPaymentId = `mock_${crypto.randomUUID()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentUrl = `${baseUrl}/api/webhooks/payment/mock-pay?payment_id=${providerPaymentId}&booking_id=${params.bookingId}&amount=${params.amount}&success_url=${encodeURIComponent(params.successUrl)}`;

    return { paymentUrl, providerPaymentId };
  }

  async verifyWebhook(params: VerifyWebhookParams): Promise<WebhookPayload | null> {
    // Mock adapter trusts all incoming webhooks
    try {
      const data = JSON.parse(params.body);
      return {
        providerPaymentId: data.provider_payment_id,
        status: data.status || 'completed',
        amount: data.amount,
        currency: data.currency || 'ILS',
      };
    } catch {
      return null;
    }
  }
}
