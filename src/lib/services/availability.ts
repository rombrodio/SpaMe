import { createClient } from '@/lib/supabase/server';
import type { AvailableSlot } from '@/lib/types';

interface FindSlotsParams {
  serviceId: string;
  date: string; // YYYY-MM-DD
  therapistId?: string;
  roomId?: string;
}

/**
 * Core availability engine. Finds all valid time slots for a service on a given date.
 *
 * Algorithm:
 * 1. Load service duration
 * 2. Find qualified therapists (via therapist_services)
 * 3. Find compatible rooms (via room_services)
 * 4. For each therapist: get availability rules for that weekday, subtract time-off and existing bookings
 * 5. For each room: subtract room blocks and existing bookings
 * 6. Cross-match therapist free windows × room free windows to produce valid slots
 */
export async function findAvailableSlots(params: FindSlotsParams): Promise<AvailableSlot[]> {
  const supabase = await createClient();
  const { serviceId, date, therapistId, roomId } = params;

  // 1. Load service
  const { data: service } = await supabase
    .from('services')
    .select('id, duration_minutes')
    .eq('id', serviceId)
    .single();

  if (!service) return [];

  const duration = service.duration_minutes;
  const dayStart = `${date}T00:00:00+03:00`;
  const dayEnd = `${date}T23:59:59+03:00`;
  const dateObj = new Date(dayStart);
  const dayOfWeek = dateObj.getDay(); // 0=Sunday

  // 2. Get qualified therapists
  let therapistQuery = supabase
    .from('therapist_services')
    .select('therapist_id, therapist:therapists(id, name, active)')
    .eq('service_id', serviceId);

  if (therapistId) {
    therapistQuery = therapistQuery.eq('therapist_id', therapistId);
  }

  const { data: therapistLinks } = await therapistQuery;
  const qualifiedTherapists = (therapistLinks ?? [])
    .filter((tl) => (tl.therapist as unknown as { active: boolean })?.active)
    .map((tl) => ({
      id: tl.therapist_id,
      name: (tl.therapist as unknown as { name: string }).name,
    }));

  if (qualifiedTherapists.length === 0) return [];

  // 3. Get compatible rooms
  let roomQuery = supabase
    .from('room_services')
    .select('room_id, room:rooms(id, name, active)')
    .eq('service_id', serviceId);

  if (roomId) {
    roomQuery = roomQuery.eq('room_id', roomId);
  }

  const { data: roomLinks } = await roomQuery;
  const compatibleRooms = (roomLinks ?? [])
    .filter((rl) => (rl.room as unknown as { active: boolean })?.active)
    .map((rl) => ({
      id: rl.room_id,
      name: (rl.room as unknown as { name: string }).name,
    }));

  if (compatibleRooms.length === 0) return [];

  // 4. Get therapist availability rules for this day of week
  const { data: rules } = await supabase
    .from('therapist_availability_rules')
    .select('*')
    .in('therapist_id', qualifiedTherapists.map((t) => t.id))
    .eq('day_of_week', dayOfWeek);

  // 5. Get time-off overlapping this day
  const { data: timeOffs } = await supabase
    .from('therapist_time_off')
    .select('*')
    .in('therapist_id', qualifiedTherapists.map((t) => t.id))
    .lt('start_datetime', dayEnd)
    .gt('end_datetime', dayStart);

  // 6. Get existing bookings for qualified therapists on this day
  const { data: therapistBookings } = await supabase
    .from('bookings')
    .select('therapist_id, start_time, end_time')
    .in('therapist_id', qualifiedTherapists.map((t) => t.id))
    .not('status', 'in', '("cancelled","no_show")')
    .lt('start_time', dayEnd)
    .gt('end_time', dayStart);

  // 7. Get existing bookings for compatible rooms on this day
  const { data: roomBookings } = await supabase
    .from('bookings')
    .select('room_id, start_time, end_time')
    .in('room_id', compatibleRooms.map((r) => r.id))
    .not('status', 'in', '("cancelled","no_show")')
    .lt('start_time', dayEnd)
    .gt('end_time', dayStart);

  // 8. Get room blocks
  const { data: roomBlocks } = await supabase
    .from('room_blocks')
    .select('*')
    .in('room_id', compatibleRooms.map((r) => r.id))
    .lt('start_datetime', dayEnd)
    .gt('end_datetime', dayStart);

  // Build therapist free windows
  const therapistWindows = new Map<string, { start: number; end: number }[]>();

  for (const therapist of qualifiedTherapists) {
    const therapistRules = (rules ?? []).filter((r) => r.therapist_id === therapist.id);
    if (therapistRules.length === 0) continue;

    // Start with availability windows
    let windows: { start: number; end: number }[] = therapistRules.map((r) => ({
      start: timeToMinutes(r.start_time),
      end: timeToMinutes(r.end_time),
    }));

    // Subtract time-off
    const tTimeOffs = (timeOffs ?? []).filter((to) => to.therapist_id === therapist.id);
    for (const to of tTimeOffs) {
      windows = subtractRange(windows, {
        start: dateTimeToMinutes(to.start_datetime, date),
        end: dateTimeToMinutes(to.end_datetime, date),
      });
    }

    // Subtract existing bookings
    const tBookings = (therapistBookings ?? []).filter((b) => b.therapist_id === therapist.id);
    for (const b of tBookings) {
      windows = subtractRange(windows, {
        start: dateTimeToMinutes(b.start_time, date),
        end: dateTimeToMinutes(b.end_time, date),
      });
    }

    therapistWindows.set(therapist.id, windows);
  }

  // Build room free windows
  const roomWindows = new Map<string, { start: number; end: number }[]>();

  for (const room of compatibleRooms) {
    // Rooms are available all day unless blocked or booked
    let windows: { start: number; end: number }[] = [{ start: 0, end: 24 * 60 }];

    // Subtract room blocks
    const rBlocks = (roomBlocks ?? []).filter((rb) => rb.room_id === room.id);
    for (const rb of rBlocks) {
      windows = subtractRange(windows, {
        start: dateTimeToMinutes(rb.start_datetime, date),
        end: dateTimeToMinutes(rb.end_datetime, date),
      });
    }

    // Subtract existing bookings
    const rBookings = (roomBookings ?? []).filter((b) => b.room_id === room.id);
    for (const b of rBookings) {
      windows = subtractRange(windows, {
        start: dateTimeToMinutes(b.start_time, date),
        end: dateTimeToMinutes(b.end_time, date),
      });
    }

    roomWindows.set(room.id, windows);
  }

  // Cross-match: find slots where both therapist and room are free
  const slots: AvailableSlot[] = [];

  for (const therapist of qualifiedTherapists) {
    const tWindows = therapistWindows.get(therapist.id) ?? [];

    for (const room of compatibleRooms) {
      const rWindows = roomWindows.get(room.id) ?? [];

      // Find overlapping windows
      const overlaps = intersectWindows(tWindows, rWindows);

      // Generate slots from overlaps
      for (const window of overlaps) {
        let slotStart = window.start;
        while (slotStart + duration <= window.end) {
          slots.push({
            start_time: minutesToDateTime(slotStart, date),
            end_time: minutesToDateTime(slotStart + duration, date),
            therapist_id: therapist.id,
            room_id: room.id,
            therapist_name: therapist.name,
            room_name: room.name,
          });
          slotStart += 15; // 15-minute granularity
        }
      }
    }
  }

  // Sort by start time
  slots.sort((a, b) => a.start_time.localeCompare(b.start_time));

  return slots;
}

// Utility functions for time math

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function dateTimeToMinutes(datetime: string, refDate: string): number {
  const dt = new Date(datetime);
  const ref = new Date(`${refDate}T00:00:00+03:00`);
  const diffMs = dt.getTime() - ref.getTime();
  return Math.floor(diffMs / 60000);
}

function minutesToDateTime(minutes: number, date: string): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+03:00`;
}

function subtractRange(
  windows: { start: number; end: number }[],
  range: { start: number; end: number }
): { start: number; end: number }[] {
  const result: { start: number; end: number }[] = [];

  for (const w of windows) {
    if (range.end <= w.start || range.start >= w.end) {
      result.push(w);
    } else {
      if (range.start > w.start) {
        result.push({ start: w.start, end: range.start });
      }
      if (range.end < w.end) {
        result.push({ start: range.end, end: w.end });
      }
    }
  }

  return result;
}

function intersectWindows(
  a: { start: number; end: number }[],
  b: { start: number; end: number }[]
): { start: number; end: number }[] {
  const result: { start: number; end: number }[] = [];

  for (const wa of a) {
    for (const wb of b) {
      const start = Math.max(wa.start, wb.start);
      const end = Math.min(wa.end, wb.end);
      if (start < end) {
        result.push({ start, end });
      }
    }
  }

  return result;
}
