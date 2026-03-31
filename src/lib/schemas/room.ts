import { z } from 'zod';

export const roomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).nullable().optional(),
  active: z.boolean().default(true),
});

export type RoomFormData = z.infer<typeof roomSchema>;

export const roomBlockSchema = z.object({
  room_id: z.string().uuid(),
  start_datetime: z.string().min(1),
  end_datetime: z.string().min(1),
  reason: z.string().max(500).nullable().optional(),
});
