import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).nullable().optional(),
  duration_minutes: z.coerce.number().int().min(15).max(480),
  price: z.coerce.number().min(0).max(100000),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
  active: z.boolean().default(true),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
