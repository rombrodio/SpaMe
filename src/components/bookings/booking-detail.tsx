'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Clock, User, DoorOpen, Scissors } from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { updateBookingStatusAction, cancelBookingAction } from '@/lib/actions/booking-actions';
import type { Booking, BookingStatus } from '@/lib/types';

const statusVariants: Record<BookingStatus, 'warning' | 'success' | 'destructive' | 'secondary' | 'default'> = {
  pending_payment: 'warning',
  confirmed: 'success',
  cancelled: 'destructive',
  completed: 'default',
  no_show: 'secondary',
};

interface BookingDetailProps {
  booking: Booking;
  onClose: () => void;
  onUpdate: () => void;
}

export function BookingDetail({ booking, onClose, onUpdate }: BookingDetailProps) {
  async function handleStatusChange(status: BookingStatus) {
    if (status === 'cancelled') {
      if (!confirm('Cancel this booking?')) return;
      await cancelBookingAction(booking.id);
    } else {
      await updateBookingStatusAction(booking.id, status);
    }
    onUpdate();
  }

  return (
    <div className="w-80 border-l bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Booking Details</h3>
        <button onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <Badge variant={statusVariants[booking.status]} className="mb-4">
        {booking.status.replace('_', ' ')}
      </Badge>

      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <Scissors className="mt-0.5 h-4 w-4 text-neutral-400" />
          <div>
            <div className="font-medium">{booking.service?.name}</div>
            <div className="text-neutral-500">
              {booking.service?.duration_minutes} min · {formatCurrency(booking.service?.price ?? 0)}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 text-neutral-400" />
          <div>
            <div>{formatDateTime(booking.start_time)}</div>
            <div className="text-neutral-500">to {formatDateTime(booking.end_time)}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User className="mt-0.5 h-4 w-4 text-neutral-400" />
          <div>
            <div className="font-medium">{booking.customer?.name}</div>
            <div className="text-neutral-500">{booking.customer?.phone}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User className="mt-0.5 h-4 w-4 text-neutral-400" />
          <div className="text-neutral-500">Therapist: {booking.therapist?.name}</div>
        </div>

        <div className="flex items-start gap-2">
          <DoorOpen className="mt-0.5 h-4 w-4 text-neutral-400" />
          <div className="text-neutral-500">Room: {booking.room?.name}</div>
        </div>

        {booking.notes && (
          <div className="rounded-md bg-neutral-50 p-2 text-neutral-600">
            {booking.notes}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {booking.status === 'pending_payment' && (
          <Button
            size="sm"
            className="w-full"
            onClick={() => handleStatusChange('confirmed')}
          >
            Mark as Confirmed
          </Button>
        )}
        {booking.status === 'confirmed' && (
          <Button
            size="sm"
            className="w-full"
            onClick={() => handleStatusChange('completed')}
          >
            Mark as Completed
          </Button>
        )}
        {booking.status === 'confirmed' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleStatusChange('no_show')}
          >
            Mark as No-Show
          </Button>
        )}
        {!['cancelled', 'completed'].includes(booking.status) && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => handleStatusChange('cancelled')}
          >
            Cancel Booking
          </Button>
        )}
      </div>
    </div>
  );
}
