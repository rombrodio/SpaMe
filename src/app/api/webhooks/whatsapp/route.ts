import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppAdapter } from '@/lib/adapters/whatsapp';
import { processMessage } from '@/lib/ai/orchestrator';

// WhatsApp webhook verification (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const adapter = getWhatsAppAdapter();

  if (mode === 'subscribe' && token && adapter.verifyWebhook(token)) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// WhatsApp incoming message (POST)
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Extract message from WhatsApp webhook payload
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const messages = changes?.value?.messages;

  if (!messages || messages.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const adapter = getWhatsAppAdapter();

  for (const message of messages) {
    if (message.type !== 'text') continue;

    const from = message.from; // Phone number
    const text = message.text?.body;

    if (!text) continue;

    // Process through AI orchestrator
    const result = await processMessage('whatsapp', from, text);

    // Send reply via WhatsApp
    await adapter.sendMessage(from, result.reply);
  }

  return NextResponse.json({ ok: true });
}
