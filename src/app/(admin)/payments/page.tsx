'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { demoPayments, demoBookings, demoCustomers, demoServices } from '@/lib/demo-data';
import type { PaymentStatus } from '@/lib/types';

const statusVariants: Record<PaymentStatus, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  pending: 'warning',
  completed: 'success',
  failed: 'destructive',
  refunded: 'secondary',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<typeof demoPayments>([]);

  useEffect(() => {
    async function load() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('payments')
          .select('*, booking:bookings(id, status, customer:customers(name), service:services(name))')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setPayments(data as typeof demoPayments);
          return;
        }
      } catch {
        // Fall through to demo
      }
      setPayments(demoPayments);
    }
    load();
  }, []);

  function getBookingInfo(bookingId: string) {
    const booking = demoBookings.find((b) => b.id === bookingId);
    const customer = booking ? demoCustomers.find((c) => c.id === booking.customer_id) : null;
    const service = booking ? demoServices.find((s) => s.id === booking.service_id) : null;
    return { booking, customer, service };
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Payments</h1>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Payment Status</th>
              <th className="px-4 py-3 font-medium">Booking Status</th>
              <th className="px-4 py-3 font-medium">Provider</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const info = getBookingInfo(p.booking_id);
              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">{formatDateTime(p.created_at)}</td>
                  <td className="px-4 py-3">{info.customer?.name ?? '—'}</td>
                  <td className="px-4 py-3">{info.service?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariants[p.status]}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {info.booking?.status?.replace('_', ' ') ?? '—'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{p.provider}</td>
                </tr>
              );
            })}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
