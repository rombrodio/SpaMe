-- SpaMe Seed Data
-- Demo data for local development

-- Services
insert into services (id, name, description, duration_minutes, price, color) values
  ('a1000000-0000-0000-0000-000000000001', 'Swedish Massage', 'Full body relaxation massage', 60, 350.00, '#6366f1'),
  ('a1000000-0000-0000-0000-000000000002', 'Deep Tissue Massage', 'Intense muscle relief massage', 75, 450.00, '#ec4899'),
  ('a1000000-0000-0000-0000-000000000003', 'Hot Stone Therapy', 'Heated basalt stones for deep relaxation', 90, 500.00, '#f59e0b'),
  ('a1000000-0000-0000-0000-000000000004', 'Facial Treatment', 'Cleansing and hydrating facial', 45, 280.00, '#10b981'),
  ('a1000000-0000-0000-0000-000000000005', 'Couples Massage', 'Side-by-side relaxation for two', 60, 650.00, '#ef4444'),
  ('a1000000-0000-0000-0000-000000000006', 'Aromatherapy', 'Essential oil massage therapy', 60, 380.00, '#8b5cf6');

-- Therapists
insert into therapists (id, name, email, phone, bio) values
  ('b1000000-0000-0000-0000-000000000001', 'Dana Cohen', 'dana@spame.co.il', '+972501234567', 'Certified massage therapist with 8 years of experience'),
  ('b1000000-0000-0000-0000-000000000002', 'Yael Levy', 'yael@spame.co.il', '+972501234568', 'Specializes in deep tissue and sports massage'),
  ('b1000000-0000-0000-0000-000000000003', 'Noam Ben-David', 'noam@spame.co.il', '+972501234569', 'Hot stone and aromatherapy specialist'),
  ('b1000000-0000-0000-0000-000000000004', 'Maya Rosen', 'maya@spame.co.il', '+972501234570', 'Facial treatment expert and skincare specialist');

-- Rooms
insert into rooms (id, name, description) values
  ('c1000000-0000-0000-0000-000000000001', 'Serenity Room', 'Large room with ambient lighting, fits couples'),
  ('c1000000-0000-0000-0000-000000000002', 'Harmony Room', 'Standard treatment room with shower'),
  ('c1000000-0000-0000-0000-000000000003', 'Zen Room', 'Compact room for facials and short treatments'),
  ('c1000000-0000-0000-0000-000000000004', 'Lotus Room', 'Premium room with private garden view');

-- Therapist Services (who can do what)
insert into therapist_services (therapist_id, service_id) values
  -- Dana: Swedish, Deep Tissue, Aromatherapy
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006'),
  -- Yael: Swedish, Deep Tissue, Couples
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005'),
  -- Noam: Hot Stone, Aromatherapy, Swedish
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001'),
  -- Maya: Facial, Aromatherapy
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006');

-- Room Services (which rooms support which services)
insert into room_services (room_id, service_id) values
  -- Serenity: All services including couples
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006'),
  -- Harmony: Massage services
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006'),
  -- Zen: Facials and aromatherapy
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006'),
  -- Lotus: Everything except couples
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006');

-- Therapist Availability Rules (Sunday=0 through Saturday=6)
-- Israel work week: Sunday-Thursday, some Friday mornings
-- Dana: Sun-Thu 09:00-17:00
insert into therapist_availability_rules (therapist_id, day_of_week, start_time, end_time) values
  ('b1000000-0000-0000-0000-000000000001', 0, '09:00', '17:00'),
  ('b1000000-0000-0000-0000-000000000001', 1, '09:00', '17:00'),
  ('b1000000-0000-0000-0000-000000000001', 2, '09:00', '17:00'),
  ('b1000000-0000-0000-0000-000000000001', 3, '09:00', '17:00'),
  ('b1000000-0000-0000-0000-000000000001', 4, '09:00', '17:00');

-- Yael: Sun-Thu 11:00-20:00
insert into therapist_availability_rules (therapist_id, day_of_week, start_time, end_time) values
  ('b1000000-0000-0000-0000-000000000002', 0, '11:00', '20:00'),
  ('b1000000-0000-0000-0000-000000000002', 1, '11:00', '20:00'),
  ('b1000000-0000-0000-0000-000000000002', 2, '11:00', '20:00'),
  ('b1000000-0000-0000-0000-000000000002', 3, '11:00', '20:00'),
  ('b1000000-0000-0000-0000-000000000002', 4, '11:00', '20:00');

-- Noam: Sun-Wed 10:00-18:00, Fri 09:00-13:00
insert into therapist_availability_rules (therapist_id, day_of_week, start_time, end_time) values
  ('b1000000-0000-0000-0000-000000000003', 0, '10:00', '18:00'),
  ('b1000000-0000-0000-0000-000000000003', 1, '10:00', '18:00'),
  ('b1000000-0000-0000-0000-000000000003', 2, '10:00', '18:00'),
  ('b1000000-0000-0000-0000-000000000003', 3, '10:00', '18:00'),
  ('b1000000-0000-0000-0000-000000000003', 5, '09:00', '13:00');

-- Maya: Sun-Thu 09:00-16:00
insert into therapist_availability_rules (therapist_id, day_of_week, start_time, end_time) values
  ('b1000000-0000-0000-0000-000000000004', 0, '09:00', '16:00'),
  ('b1000000-0000-0000-0000-000000000004', 1, '09:00', '16:00'),
  ('b1000000-0000-0000-0000-000000000004', 2, '09:00', '16:00'),
  ('b1000000-0000-0000-0000-000000000004', 3, '09:00', '16:00'),
  ('b1000000-0000-0000-0000-000000000004', 4, '09:00', '16:00');

-- Sample customer
insert into customers (id, name, email, phone) values
  ('d1000000-0000-0000-0000-000000000001', 'Sarah Green', 'sarah@example.com', '+972521111111'),
  ('d1000000-0000-0000-0000-000000000002', 'David Katz', 'david@example.com', '+972522222222');

-- Sample bookings (future dates — use relative offsets)
insert into bookings (id, customer_id, therapist_id, room_id, service_id, start_time, end_time, status) values
  ('e1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   now() + interval '1 day' + time '10:00' - current_time,
   now() + interval '1 day' + time '11:00' - current_time,
   'confirmed'),
  ('e1000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000002',
   now() + interval '2 days' + time '14:00' - current_time,
   now() + interval '2 days' + time '15:15' - current_time,
   'pending_payment'),
  ('e1000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000003',
   now() + interval '3 days' + time '11:00' - current_time,
   now() + interval '3 days' + time '12:30' - current_time,
   'confirmed');

-- Sample payments
insert into payments (booking_id, amount, currency, status, provider, paid_at) values
  ('e1000000-0000-0000-0000-000000000001', 350.00, 'ILS', 'completed', 'mock', now()),
  ('e1000000-0000-0000-0000-000000000002', 450.00, 'ILS', 'pending', 'mock', null),
  ('e1000000-0000-0000-0000-000000000003', 500.00, 'ILS', 'completed', 'mock', now());
