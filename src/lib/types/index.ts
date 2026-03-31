export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  color: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Therapist {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TherapistService {
  id: string;
  therapist_id: string;
  service_id: string;
}

export interface RoomService {
  id: string;
  room_id: string;
  service_id: string;
}

export interface TherapistAvailabilityRule {
  id: string;
  therapist_id: string;
  day_of_week: number;
  start_time: string; // HH:MM
  end_time: string;
}

export interface TherapistTimeOff {
  id: string;
  therapist_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
  created_at: string;
}

export interface RoomBlock {
  id: string;
  room_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface Booking {
  id: string;
  customer_id: string;
  therapist_id: string;
  room_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (optional)
  customer?: Customer;
  therapist?: Therapist;
  room?: Room;
  service?: Service;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  provider_payment_id: string | null;
  payment_url: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  booking?: Booking;
}

export type ConversationChannel = 'whatsapp' | 'web';
export type ConversationStatus = 'active' | 'handed_off' | 'closed';

export interface ConversationThread {
  id: string;
  customer_id: string | null;
  channel: ConversationChannel;
  external_id: string | null;
  status: ConversationStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export type MessageRole = 'customer' | 'assistant' | 'staff' | 'system';

export interface ConversationMessage {
  id: string;
  thread_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

// Availability slot returned by the scheduling engine
export interface AvailableSlot {
  start_time: string;
  end_time: string;
  therapist_id: string;
  room_id: string;
  therapist_name: string;
  room_name: string;
}
