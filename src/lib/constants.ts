export const TIMEZONE = 'Asia/Jerusalem';
export const CURRENCY = 'ILS';
export const LOCALE = 'he-IL';

export const BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = [
  'pending',
  'completed',
  'failed',
  'refunded',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SLOT_DURATION_MINUTES = 15; // granularity for availability slots

export const BUSINESS_HOURS = {
  open: '09:00',
  close: '21:00',
} as const;
