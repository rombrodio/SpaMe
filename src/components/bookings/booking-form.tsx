'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { findSlots, createBookingAction } from '@/lib/actions/booking-actions';
import { getServices } from '@/lib/actions/service-actions';
import { getCustomers } from '@/lib/actions/customer-actions';
import type { Service, Customer, AvailableSlot } from '@/lib/types';

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  initialDate?: string;
  initialTime?: string;
}

export function BookingForm({ open, onOpenChange, onCreated, initialDate, initialTime }: BookingFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);

  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(initialDate ?? new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    Promise.all([getServices(), getCustomers()]).then(([s, c]) => {
      setServices(s.filter((svc: Service) => svc.active));
      setCustomers(c);
    });
  }, []);

  useEffect(() => {
    if (initialDate) setDate(initialDate);
  }, [initialDate]);

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    findSlots(serviceId, date).then((s) => {
      setSlots(s);
      setSlotsLoading(false);
    });
  }, [serviceId, date]);

  async function handleSubmit() {
    if (!selectedSlot || !customerId || !serviceId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    const result = await createBookingAction({
      customer_id: customerId,
      therapist_id: selectedSlot.therapist_id,
      room_id: selectedSlot.room_id,
      service_id: serviceId,
      start_time: selectedSlot.start_time,
      notes: notes || undefined,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    onOpenChange(false);
    onCreated();
  }

  // Group slots by time for display
  const uniqueTimes = [...new Set(slots.map((s) => s.start_time))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Service</Label>
            <Select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setSelectedSlot(null); }}>
              <option value="">Select service...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration_minutes} min)
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }} />
          </div>

          {serviceId && date && (
            <div className="space-y-2">
              <Label>Available Slots</Label>
              {slotsLoading ? (
                <p className="text-sm text-neutral-500">Loading slots...</p>
              ) : uniqueTimes.length === 0 ? (
                <p className="text-sm text-neutral-500">No slots available for this date</p>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-md border p-2">
                  <div className="grid grid-cols-3 gap-1">
                    {slots.map((slot, i) => {
                      const time = new Date(slot.start_time).toLocaleTimeString('en-IL', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Jerusalem',
                      });
                      const isSelected = selectedSlot?.start_time === slot.start_time &&
                        selectedSlot?.therapist_id === slot.therapist_id &&
                        selectedSlot?.room_id === slot.room_id;

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'hover:bg-neutral-50'
                          }`}
                          title={`${slot.therapist_name} · ${slot.room_name}`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedSlot && (
                <p className="text-xs text-neutral-500">
                  {selectedSlot.therapist_name} in {selectedSlot.room_name}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={handleSubmit} disabled={loading || !selectedSlot || !customerId} className="w-full">
            {loading ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
