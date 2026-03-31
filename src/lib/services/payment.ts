import { createClient } from '@/lib/supabase/server';
import { getPaymentAdapter } from '@/lib/adapters/payment';
import type { WebhookPayload } from '@/lib/adapters/payment';

interface CreatePaymentResult {
  paymentUrl?: string;
  error?: string;
}

export async function createPaymentForBooking(bookingId: string): Promise<CreatePaymentResult> {
  const supabase = await createClient();

  // Load booking with service
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, service:services(*), customer:customers(*)')
    .eq('id', bookingId)
    .single();

  if (!booking) return { error: 'Booking not found' };

  const adapter = getPaymentAdapter();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const result = await adapter.createPaymentLink({
    bookingId,
    amount: booking.service.price,
    currency: 'ILS',
    description: `${booking.service.name} - SpaMe`,
    customerEmail: booking.customer?.email,
    customerPhone: booking.customer?.phone,
    successUrl: `${baseUrl}/book/confirmation?booking_id=${bookingId}`,
    cancelUrl: `${baseUrl}/book/confirmation?booking_id=${bookingId}&cancelled=true`,
  });

  // Store payment record
  const { error } = await supabase.from('payments').insert({
    booking_id: bookingId,
    amount: booking.service.price,
    currency: 'ILS',
    status: 'pending',
    provider: adapter.name,
    provider_payment_id: result.providerPaymentId,
    payment_url: result.paymentUrl,
  });

  if (error) return { error: error.message };

  return { paymentUrl: result.paymentUrl };
}

/**
 * Process webhook from payment provider.
 * This is the source of truth for payment confirmation.
 */
export async function processPaymentWebhook(payload: WebhookPayload): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Find payment by provider ID
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('provider_payment_id', payload.providerPaymentId)
    .single();

  if (!payment) return { error: 'Payment not found' };

  // Update payment status
  const newStatus = payload.status === 'completed' ? 'completed' : 'failed';

  await supabase
    .from('payments')
    .update({
      status: newStatus,
      paid_at: newStatus === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', payment.id);

  // Update booking status based on payment
  if (newStatus === 'completed') {
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', payment.booking_id)
      .eq('status', 'pending_payment'); // Only update if still pending
  }

  return {};
}
