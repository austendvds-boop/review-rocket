# Review Rocket - Next.js App Structure

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js v5 (Auth.js) with Google OAuth
- **Database:** Redis (Upstash)
- **State:** Zustand
- **UI:** shadcn/ui components
- **SMS:** Vtext (email-to-SMS)
- **Workflows:** n8n Cloud

## Folder Structure

```
reviewrocket-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── calendar/
│   │   │   └── sync/route.ts
│   │   ├── sms/
│   │   │   └── send/route.ts
│   │   └── review/
│   │       └── submit/route.ts
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── setup/
│   │       └── page.tsx
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── review/
│   │   └── [businessId]/
│   │       └── [appointmentId]/
│   │           └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # shadcn components
│   ├── auth/         # Auth components
│   ├── dashboard/    # Dashboard widgets
│   └── review/       # Review flow components
├── lib/
│   ├── auth.ts       # NextAuth config
│   ├── db.ts         # Redis client
│   ├── n8n.ts        # n8n API client
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useCalendar.ts
│   └── useReview.ts
├── types/
│   └── index.ts
└── public/
    └── images/
```

## Pages

### 1. Landing Page (/) ✅ Exists
- Hero section
- Feature grid
- CTA to login

### 2. Login (/login)
- Google OAuth button
- Simple, clean
- Redirect to /setup after auth

### 3. Business Setup (/setup)
- Google Places autocomplete for business name
- GMB ID auto-extraction
- Calendar connection (Google OAuth again)
- SMS timing settings (default: 24 hours)
- Save to Redis

### 4. Dashboard (/dashboard)
- Metrics cards:
  - Total reviews generated
  - 5-star conversion rate
  - SMS sent today
  - Average rating boost
- Recent appointments table
- Settings link

### 5. Review Page (/review/[businessId]/[appointmentId])
- Simple 1-5 star rating
- Mobile-optimized
- Two paths:
  - 5 stars → Redirect to GMB review link
  - 4 stars or below → "What can we do better?" form

### 6. Settings (/settings)
- Update GMB ID
- Change SMS timing
- Update business info
- View API keys

## Database Schema (Redis)

```typescript
// Business
interface Business {
  id: string;
  email: string;
  name: string;
  gmbId: string;
  gmbUrl: string; // Full Google My Business review URL
  calendarConnected: boolean;
  smsDelayHours: number; // default: 24
  createdAt: string;
}

// Appointment
interface Appointment {
  id: string;
  businessId: string;
  customerPhone: string;
  customerName?: string;
  appointmentTime: string;
  status: 'pending' | 'sms_sent' | 'responded';
  smsSentAt?: string;
  createdAt: string;
}

// Review Response
interface ReviewResponse {
  id: string;
  appointmentId: string;
  businessId: string;
  rating: number; // 1-5
  feedback?: string; // for 4-star or below
  action: 'google_review' | 'promo_code';
  createdAt: string;
}

// SMS Job (for scheduling)
interface SMSJob {
  id: string;
  appointmentId: string;
  businessId: string;
  phoneNumber: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
}
```

## n8n Workflows (to implement)

### Workflow 1: Calendar Sync
- Trigger: Cron (every 5 min) OR webhook from Google Calendar
- Fetch new appointments
- Parse phone numbers
- Create SMS jobs in Redis
- Mark appointments as synced

### Workflow 2: SMS Scheduler
- Trigger: Cron (every 5 min)
- Query pending SMS jobs where scheduledTime <= now
- Send SMS via Vtext (email to phone@vtext.com)
- Update job status to 'sent'
- Create tracking record

### Workflow 3: Review Submission
- Trigger: Webhook from /api/review/submit
- Store review response
- Route: 5-star → GMB redirect, 4-star or below → feedback form
- Send notification to business (optional)

### Workflow 4: Metrics Aggregation
- Trigger: Cron (hourly)
- Aggregate review data per business
- Store in Redis cache for dashboard

## Environment Variables

```env
# NextAuth
NEXTAUTH_URL=https://reviewrocket-app.vercel.app
NEXTAUTH_SECRET=random_string_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Redis (Upstash)
REDIS_URL=rediss://default:...@...-36367.upstash.io:36367

# n8n
N8N_WEBHOOK_URL=https://n8n.cloud/webhook/...
N8N_API_KEY=...

# Vtext (use ProtonMail or Gmail SMTP)
SMTP_HOST=smtp.protonmail.ch
SMTP_PORT=587
SMTP_USER=reviewrocket@protonmail.com
SMTP_PASSWORD=...
```

## Key Features to Build

1. ✅ Landing page (exists)
2. ✅ Google OAuth (NextAuth)
3. ✅ Google Places autocomplete (business setup)
4. ✅ GMB ID extraction
5. ✅ Calendar connection
6. ✅ SMS scheduling (n8n)
7. ✅ Rating page (1-5 stars)
8. ✅ GMB routing (5-star)
9. ✅ Feedback form (4-star or below)
10. ✅ Dashboard with metrics

## Design System

- **Colors:** Slate/gray primary, indigo accent
- **Typography:** Inter font
- **Components:** shadcn/ui (Button, Card, Input, Select, etc.)
- **Animations:** Framer Motion for smooth transitions
- **Mobile:** Fully responsive, mobile-first

## Next Steps

1. Initialize Next.js project
2. Install dependencies (NextAuth, Tailwind, shadcn, Redis)
3. Build auth system
4. Build business setup page
5. Build dashboard
6. Build rating page
7. Connect n8n workflows
8. Test end-to-end
9. Deploy

---

**Status:** Ready to build. Starting with project initialization.
