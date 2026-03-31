import type { WhatsAppAdapter } from './types';

export class MockWhatsAppAdapter implements WhatsAppAdapter {
  async sendMessage(to: string, text: string): Promise<void> {
    console.log(`[MockWhatsApp] Sending to ${to}: ${text}`);
  }

  verifyWebhook(token: string): boolean {
    return token === (process.env.WHATSAPP_VERIFY_TOKEN || 'mock-verify-token');
  }
}
