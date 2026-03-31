'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { getBookingsForRange, updateBookingStatusAction } from '@/lib/actions/booking-actions';
import Link from 'next/link';
import type { Booking, BookingStatus } from '@/lib/types';

const statusVariants: Record<BookingStatus, 'warning' | 'success' | 'destructive' | 'secondary' | 'default'> = {
  pending_payment: 'warning',
  confirmed: 'success',
  cancelled: 'destructive',
  completed: 'default',
  no_show: 'secondary',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('');

  async function load() {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const end = new Date();
    end.setDate(end.getDate() + 60);
    const data = await getBookingsForRange(start.toISOString(), end.toISOString());
    setBookings(data);
  }

  useEffect(() => { load(); }, []);

  const filtered = filter ? bookings.filter((b) => b.status === filter) : bookings;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <Select className="w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="no_show">No Show</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Date/Time</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Therapist</th>
              <th className="px-4 py-3 font-medium">Room</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">{formatDateTime(b.start_time)}</td>
                <td className="px-4 py-3 font-medium">{b.service?.name}</td>
                <td className="px-4 py-3">{b.customer?.name}</td>
                <td className="px-4 py-3">{b.therapist?.name}</td>
                <td className="px-4 py-3">{b.room?.name}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariants[b.status]}>
                    {b.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3">{formatCurrency(b.service?.price ?? 0)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
