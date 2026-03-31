import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, DoorOpen, CreditCard } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const [
      { count: bookingCount },
      { count: todayBookingCount },
      { count: therapistCount },
      { count: pendingPaymentCount },
    ] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', new Date().toISOString().split('T')[0])
        .lt('start_time', new Date(Date.now() + 86400000).toISOString().split('T')[0]),
      supabase.from('therapists').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_payment'),
    ]);
    return {
      totalBookings: bookingCount ?? 0,
      todayBookings: todayBookingCount ?? 0,
      activeTherapists: therapistCount ?? 0,
      pendingPayments: pendingPaymentCount ?? 0,
    };
  } catch {
    // Demo mode
    return { totalBookings: 7, todayBookings: 4, activeTherapists: 4, pendingPayments: 2 };
  }
}

export default async function DashboardPage() {
  const s = await getStats();

  const stats = [
    { label: 'Total Bookings', value: s.totalBookings, icon: CalendarDays, href: '/calendar' },
    { label: "Today's Bookings", value: s.todayBookings, icon: CalendarDays, href: '/calendar' },
    { label: 'Active Therapists', value: s.activeTherapists, icon: Users, href: '/therapists' },
    { label: 'Pending Payments', value: s.pendingPayments, icon: CreditCard, href: '/payments' },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
