'use server';

export async function createPaymentForBooking(bookingId: string) {
  try {
    const { createPaymentForBooking: _create } = await import('@/lib/services/payment');
    return await _create(bookingId);
  } catch {
    // Demo mode — return mock payment URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return { paymentUrl: `${baseUrl}/book/confirmation?booking_id=${bookingId}` };
  }
}
