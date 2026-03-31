'use server';

import { revalidatePath } from 'next/cache';
import { demoBookings, getDemoSlots } from '@/lib/demo-data';
import type { Booking, BookingStatus } from '@/lib/types';

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const client = await createClient();
    await client.from('bookings').select('id').limit(1);
    return client;
  } catch {
    return null;
  }
}

export async function getBookingsForRange(start: string, end: string): Promise<Booking[]> {
  const supabase = await getSupabase();
  if (!supabase) return demoBookings;

  const { data, error } = await supabase
    .from('bookings')
    .select('*, customer:customers(*), therapist:therapists(*), room:rooms(*), service:services(*)')
    .gte('start_time', start)
    .lt('start_time', end)
    .not('status', 'eq', 'cancelled')
    .order('start_time');

  if (error) return demoBookings;
  return data as Booking[];
}

export async function getBooking(id: string) {
  const supabase = await getSupabase();
  if (!supabase) return demoBookings.find((b) => b.id === id) ?? demoBookings[0];

  const { data, error } = await supabase
    .from('bookings')
    .select('*, customer:customers(*), therapist:therapists(*), room:rooms(*), service:services(*)')
    .eq('id', id)
    .single();
  if (error) return demoBookings[0];
  return data as Booking;
}

export async function findSlots(serviceId: string, date: string, therapistId?: string, roomId?: string) {
  const supabase = await getSupabase();
  if (!supabase) return getDemoSlots(date);

  const { findAvailableSlots } = await import('@/lib/services/availability');
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
  const supabase = await getSupabase();
  if (!supabase) {
    return { booking: { id: 'demo-booking-new', ...data, end_time: data.start_time, status: 'pending_payment' as const } };
  }

  const { createBooking } = await import('@/lib/services/booking');
  const result = await createBooking(data);
  if (result.booking) {
    revalidatePath('/calendar');
    revalidatePath('/bookings');
  }
  return result;
}

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus) {
  const supabase = await getSupabase();
  if (!supabase) return {};

  const { updateBookingStatus } = await import('@/lib/services/booking');
  const result = await updateBookingStatus(bookingId, status);
  if (!result.error) {
    revalidatePath('/calendar');
    revalidatePath('/bookings');
  }
  return result;
}

export async function cancelBookingAction(bookingId: string) {
  const supabase = await getSupabase();
  if (!supabase) return {};

  const { cancelBooking } = await import('@/lib/services/booking');
  const result = await cancelBooking(bookingId);
  if (!result.error) {
    revalidatePath('/calendar');
    revalidatePath('/bookings');
  }
  return result;
}
