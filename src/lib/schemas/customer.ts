import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
