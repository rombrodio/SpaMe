# SpaMe — Spa Management System

Production-minded V1 web app for a spa in Tel Aviv. Replaces Biz-Online with custom software focused on scheduling, AI chatbot (WhatsApp + website), payments via hosted payment links, and therapist/room management.

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/            # Admin panel (auth-protected)
│   │   ├── dashboard/      # Overview stats
│   │   ├── calendar/       # Day/week calendar with booking creation
│   │   ├── bookings/       # Booking list with filters
│   │   ├── services/       # Service CRUD
│   │   ├── therapists/     # Therapist CRUD + availability + time-off
│   │   ├── rooms/          # Room CRUD
│   │   ├── customers/      # Customer search/CRUD
│   │   ├── payments/       # Payment status dashboard
│   │   └── inbox/          # Staff conversation inbox
│   ├── book/               # Public customer booking flow
│   ├── login/              # Authentication
│   └── api/
│       ├── webhooks/payment/    # Payment webhook (source of truth)
│       ├── webhooks/whatsapp/   # WhatsApp Business Cloud API
│       ├── chat/                # Website chat endpoint
│       └── cron/reminders/      # Booking reminder cron
├── components/
│   ├── ui/                 # UI primitives (Button, Card, Dialog, etc.)
│   ├── layout/             # Sidebar, header, nav
│   ├── calendar/           # Calendar day/week views
│   └── bookings/           # Booking form, detail panel
├── lib/
│   ├── supabase/           # Client helpers (browser, server, admin)
│   ├── services/           # Business logic layer
│   │   ├── availability.ts # Slot computation engine
│   │   ├── booking.ts      # Booking CRUD with constraint checks
│   │   ├── payment.ts      # Payment orchestration
│   │   ├── conversation.ts # Chat thread management
│   │   └── audit.ts        # Audit logging
│   ├── ai/
│   │   ├── orchestrator.ts # AI message processing
│   │   ├── tools.ts        # 6 approved AI tools
│   │   └── prompts.ts      # System prompt
│   ├── adapters/
│   │   ├── payment/        # Payment provider abstraction + mock
│   │   └── whatsapp/       # WhatsApp adapter + mock
│   ├── actions/            # Server Actions for UI
│   ├── schemas/            # Zod validation schemas
│   ├── types/              # TypeScript type definitions
│   ├── constants.ts        # Timezone, currency, etc.
│   └── utils.ts            # Formatting utilities
supabase/
├── migrations/
│   └── 001_initial_schema.sql  # Full schema (14 tables)
└── seed.sql                    # Demo data
```

### Key Design Decisions

- **SQL migrations** (not Prisma) — raw `.sql` files for full control, native to Supabase
- **Service layer** — all business logic in `lib/services/`, never in UI components
- **Adapter pattern** — payment & WhatsApp have interfaces with mock implementations; real providers plug in without changing app code
- **Server Actions** for UI mutations, **Route Handlers** for webhooks
- **Database-level overlap prevention** — trigger functions prevent double-booking even if app logic has a race condition
- **AI guardrails** — the chatbot can only call 6 approved tools, never writes to DB directly

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- Supabase CLI (for local Supabase) or a Supabase project

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials. For local dev with mock adapters, the payment and WhatsApp vars can stay empty.

### 3. Run migrations

**With Supabase CLI (local):**

```bash
supabase start
supabase db reset  # runs migrations + seed
```

**With remote Supabase:**

Copy the SQL from `supabase/migrations/001_initial_schema.sql` into the Supabase SQL editor and run it. Then run `supabase/seed.sql`.

### 4. Seed data

Seed data is in `supabase/seed.sql`. It creates:
- 6 services (Swedish Massage, Deep Tissue, Hot Stone, Facial, Couples, Aromatherapy)
- 4 therapists with qualifications and weekly schedules
- 4 rooms with service compatibility
- 2 sample customers
- 3 sample bookings

### 5. Create admin user

In the Supabase dashboard, create a user under Authentication > Users. Use this email/password to log in.

### 6. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `PAYMENT_PROVIDER` | No | `mock` (default) or provider name |
| `PAYMENT_PROVIDER_API_KEY` | No | Payment provider API key |
| `WHATSAPP_PHONE_NUMBER_ID` | No | WhatsApp Business phone number ID |
| `WHATSAPP_ACCESS_TOKEN` | No | WhatsApp Business access token |
| `WHATSAPP_VERIFY_TOKEN` | No | WhatsApp webhook verify token |
| `OPENAI_API_KEY` | No | For AI chatbot (future LLM integration) |
| `NEXT_PUBLIC_APP_URL` | No | App URL (default: http://localhost:3000) |

## Main Flows

### Admin: Create a booking
1. Go to Calendar → click "New Booking"
2. Select service, date → see available slots
3. Pick a slot (shows therapist + room)
4. Select customer → create booking

### Customer: Public booking
1. Visit `/book`
2. Choose service → date → time slot → enter contact info
3. Redirected to payment page
4. After payment, booking confirmed automatically

### Payment webhook
- `POST /api/webhooks/payment` — receives payment confirmations
- Updates payment record + booking status (pending_payment → confirmed)
- Mock provider auto-confirms for local dev

### WhatsApp chatbot
- `GET /api/webhooks/whatsapp` — webhook verification
- `POST /api/webhooks/whatsapp` — incoming messages
- AI responds with availability, booking help, or hands off to staff

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

For booking reminders, add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 5 * * *"
  }]
}
```

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migration SQL in SQL Editor
3. Run seed SQL
4. Create an admin user in Authentication > Users
5. Copy URL + anon key + service role key to env vars

## Configure WhatsApp Webhook URLs

1. In Meta Developer Console, set webhook URL to: `https://your-domain.com/api/webhooks/whatsapp`
2. Set verify token to match `WHATSAPP_VERIFY_TOKEN`
3. Subscribe to `messages` webhook field

## Defaults

- **Timezone**: Asia/Jerusalem
- **Currency**: ILS (Israeli Shekel)
- **Slot granularity**: 15 minutes
- **Business hours**: 09:00–21:00 (per therapist schedule)
