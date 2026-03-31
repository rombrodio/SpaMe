'use server';

import { createPaymentForBooking as _createPayment } from '@/lib/services/payment';

export async function createPaymentForBooking(bookingId: string) {
  return _createPayment(bookingId);
}
