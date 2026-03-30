import { createClient } from '@/lib/supabase/server';
import { bookingCreateSchema, type BookingCreateData } from '@/lib/schemas/booking';
import type { Booking, BookingStatus } from '@/lib/types';

interface CreateBookingResult {
  booking?: Booking;
  error?: string;
}

/**
 * Creates a booking after validating all constraints:
 * 1. Service exists
 * 2. Therapist is qualified for the service
 * 3. Room is compatible with the service
 * 4. No overlapping therapist booking
 * 5. No overlapping room booking
 */
export async function createBooking(data: BookingCreateData): Promise<CreateBookingResult> {
  const parsed = bookingCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid booking data' };
  }

  const supabase = await createClient();
  const { customer_id, therapist_id, room_id, service_id, start_time, notes } = parsed.data;

  // 1. Load service to compute end_time
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', service_id)
    .single();

  if (!service) return { error: 'Service not found' };

  const startDate = new Date(start_time);
  const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000);
  const end_time = endDate.toISOString();

  // 2. Verify therapist is qualified
  const { data: qualCheck } = await supabase
    .from('therapist_services')
    .select('id')
    .eq('therapist_id', therapist_id)
    .eq('service_id', service_id)
    .single();

  if (!qualCheck) return { error: 'Therapist is not qualified for this service' };

  // 3. Verify room is compatible
  const { data: roomCheck } = await supabase
    .from('room_services')
    .select('id')
    .eq('room_id', room_id)
    .eq('service_id', service_id)
    .single();

  if (!roomCheck) return { error: 'Room is not compatible with this service' };

  // 4. Check therapist overlap (application-level check; DB trigger is safety net)
  const { data: therapistOverlap } = await supabase
    .from('bookings')
    .select('id')
    .eq('therapist_id', therapist_id)
    .not('status', 'in', '("cancelled","no_show")')
    .lt('start_time', end_time)
    .gt('end_time', start_time)
    .limit(1);

  if (therapistOverlap && therapistOverlap.length > 0) {
    return { error: 'Therapist already has a booking at this time' };
  }

  // 5. Check room overlap
  const { data: roomOverlap } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', room_id)
    .not('status', 'in', '("cancelled","no_show")')
    .lt('start_time', end_time)
    .gt('end_time', start_time)
    .limit(1);

  if (roomOverlap && roomOverlap.length > 0) {
    return { error: 'Room already has a booking at this time' };
  }

  // 6. Create booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      customer_id,
      therapist_id,
      room_id,
      service_id,
      start_time,
      end_time,
      status: 'pending_payment',
      notes: notes || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  return { booking };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) return { error: error.message };
  return {};
}

export async function cancelBooking(bookingId: string): Promise<{ error?: string }> {
  return updateBookingStatus(bookingId, 'cancelled');
}

export async function getBookingsForRange(start: string, end: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*),
      therapist:therapists(*),
      room:rooms(*),
      service:services(*)
    `)
    .gte('start_time', start)
    .lt('start_time', end)
    .not('status', 'eq', 'cancelled')
    .order('start_time');

  if (error) throw error;
  return data as Booking[];
}

export async function getBooking(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*),
      therapist:therapists(*),
      room:rooms(*),
      service:services(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Booking;
}
