import { z } from 'zod';

export const paymentCreateSchema = z.object({
  booking_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  currency: z.string().default('ILS'),
});

export type PaymentCreateData = z.infer<typeof paymentCreateSchema>;
