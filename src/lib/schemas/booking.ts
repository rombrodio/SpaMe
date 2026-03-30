import { z } from 'zod';

export const bookingCreateSchema = z.object({
  customer_id: z.string().uuid(),
  therapist_id: z.string().uuid(),
  room_id: z.string().uuid(),
  service_id: z.string().uuid(),
  start_time: z.string().min(1),
  notes: z.string().max(2000).nullable().optional(),
});

export type BookingCreateData = z.infer<typeof bookingCreateSchema>;

export const bookingUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  therapist_id: z.string().uuid().optional(),
  room_id: z.string().uuid().optional(),
  start_time: z.string().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type BookingUpdateData = z.infer<typeof bookingUpdateSchema>;
