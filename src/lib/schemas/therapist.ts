import { z } from 'zod';

export const therapistSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  active: z.boolean().default(true),
});

export type TherapistFormData = z.infer<typeof therapistSchema>;

export const availabilityRuleSchema = z.object({
  therapist_id: z.string().uuid(),
  day_of_week: z.coerce.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
});

export const timeOffSchema = z.object({
  therapist_id: z.string().uuid(),
  start_datetime: z.string().min(1),
  end_datetime: z.string().min(1),
  reason: z.string().max(500).nullable().optional(),
});
