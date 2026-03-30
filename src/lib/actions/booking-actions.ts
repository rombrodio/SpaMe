'use server';

import { createBooking, updateBookingStatus, getBookingsForRange, getBooking, cancelBooking } from '@/lib/services/booking';
import { findAvailableSlots } from '@/lib/services/availability';
import { revalidatePath } from 'next/cache';
import type { BookingStatus } from '@/lib/types';

export { getBookingsForRange, getBooking };

export async function findSlots(serviceId: string, date: string, therapistId?: string, roomId?: string) {
  return findAvailableSlots({ serviceId, date, therapistId, roomId });
}

export async function createBookingAction(data: {
  customer_id: string;
  therapist_id: string;
  room_id: string;
  service_id: string;
  start_time: string;
  notes?: string;
}) {
  const result = await createBooking(data);
  if (result.booking) {
    revalidatePath('/calendar');
    revalidatePath('/bookings');
  }
  return result;
}

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus) {
  const result = await updateBookingStatus(bookingId, status);
  if (!result.error) {
    revalidatePath('/calendar');
    revalidatePath('/bookings');
  }
  return result;
}

export async function cancelBookingAction(bookingId: string) {
  const result = await cancelBooking(bookingId);
  if (!result.error) {
    revalidatePath('/calendar');
    revalidatePath('/bookings');
  }
  return result;
}
