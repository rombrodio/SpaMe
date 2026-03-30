import type { WhatsAppAdapter } from './types';
import { MockWhatsAppAdapter } from './mock';

let _adapter: WhatsAppAdapter | null = null;

export function getWhatsAppAdapter(): WhatsAppAdapter {
  if (_adapter) return _adapter;

  const hasCredentials = process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (hasCredentials) {
    // In production, use the real WhatsApp Business Cloud API adapter
    // _adapter = new WhatsAppCloudAdapter();
    _adapter = new MockWhatsAppAdapter(); // Fallback for now
  } else {
    _adapter = new MockWhatsAppAdapter();
  }

  return _adapter;
}

export type { WhatsAppAdapter };
