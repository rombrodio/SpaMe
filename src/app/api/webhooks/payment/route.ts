import { NextRequest, NextResponse } from 'next/server';
import { getPaymentAdapter } from '@/lib/adapters/payment';
import { processPaymentWebhook } from '@/lib/services/payment';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-webhook-signature') || '';

  const adapter = getPaymentAdapter();
  const payload = await adapter.verifyWebhook({ body, signature });

  if (!payload) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
  }

  const result = await processPaymentWebhook(payload);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
