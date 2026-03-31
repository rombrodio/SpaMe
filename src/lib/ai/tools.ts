import { findAvailableSlots } from '@/lib/services/availability';
import { createBooking, cancelBooking, updateBookingStatus } from '@/lib/services/booking';
import { createPaymentForBooking } from '@/lib/services/payment';
import { handoffToStaff } from '@/lib/services/conversation';
import { createClient } from '@/lib/supabase/server';

/**
 * These are the ONLY tools the AI assistant is allowed to call.
 * The AI must never fabricate availability or payment confirmation.
 */

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export type ToolName =
  | 'find_available_slots'
  | 'create_tentative_booking'
  | 'create_payment_link'
  | 'reschedule_booking'
  | 'cancel_booking'
  | 'handoff_to_staff';

export const TOOL_DEFINITIONS = [
  {
    name: 'find_available_slots',
    description: 'Find available appointment slots for a service on a specific date',
    parameters: {
      service_id: 'UUID of the service',
      date: 'Date in YYYY-MM-DD format',
      therapist_id: '(optional) UUID of preferred therapist',
    },
  },
  {
    name: 'create_tentative_booking',
    description: 'Create a booking in pending_payment status',
    parameters: {
      customer_id: 'UUID of the customer',
      therapist_id: 'UUID of the therapist',
      room_id: 'UUID of the room',
      service_id: 'UUID of the service',
      start_time: 'ISO datetime string',
    },
  },
  {
    name: 'create_payment_link',
    description: 'Generate a payment link for a pending booking',
    parameters: {
      booking_id: 'UUID of the booking',
    },
  },
  {
    name: 'reschedule_booking',
    description: 'Reschedule an existing booking to a new time',
    parameters: {
      booking_id: 'UUID of the booking to reschedule',
      new_start_time: 'ISO datetime string for new time',
    },
  },
  {
    name: 'cancel_booking',
    description: 'Cancel an existing booking',
    parameters: {
      booking_id: 'UUID of the booking',
    },
  },
  {
    name: 'handoff_to_staff',
    description: 'Transfer the conversation to a human staff member',
    parameters: {
      thread_id: 'UUID of the conversation thread',
      reason: 'Why the handoff is needed',
    },
  },
] as const;

export async function executeTool(name: ToolName, params: Record<string, string>): Promise<ToolResult> {
  try {
    switch (name) {
      case 'find_available_slots': {
        const slots = await findAvailableSlots({
          serviceId: params.service_id,
          date: params.date,
          therapistId: params.therapist_id,
        });
        return { success: true, data: slots };
      }

      case 'create_tentative_booking': {
        const result = await createBooking({
          customer_id: params.customer_id,
          therapist_id: params.therapist_id,
          room_id: params.room_id,
          service_id: params.service_id,
          start_time: params.start_time,
        });
        if (result.error) return { success: false, error: result.error };
        return { success: true, data: result.booking };
      }

      case 'create_payment_link': {
        const result = await createPaymentForBooking(params.booking_id);
        if (result.error) return { success: false, error: result.error };
        return { success: true, data: { payment_url: result.paymentUrl } };
      }

      case 'reschedule_booking': {
        const supabase = await createClient();
        // Cancel old booking
        await cancelBooking(params.booking_id);

        // Get old booking details to recreate
        const { data: oldBooking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', params.booking_id)
          .single();

        if (!oldBooking) return { success: false, error: 'Booking not found' };

        const newResult = await createBooking({
          customer_id: oldBooking.customer_id,
          therapist_id: oldBooking.therapist_id,
          room_id: oldBooking.room_id,
          service_id: oldBooking.service_id,
          start_time: params.new_start_time,
        });

        if (newResult.error) return { success: false, error: newResult.error };
        return { success: true, data: newResult.booking };
      }

      case 'cancel_booking': {
        const result = await cancelBooking(params.booking_id);
        if (result.error) return { success: false, error: result.error };
        return { success: true };
      }

      case 'handoff_to_staff': {
        await handoffToStaff(params.thread_id);
        return { success: true, data: { message: 'Conversation handed off to staff' } };
      }

      default:
        return { success: false, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Tool execution failed' };
  }
}
