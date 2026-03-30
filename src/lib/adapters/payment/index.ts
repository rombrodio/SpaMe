import type { PaymentAdapter } from './types';
import { MockPaymentAdapter } from './mock';

let _adapter: PaymentAdapter | null = null;

export function getPaymentAdapter(): PaymentAdapter {
  if (_adapter) return _adapter;

  const provider = process.env.PAYMENT_PROVIDER || 'mock';

  switch (provider) {
    // Add real providers here:
    // case 'tranzila':
    //   _adapter = new TranzilaAdapter();
    //   break;
    case 'mock':
    default:
      _adapter = new MockPaymentAdapter();
      break;
  }

  return _adapter;
}

export type { PaymentAdapter, CreatePaymentLinkParams, CreatePaymentLinkResult, WebhookPayload } from './types';
