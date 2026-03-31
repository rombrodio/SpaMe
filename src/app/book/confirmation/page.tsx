'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const cancelled = searchParams.get('cancelled');

  if (cancelled) {
    return (
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <CardTitle className="text-xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-neutral-500">
            Your payment was cancelled. The booking is still pending.
            You can try again or contact us for assistance.
          </p>
          <Link href="/book">
            <Button>Try Again</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <CardTitle className="text-xl">Booking Confirmed!</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4 text-neutral-500">
          Your appointment has been confirmed and payment received.
          You&apos;ll receive a confirmation message shortly.
        </p>
        {bookingId && (
          <p className="mb-4 text-xs text-neutral-400">
            Booking ID: {bookingId}
          </p>
        )}
        <Link href="/book">
          <Button variant="outline">Book Another Appointment</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="text-lg font-bold">SpaMe</span>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-16">
        <Suspense fallback={
          <Card className="max-w-md">
            <CardContent className="flex items-center justify-center py-8">
              <Clock className="mr-2 h-5 w-5 animate-spin text-neutral-400" />
              <span className="text-neutral-500">Loading...</span>
            </CardContent>
          </Card>
        }>
          <ConfirmationContent />
        </Suspense>
      </div>
    </div>
  );
}
