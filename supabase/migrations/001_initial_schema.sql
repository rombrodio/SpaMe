-- SpaMe Initial Schema
-- Timezone: Asia/Jerusalem | Currency: ILS

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. SERVICES
-- ============================================
create table services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(10,2) not null check (price >= 0),
  color text default '#6366f1', -- for calendar display
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 2. THERAPISTS
-- ============================================
create table therapists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique,
  phone text,
  bio text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 3. ROOMS
-- ============================================
create table rooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 4. THERAPIST ↔ SERVICE (many-to-many)
-- ============================================
create table therapist_services (
  id uuid primary key default uuid_generate_v4(),
  therapist_id uuid not null references therapists(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  unique (therapist_id, service_id)
);

-- ============================================
-- 5. ROOM ↔ SERVICE (many-to-many)
-- ============================================
create table room_services (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references rooms(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  unique (room_id, service_id)
);

-- ============================================
-- 6. THERAPIST AVAILABILITY RULES
-- Recurring weekly schedule
-- ============================================
create table therapist_availability_rules (
  id uuid primary key default uuid_generate_v4(),
  therapist_id uuid not null references therapists(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday
  start_time time not null,
  end_time time not null,
  check (start_time < end_time)
);

-- ============================================
-- 7. THERAPIST TIME OFF
-- One-off or multi-day blocks
-- ============================================
create table therapist_time_off (
  id uuid primary key default uuid_generate_v4(),
  therapist_id uuid not null references therapists(id) on delete cascade,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  reason text,
  check (start_datetime < end_datetime),
  created_at timestamptz not null default now()
);

-- ============================================
-- 8. ROOM BLOCKS
-- Maintenance, closures, etc.
-- ============================================
create table room_blocks (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references rooms(id) on delete cascade,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  reason text,
  check (start_datetime < end_datetime),
  created_at timestamptz not null default now()
);

-- ============================================
-- 9. CUSTOMERS
-- ============================================
create table customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_phone on customers(phone);
create index idx_customers_email on customers(email);

-- ============================================
-- 10. BOOKINGS
-- ============================================
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete restrict,
  therapist_id uuid not null references therapists(id) on delete restrict,
  room_id uuid not null references rooms(id) on delete restrict,
  service_id uuid not null references services(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index idx_bookings_therapist_time on bookings(therapist_id, start_time, end_time);
create index idx_bookings_room_time on bookings(room_id, start_time, end_time);
create index idx_bookings_customer on bookings(customer_id);
create index idx_bookings_status on bookings(status);

-- ============================================
-- 11. PAYMENTS
-- ============================================
create table payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete restrict,
  amount numeric(10,2) not null check (amount > 0),
  currency text not null default 'ILS',
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'refunded')),
  provider text not null default 'mock', -- payment provider name
  provider_payment_id text, -- external payment ID
  payment_url text, -- hosted payment page URL
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payments_booking on payments(booking_id);
create index idx_payments_provider_id on payments(provider_payment_id);

-- ============================================
-- 12. CONVERSATION THREADS
-- ============================================
create table conversation_threads (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete set null,
  channel text not null check (channel in ('whatsapp', 'web')),
  external_id text, -- WhatsApp phone number or web session ID
  status text not null default 'active'
    check (status in ('active', 'handed_off', 'closed')),
  assigned_to text, -- staff member handling handoff
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_threads_external on conversation_threads(channel, external_id);

-- ============================================
-- 13. CONVERSATION MESSAGES
-- ============================================
create table conversation_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references conversation_threads(id) on delete cascade,
  role text not null check (role in ('customer', 'assistant', 'staff', 'system')),
  content text not null,
  metadata jsonb, -- tool calls, handoff info, etc.
  created_at timestamptz not null default now()
);

create index idx_messages_thread on conversation_messages(thread_id, created_at);

-- ============================================
-- 14. AUDIT LOG
-- ============================================
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null, -- 'booking', 'payment', etc.
  entity_id uuid not null,
  action text not null, -- 'created', 'updated', 'cancelled', etc.
  actor text, -- user email or 'system' or 'ai'
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_entity on audit_log(entity_type, entity_id);
create index idx_audit_created on audit_log(created_at);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_services_updated before update on services
  for each row execute function update_updated_at();
create trigger trg_therapists_updated before update on therapists
  for each row execute function update_updated_at();
create trigger trg_rooms_updated before update on rooms
  for each row execute function update_updated_at();
create trigger trg_customers_updated before update on customers
  for each row execute function update_updated_at();
create trigger trg_bookings_updated before update on bookings
  for each row execute function update_updated_at();
create trigger trg_payments_updated before update on payments
  for each row execute function update_updated_at();
create trigger trg_threads_updated before update on conversation_threads
  for each row execute function update_updated_at();

-- ============================================
-- OVERLAP PREVENTION (database-level safety net)
-- ============================================

-- Prevent overlapping therapist bookings (active statuses only)
create or replace function check_therapist_overlap()
returns trigger as $$
begin
  if new.status in ('cancelled', 'no_show') then
    return new;
  end if;
  if exists (
    select 1 from bookings
    where therapist_id = new.therapist_id
      and id != coalesce(new.id, uuid_generate_v4())
      and status not in ('cancelled', 'no_show')
      and start_time < new.end_time
      and end_time > new.start_time
  ) then
    raise exception 'Therapist has an overlapping booking';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_check_therapist_overlap
  before insert or update on bookings
  for each row execute function check_therapist_overlap();

-- Prevent overlapping room bookings (active statuses only)
create or replace function check_room_overlap()
returns trigger as $$
begin
  if new.status in ('cancelled', 'no_show') then
    return new;
  end if;
  if exists (
    select 1 from bookings
    where room_id = new.room_id
      and id != coalesce(new.id, uuid_generate_v4())
      and status not in ('cancelled', 'no_show')
      and start_time < new.end_time
      and end_time > new.start_time
  ) then
    raise exception 'Room has an overlapping booking';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_check_room_overlap
  before insert or update on bookings
  for each row execute function check_room_overlap();
