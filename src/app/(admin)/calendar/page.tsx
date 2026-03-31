'use client';

import { useEffect, useState, useCallback } from 'react';
import { CalendarView } from '@/components/calendar/calendar-view';
import { BookingForm } from '@/components/bookings/booking-form';
import { BookingDetail } from '@/components/bookings/booking-detail';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { getBookingsForRange } from '@/lib/actions/booking-actions';
import { getTherapists } from '@/lib/actions/therapist-actions';
import { getServices } from '@/lib/actions/service-actions';
import type { Booking, Therapist, Service } from '@/lib/types';

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<string>();
  const [initialTime, setInitialTime] = useState<string>();

  // Filters
  const [filterTherapist, setFilterTherapist] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadBookings = useCallback(async () => {
    // Load a month of bookings around today
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const end = new Date();
    end.setDate(end.getDate() + 30);

    const data = await getBookingsForRange(start.toISOString(), end.toISOString());
    setBookings(data);
  }, []);

  useEffect(() => {
    loadBookings();
    getTherapists().then(setTherapists);
    getServices().then(setServices);
  }, [loadBookings]);

  function handleSlotClick(date: string, time: string) {
    setInitialDate(date);
    setInitialTime(time);
    setBookingFormOpen(true);
  }

  // Apply filters
  let filteredBookings = bookings;
  if (filterTherapist) {
    filteredBookings = filteredBookings.filter((b) => b.therapist_id === filterTherapist);
  }
  if (filterService) {
    filteredBookings = filteredBookings.filter((b) => b.service_id === filterService);
  }
  if (filterStatus) {
    filteredBookings = filteredBookings.filter((b) => b.status === filterStatus);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-2">
        <Button size="sm" onClick={() => setBookingFormOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Booking
        </Button>
        <Select
          className="w-40"
          value={filterTherapist}
          onChange={(e) => setFilterTherapist(e.target.value)}
        >
          <option value="">All Therapists</option>
          {therapists.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
        <Select
          className="w-36"
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
        >
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <Select
          className="w-36"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="no_show">No Show</option>
        </Select>
      </div>

      {/* Calendar + Detail side panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <CalendarView
            initialBookings={filteredBookings}
            onBookingClick={(b) => setSelectedBooking(b)}
            onSlotClick={handleSlotClick}
          />
        </div>

        {selectedBooking && (
          <BookingDetail
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onUpdate={() => {
              loadBookings();
              setSelectedBooking(null);
            }}
          />
        )}
      </div>

      <BookingForm
        open={bookingFormOpen}
        onOpenChange={setBookingFormOpen}
        onCreated={loadBookings}
        initialDate={initialDate}
        initialTime={initialTime}
      />
    </div>
  );
}
