'use client';

import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/types';

interface DayViewProps {
  date: Date;
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  onSlotClick: (date: string, time: string) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00

export function DayView({ date, bookings, onBookingClick, onSlotClick }: DayViewProps) {
  const dateStr = formatDateLocal(date);
  const dayBookings = bookings.filter((b) => b.start_time.startsWith(dateStr));

  return (
    <div className="relative min-h-[800px]">
      {HOURS.map((hour) => (
        <div key={hour} className="flex border-b" style={{ height: 64 }}>
          <div className="w-16 shrink-0 border-r px-2 py-1 text-right text-xs text-neutral-400">
            {String(hour).padStart(2, '0')}:00
          </div>
          <div
            className="flex-1 cursor-pointer hover:bg-neutral-50"
            onClick={() => onSlotClick(dateStr, `${String(hour).padStart(2, '0')}:00`)}
          />
        </div>
      ))}

      {/* Booking overlays */}
      {dayBookings.map((booking) => {
        const top = timeToOffset(booking.start_time);
        const height = timeToOffset(booking.end_time) - top;

        return (
          <div
            key={booking.id}
            className={cn(
              'absolute left-16 right-2 cursor-pointer rounded-md border px-2 py-1 text-xs',
              booking.status === 'pending_payment'
                ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                : booking.status === 'confirmed'
                ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                : 'border-neutral-300 bg-neutral-50 text-neutral-800'
            )}
            style={{ top: top + 1, height: Math.max(height - 2, 20) }}
            onClick={() => onBookingClick(booking)}
          >
            <div className="font-medium">{booking.service?.name}</div>
            <div>{booking.customer?.name} · {booking.therapist?.name}</div>
          </div>
        );
      })}
    </div>
  );
}

function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function timeToOffset(datetime: string): number {
  const d = new Date(datetime);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const totalMinutes = (hours - 8) * 60 + minutes; // 8:00 = 0
  return (totalMinutes / 60) * 64; // 64px per hour
}
