import { NextRequest, NextResponse } from 'next/server';
import { processPaymentWebhook } from '@/lib/services/payment';

/**
 * Mock payment page — simulates a hosted payment page for local dev.
 * In production, this route would not exist; the real provider handles it.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('payment_id');
  const bookingId = searchParams.get('booking_id');
  const amount = searchParams.get('amount');
  const successUrl = searchParams.get('success_url') || '/';

  // Auto-confirm the payment (simulate successful payment)
  if (paymentId) {
    await processPaymentWebhook({
      providerPaymentId: paymentId,
      status: 'completed',
      amount: Number(amount || 0),
      currency: 'ILS',
    });
  }

  // Redirect to success page
  return NextResponse.redirect(new URL(successUrl, request.url));
}
