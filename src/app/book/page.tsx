'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { getServices } from '@/lib/actions/service-actions';
import { findSlots, createBookingAction } from '@/lib/actions/booking-actions';
import { createCustomer } from '@/lib/actions/customer-actions';
import { createPaymentForBooking } from '@/lib/actions/payment-actions';
import { formatCurrency } from '@/lib/utils';
import type { Service, AvailableSlot } from '@/lib/types';

type Step = 'service' | 'date' | 'slot' | 'contact' | 'payment';

export default function BookPage() {
  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getServices().then((s) => setServices(s.filter((svc: Service) => svc.active)));
  }, []);

  useEffect(() => {
    if (selectedService && date) {
      findSlots(selectedService.id, date).then(setSlots);
    }
  }, [selectedService, date]);

  async function handleBooking() {
    if (!selectedSlot || !selectedService || !name) return;
    setLoading(true);
    setError('');

    // Create or find customer
    const formData = new FormData();
    formData.set('name', name);
    if (email) formData.set('email', email);
    if (phone) formData.set('phone', phone);

    const customerResult = await createCustomer(formData);
    if (!customerResult.success || !customerResult.data) {
      setError('Failed to save contact info');
      setLoading(false);
      return;
    }

    // Create booking
    const bookingResult = await createBookingAction({
      customer_id: customerResult.data.id,
      therapist_id: selectedSlot.therapist_id,
      room_id: selectedSlot.room_id,
      service_id: selectedService.id,
      start_time: selectedSlot.start_time,
    });

    const br = bookingResult as { booking?: { id: string }; error?: string };
    if (br.error || !br.booking) {
      setError(br.error || 'Failed to create booking');
      setLoading(false);
      return;
    }

    // Create payment link
    const paymentResult = await createPaymentForBooking(br.booking.id);

    const pr = paymentResult as { paymentUrl?: string; error?: string };
    if (pr.error || !pr.paymentUrl) {
      setError(pr.error || 'Failed to create payment');
      setLoading(false);
      return;
    }

    // Redirect to payment
    window.location.href = pr.paymentUrl!;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="text-lg font-bold">SpaMe</span>
          <span className="text-sm text-neutral-400">Book an appointment</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2 text-xs">
          {(['service', 'date', 'slot', 'contact'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                step === s ? 'bg-indigo-600 text-white' :
                (['service', 'date', 'slot', 'contact'].indexOf(step) > i) ? 'bg-indigo-100 text-indigo-700' :
                'bg-neutral-200 text-neutral-500'
              }`}>
                {(['service', 'date', 'slot', 'contact'].indexOf(step) > i) ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < 3 && <div className="h-px w-8 bg-neutral-200" />}
            </div>
          ))}
        </div>

        {/* Step: Service */}
        {step === 'service' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Choose a service</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <Card
                  key={s.id}
                  className={`cursor-pointer transition-shadow hover:shadow-md ${
                    selectedService?.id === s.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedService(s)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <CardTitle className="text-base">{s.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-sm text-neutral-500">{s.description}</p>
                    <p className="text-sm font-medium">
                      {s.duration_minutes} min · {formatCurrency(s.price)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                disabled={!selectedService}
                onClick={() => setStep('date')}
              >
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Date */}
        {step === 'date' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Pick a date</h2>
            <Input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="max-w-xs"
            />
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep('service')}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button disabled={!date} onClick={() => setStep('slot')}>
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Slot */}
        {step === 'slot' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Choose a time</h2>
            {slots.length === 0 ? (
              <p className="text-neutral-500">No available slots for this date. Try another date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot, i) => {
                  const time = new Date(slot.start_time).toLocaleTimeString('en-IL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'Asia/Jerusalem',
                  });
                  const isSelected = selectedSlot?.start_time === slot.start_time &&
                    selectedSlot?.therapist_id === slot.therapist_id;

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border p-3 text-center transition-colors ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-sm font-medium">{time}</div>
                      <div className="text-xs text-neutral-500">{slot.therapist_name}</div>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep('date')}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button disabled={!selectedSlot} onClick={() => setStep('contact')}>
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Contact */}
        {step === 'contact' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Your details</h2>
            <div className="max-w-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+972..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 rounded-lg border bg-white p-4">
              <h3 className="mb-2 font-medium">Booking Summary</h3>
              <div className="space-y-1 text-sm text-neutral-600">
                <p><span className="font-medium">Service:</span> {selectedService?.name}</p>
                <p><span className="font-medium">Date:</span> {date}</p>
                <p><span className="font-medium">Time:</span> {selectedSlot && new Date(selectedSlot.start_time).toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' })}</p>
                <p><span className="font-medium">Therapist:</span> {selectedSlot?.therapist_name}</p>
                <p><span className="font-medium">Total:</span> {formatCurrency(selectedService?.price ?? 0)}</p>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep('slot')}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button disabled={!name || loading} onClick={handleBooking}>
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
