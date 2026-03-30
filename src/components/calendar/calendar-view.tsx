'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayView } from './day-view';
import { WeekView } from './week-view';
import type { Booking } from '@/lib/types';

interface CalendarViewProps {
  initialBookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  onSlotClick: (date: string, time: string) => void;
}

export function CalendarView({ initialBookings, onBookingClick, onSlotClick }: CalendarViewProps) {
  const [view, setView] = useState<'day' | 'week'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState(initialBookings);

  function navigate(delta: number) {
    const next = new Date(currentDate);
    if (view === 'day') {
      next.setDate(next.getDate() + delta);
    } else {
      next.setDate(next.getDate() + delta * 7);
    }
    setCurrentDate(next);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  const dateStr = currentDate.toLocaleDateString('en-IL', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{dateStr}</span>
        </div>
        <div className="flex gap-1 rounded-lg border p-0.5">
          <Button
            variant={view === 'day' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('day')}
          >
            Day
          </Button>
          <Button
            variant={view === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('week')}
          >
            Week
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {view === 'day' ? (
          <DayView
            date={currentDate}
            bookings={bookings}
            onBookingClick={onBookingClick}
            onSlotClick={onSlotClick}
          />
        ) : (
          <WeekView
            date={currentDate}
            bookings={bookings}
            onBookingClick={onBookingClick}
            onSlotClick={onSlotClick}
          />
        )}
      </div>
    </div>
  );
}
