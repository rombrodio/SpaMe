'use client';

import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/types';

interface WeekViewProps {
  date: Date;
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  onSlotClick: (date: string, time: string) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekView({ date, bookings, onBookingClick, onSlotClick }: WeekViewProps) {
  // Get Sunday of the current week
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex min-h-[800px]">
      {/* Time column */}
      <div className="w-16 shrink-0">
        <div className="h-10 border-b" />
        {HOURS.map((hour) => (
          <div key={hour} className="flex h-16 items-start justify-end border-b px-2 text-xs text-neutral-400">
            {String(hour).padStart(2, '0')}:00
          </div>
        ))}
      </div>

      {/* Day columns */}
      {days.map((day, dayIndex) => {
        const dateStr = formatDateLocal(day);
        const dayBookings = bookings.filter((b) => b.start_time.startsWith(dateStr));
        const isToday = dateStr === formatDateLocal(new Date());

        return (
          <div key={dayIndex} className="relative flex-1 border-l">
            {/* Header */}
            <div className={cn(
              'sticky top-0 z-10 flex h-10 items-center justify-center border-b bg-white text-xs font-medium',
              isToday && 'bg-indigo-50 text-indigo-700'
            )}>
              {DAY_LABELS[dayIndex]} {day.getDate()}
            </div>

            {/* Hour grid */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b hover:bg-neutral-50 cursor-pointer"
                onClick={() => onSlotClick(dateStr, `${String(hour).padStart(2, '0')}:00`)}
              />
            ))}

            {/* Booking overlays */}
            {dayBookings.map((booking) => {
              const top = timeToOffset(booking.start_time) + 40; // +40 for header
              const height = timeToOffset(booking.end_time) - timeToOffset(booking.start_time);

              return (
                <div
                  key={booking.id}
                  className={cn(
                    'absolute inset-x-0.5 cursor-pointer rounded px-1 py-0.5 text-[10px] leading-tight',
                    booking.status === 'pending_payment'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : booking.status === 'confirmed'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                  )}
                  style={{ top, height: Math.max(height - 2, 18) }}
                  onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                >
                  <div className="truncate font-medium">{booking.service?.name}</div>
                  <div className="truncate">{booking.customer?.name}</div>
                </div>
              );
            })}
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
  return ((hours - 8) * 60 + minutes) / 60 * 64;
}
