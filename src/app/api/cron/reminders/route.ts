import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWhatsAppAdapter } from '@/lib/adapters/whatsapp';

/**
 * Cron job for sending booking reminders.
 * Set up as Vercel Cron: runs daily at 8am Israel time.
 *
 * vercel.json:
 * { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 5 * * *" }] }
 * (5 UTC = 8 Israel time)
 */
export async function GET() {
  const supabase = createAdminClient();
  const adapter = getWhatsAppAdapter();

  // Find confirmed bookings for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, customer:customers(name, phone), service:services(name)')
    .eq('status', 'confirmed')
    .gte('start_time', tomorrowStr)
    .lt('start_time', dayAfterStr);

  let sent = 0;

  for (const booking of bookings ?? []) {
    const phone = booking.customer?.phone;
    if (!phone) continue;

    const time = new Date(booking.start_time).toLocaleTimeString('en-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jerusalem',
    });

    const message = `Hi ${booking.customer.name}! This is a reminder for your ${booking.service.name} appointment tomorrow at ${time}. See you at SpaMe! 🌿`;

    try {
      await adapter.sendMessage(phone, message);
      sent++;
    } catch (err) {
      console.error(`Failed to send reminder to ${phone}:`, err);
    }
  }

  return NextResponse.json({ sent, total: bookings?.length ?? 0 });
}
