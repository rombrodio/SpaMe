import type { Service, Therapist, Room, Customer, Booking, Payment } from '@/lib/types';

export const demoServices: Service[] = [
  { id: 'a1000000-0000-0000-0000-000000000001', name: 'Swedish Massage', description: 'Full body relaxation massage', duration_minutes: 60, price: 350, color: '#6366f1', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'a1000000-0000-0000-0000-000000000002', name: 'Deep Tissue Massage', description: 'Intense muscle relief massage', duration_minutes: 75, price: 450, color: '#ec4899', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'a1000000-0000-0000-0000-000000000003', name: 'Hot Stone Therapy', description: 'Heated basalt stones for deep relaxation', duration_minutes: 90, price: 500, color: '#f59e0b', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'a1000000-0000-0000-0000-000000000004', name: 'Facial Treatment', description: 'Cleansing and hydrating facial', duration_minutes: 45, price: 280, color: '#10b981', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'a1000000-0000-0000-0000-000000000005', name: 'Couples Massage', description: 'Side-by-side relaxation for two', duration_minutes: 60, price: 650, color: '#ef4444', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'a1000000-0000-0000-0000-000000000006', name: 'Aromatherapy', description: 'Essential oil massage therapy', duration_minutes: 60, price: 380, color: '#8b5cf6', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

export const demoTherapists: Therapist[] = [
  { id: 'b1000000-0000-0000-0000-000000000001', name: 'Dana Cohen', email: 'dana@spame.co.il', phone: '+972501234567', bio: 'Certified massage therapist with 8 years of experience', avatar_url: null, active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'b1000000-0000-0000-0000-000000000002', name: 'Yael Levy', email: 'yael@spame.co.il', phone: '+972501234568', bio: 'Specializes in deep tissue and sports massage', avatar_url: null, active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'b1000000-0000-0000-0000-000000000003', name: 'Noam Ben-David', email: 'noam@spame.co.il', phone: '+972501234569', bio: 'Hot stone and aromatherapy specialist', avatar_url: null, active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'b1000000-0000-0000-0000-000000000004', name: 'Maya Rosen', email: 'maya@spame.co.il', phone: '+972501234570', bio: 'Facial treatment expert and skincare specialist', avatar_url: null, active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

export const demoRooms: Room[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Serenity Room', description: 'Large room with ambient lighting, fits couples', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Harmony Room', description: 'Standard treatment room with shower', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Zen Room', description: 'Compact room for facials and short treatments', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Lotus Room', description: 'Premium room with private garden view', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

export const demoCustomers: Customer[] = [
  { id: 'd1000000-0000-0000-0000-000000000001', name: 'Sarah Green', email: 'sarah@example.com', phone: '+972521111111', notes: 'Prefers morning appointments', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'd1000000-0000-0000-0000-000000000002', name: 'David Katz', email: 'david@example.com', phone: '+972522222222', notes: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'd1000000-0000-0000-0000-000000000003', name: 'Noa Friedman', email: 'noa@example.com', phone: '+972523333333', notes: 'Allergic to lavender oil', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'd1000000-0000-0000-0000-000000000004', name: 'Eitan Weiss', email: 'eitan@example.com', phone: '+972524444444', notes: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

// Generate bookings relative to today
function getRelativeDate(daysOffset: number, hour: number, minute: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const demoBookings: Booking[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    customer_id: 'd1000000-0000-0000-0000-000000000001',
    therapist_id: 'b1000000-0000-0000-0000-000000000001',
    room_id: 'c1000000-0000-0000-0000-000000000002',
    service_id: 'a1000000-0000-0000-0000-000000000001',
    start_time: getRelativeDate(0, 10, 0),
    end_time: getRelativeDate(0, 11, 0),
    status: 'confirmed',
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    customer: demoCustomers[0],
    therapist: demoTherapists[0],
    room: demoRooms[1],
    service: demoServices[0],
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    customer_id: 'd1000000-0000-0000-0000-000000000002',
    therapist_id: 'b1000000-0000-0000-0000-000000000002',
    room_id: 'c1000000-0000-0000-0000-000000000001',
    service_id: 'a1000000-0000-0000-0000-000000000002',
    start_time: getRelativeDate(0, 14, 0),
    end_time: getRelativeDate(0, 15, 15),
    status: 'pending_payment',
    notes: 'First visit',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    customer: demoCustomers[1],
    therapist: demoTherapists[1],
    room: demoRooms[0],
    service: demoServices[1],
  },
  {
    id: 'e1000000-0000-0000-0000-000000000003',
    customer_id: 'd1000000-0000-0000-0000-000000000001',
    therapist_id: 'b1000000-0000-0000-0000-000000000003',
    room_id: 'c1000000-0000-0000-0000-000000000004',
    service_id: 'a1000000-0000-0000-0000-000000000003',
    start_time: getRelativeDate(1, 11, 0),
    end_time: getRelativeDate(1, 12, 30),
    status: 'confirmed',
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    customer: demoCustomers[0],
    therapist: demoTherapists[2],
    room: demoRooms[3],
    service: demoServices[2],
  },
  {
    id: 'e1000000-0000-0000-0000-000000000004',
    customer_id: 'd1000000-0000-0000-0000-000000000003',
    therapist_id: 'b1000000-0000-0000-0000-000000000004',
    room_id: 'c1000000-0000-0000-0000-000000000003',
    service_id: 'a1000000-0000-0000-0000-000000000004',
    start_time: getRelativeDate(0, 9, 0),
    end_time: getRelativeDate(0, 9, 45),
    status: 'confirmed',
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    customer: demoCustomers[2],
    therapist: demoTherapists[3],
    room: demoRooms[2],
    service: demoServices[3],
  },
  {
    id: 'e1000000-0000-0000-0000-000000000005',
    customer_id: 'd1000000-0000-0000-0000-000000000004',
    therapist_id: 'b1000000-0000-0000-0000-000000000001',
    room_id: 'c1000000-0000-0000-0000-000000000002',
    service_id: 'a1000000-0000-0000-0000-000000000006',
    start_time: getRelativeDate(0, 15, 0),
    end_time: getRelativeDate(0, 16, 0),
    status: 'confirmed',
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    customer: demoCustomers[3],
    therapist: demoTherapists[0],
    room: demoRooms[1],
    service: demoServices[5],
  },
  {
    id: 'e1000000-0000-0000-0000-000000000006',
    customer_id: 'd1000000-0000-0000-0000-000000000002',
    therapist_id: 'b1000000-0000-0000-0000-000000000003',
    room_id: 'c1000000-0000-0000-0000-000000000001',
    service_id: 'a1000000-0000-0000-0000-000000000005',
    start_time: getRelativeDate(2, 16, 0),
    end_time: getRelativeDate(2, 17, 0),
    status: 'pending_payment',
    notes: 'Anniversary gift',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    customer: demoCustomers[1],
    therapist: demoTherapists[2],
    room: demoRooms[0],
    service: demoServices[4],
  },
  {
    id: 'e1000000-0000-0000-0000-000000000007',
    customer_id: 'd1000000-0000-0000-0000-000000000003',
    therapist_id: 'b1000000-0000-0000-0000-000000000002',
    room_id: 'c1000000-0000-0000-0000-000000000004',
    service_id: 'a1000000-0000-0000-0000-000000000001',
    start_time: getRelativeDate(1, 15, 30),
    end_time: getRelativeDate(1, 16, 30),
    status: 'confirmed',
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    customer: demoCustomers[2],
    therapist: demoTherapists[1],
    room: demoRooms[3],
    service: demoServices[0],
  },
];

export const demoPayments: Payment[] = [
  { id: 'f1', booking_id: 'e1000000-0000-0000-0000-000000000001', amount: 350, currency: 'ILS', status: 'completed', provider: 'mock', provider_payment_id: 'mock_1', payment_url: null, paid_at: '2024-01-15T10:00:00Z', created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id: 'f2', booking_id: 'e1000000-0000-0000-0000-000000000002', amount: 450, currency: 'ILS', status: 'pending', provider: 'mock', provider_payment_id: 'mock_2', payment_url: '#', paid_at: null, created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id: 'f3', booking_id: 'e1000000-0000-0000-0000-000000000003', amount: 500, currency: 'ILS', status: 'completed', provider: 'mock', provider_payment_id: 'mock_3', payment_url: null, paid_at: '2024-01-16T11:00:00Z', created_at: '2024-01-16', updated_at: '2024-01-16' },
  { id: 'f4', booking_id: 'e1000000-0000-0000-0000-000000000004', amount: 280, currency: 'ILS', status: 'completed', provider: 'mock', provider_payment_id: 'mock_4', payment_url: null, paid_at: '2024-01-16T09:00:00Z', created_at: '2024-01-16', updated_at: '2024-01-16' },
  { id: 'f5', booking_id: 'e1000000-0000-0000-0000-000000000006', amount: 650, currency: 'ILS', status: 'pending', provider: 'mock', provider_payment_id: 'mock_5', payment_url: '#', paid_at: null, created_at: '2024-01-17', updated_at: '2024-01-17' },
];

// Demo available slots for booking form
export function getDemoSlots(date: string) {
  return [
    { start_time: `${date}T09:00:00+03:00`, end_time: `${date}T10:00:00+03:00`, therapist_id: 'b1000000-0000-0000-0000-000000000001', room_id: 'c1000000-0000-0000-0000-000000000002', therapist_name: 'Dana Cohen', room_name: 'Harmony Room' },
    { start_time: `${date}T09:00:00+03:00`, end_time: `${date}T10:00:00+03:00`, therapist_id: 'b1000000-0000-0000-0000-000000000002', room_id: 'c1000000-0000-0000-0000-000000000001', therapist_name: 'Yael Levy', room_name: 'Serenity Room' },
    { start_time: `${date}T10:00:00+03:00`, end_time: `${date}T11:00:00+03:00`, therapist_id: 'b1000000-0000-0000-0000-000000000001', room_id: 'c1000000-0000-0000-0000-000000000002', therapist_name: 'Dana Cohen', room_name: 'Harmony Room' },
    { start_time: `${date}T10:30:00+03:00`, end_time: `${date}T11:30:00+03:00`, therapist_id: 'b1000000-0000-0000-0000-000000000003', room_id: 'c1000000-0000-0000-0000-000000000004', therapist_name: 'Noam Ben-David', room_name: 'Lotus Room' },
    { start_time: `${date}T11:00:00+03:00`, end_time: `${date}T12:00:00+03:00`, therapist_id: 'b1000000-0000-0000-0000-000000000002', room_id: 'c1000000-0000-0000-0000-000000000001', therapist_name: 'Yael Levy', room_name: 'Serenity Room' },
    { start_time: `${date}T13:00:00+03:00`, end_time: `${date}T14:00:00+03:00`, therapist_id: 'b1000000-0000-0000-0000-000000000001', room_id: 'c1000000-0000-0000-0000-000000000002', therapist_name: 'Dana Cohen', room_name: 'Harmony Room' },
    { start_time: `${date}T14:00:00+03:00`, end_time: `${date}T15:00:00+03:00`, therapist_id: 'b1000000-0000-0000-0000-000000000003', room_id: 'c1000000-0000-0000-0000-000000000004', therapist_name: 'Noam Ben-David', room_name: 'Lotus Room' },
    { start_time: `${date}T15:00:00+03:00`, end_time: `${date}T16:00:00+03:00`, therapist_id: 'b1000000-0000-0000-0000-000000000004', room_id: 'c1000000-0000-0000-0000-000000000003', therapist_name: 'Maya Rosen', room_name: 'Zen Room' },
    { start_time: `${date}T16:00:00+03:00`, end_time: `${date}T17:00:00+03:00`, therapist_id: 'b1000000-0000-0000-0000-000000000002', room_id: 'c1000000-0000-0000-0000-000000000001', therapist_name: 'Yael Levy', room_name: 'Serenity Room' },
  ];
}

export const demoConversations = [
  {
    id: 'conv-1',
    customer_id: 'd1000000-0000-0000-0000-000000000001',
    channel: 'whatsapp' as const,
    external_id: '+972521111111',
    status: 'active' as const,
    assigned_to: null,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:05:00Z',
    customer: { name: 'Sarah Green', phone: '+972521111111' },
  },
  {
    id: 'conv-2',
    customer_id: 'd1000000-0000-0000-0000-000000000002',
    channel: 'web' as const,
    external_id: 'session-abc123',
    status: 'handed_off' as const,
    assigned_to: null,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:10:00Z',
    customer: { name: 'David Katz', phone: '+972522222222' },
  },
  {
    id: 'conv-3',
    customer_id: 'd1000000-0000-0000-0000-000000000003',
    channel: 'whatsapp' as const,
    external_id: '+972523333333',
    status: 'active' as const,
    assigned_to: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:03:00Z',
    customer: { name: 'Noa Friedman', phone: '+972523333333' },
  },
];

export const demoMessages = {
  'conv-1': [
    { id: 'm1', thread_id: 'conv-1', role: 'customer' as const, content: 'Hi! I would like to book a Swedish massage for next week', metadata: null, created_at: '2024-01-15T08:00:00Z' },
    { id: 'm2', thread_id: 'conv-1', role: 'assistant' as const, content: "I'd be happy to help you book a Swedish massage! What date works best for you next week?", metadata: null, created_at: '2024-01-15T08:01:00Z' },
    { id: 'm3', thread_id: 'conv-1', role: 'customer' as const, content: 'Tuesday morning would be great', metadata: null, created_at: '2024-01-15T08:03:00Z' },
    { id: 'm4', thread_id: 'conv-1', role: 'assistant' as const, content: 'I found several available slots for Tuesday:\n\n• 09:00 with Dana Cohen\n• 10:00 with Dana Cohen\n• 11:00 with Yael Levy\n\nWhich time works best for you?', metadata: null, created_at: '2024-01-15T08:04:00Z' },
  ],
  'conv-2': [
    { id: 'm5', thread_id: 'conv-2', role: 'customer' as const, content: 'I need to reschedule my deep tissue appointment', metadata: null, created_at: '2024-01-15T09:00:00Z' },
    { id: 'm6', thread_id: 'conv-2', role: 'assistant' as const, content: "I can help with that! Could you share the date of your current booking so I can look it up?", metadata: null, created_at: '2024-01-15T09:01:00Z' },
    { id: 'm7', thread_id: 'conv-2', role: 'customer' as const, content: 'It was booked for this Thursday at 2pm but I need to speak to someone about billing', metadata: null, created_at: '2024-01-15T09:05:00Z' },
    { id: 'm8', thread_id: 'conv-2', role: 'system' as const, content: 'Conversation handed off to staff', metadata: null, created_at: '2024-01-15T09:06:00Z' },
  ],
  'conv-3': [
    { id: 'm9', thread_id: 'conv-3', role: 'customer' as const, content: 'How much is a facial treatment?', metadata: null, created_at: '2024-01-15T10:00:00Z' },
    { id: 'm10', thread_id: 'conv-3', role: 'assistant' as const, content: 'Our Facial Treatment is ₪280 for a 45-minute session. It includes deep cleansing and hydrating. Would you like to book one?', metadata: null, created_at: '2024-01-15T10:01:00Z' },
  ],
};
