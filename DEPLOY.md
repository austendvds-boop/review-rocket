# Review Rocket - Deployment Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd reviewrocket-app
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

Required:
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `REDIS_URL` & `REDIS_TOKEN` - From Upstash
- `SMTP_*` - For Vtext SMS

### 3. Deploy to Vercel
```bash
vercel --prod
```

Or connect GitHub repo to Vercel for auto-deploy.

### 4. Set Environment Variables in Vercel
Go to Vercel Dashboard → Project Settings → Environment Variables
Add all variables from `.env.local`

### 5. Configure n8n Workflows

1. Log in to n8n Cloud (tronbot420)
2. Import workflows from `n8n/workflows/`:
   - `calendar-sync.json`
   - `sms-scheduler.json`
3. Configure Redis connection in n8n
4. Activate workflows

### 6. Test End-to-End
1. Visit `https://your-app.vercel.app`
2. Sign in with Google
3. Set up business (enter GMB ID)
4. Connect Google Calendar
5. Check that appointments sync
6. Wait for SMS (or manually trigger)
7. Click SMS link, submit review
8. Verify routing works

## Architecture

```
User (Business Owner)
  ↓
Google OAuth → NextAuth
  ↓
Setup Business (GMB ID, SMS delay)
  ↓
Connect Google Calendar
  ↓
n8n: Calendar Sync (every 5 min)
  ↓
Redis: Store appointments
  ↓
n8n: SMS Scheduler (every 5 min)
  ↓
Vtext: Send SMS to customer
  ↓
Customer clicks link
  ↓
Review Page (1-5 stars)
  ↓
API: Store response
  ↓
If 5-star → Redirect to GMB
If 4-star or below → Show promo code
```

## File Structure

```
reviewrocket-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth config
│   │   ├── business/route.ts        # Business CRUD
│   │   ├── calendar/sync/route.ts   # Google Calendar sync
│   │   └── review/submit/route.ts   # Review submission
│   ├── login/page.tsx               # Login page
│   ├── setup/page.tsx               # Business setup
│   ├── dashboard/page.tsx           # Dashboard
│   └── review/[businessId]/[appointmentId]/
│       └── page.tsx                 # Review form
├── lib/
│   └── db.ts                        # Redis client
├── n8n/
│   └── workflows/                   # n8n workflow JSONs
└── ...config files
```

## n8n Workflow Setup

### Workflow 1: Calendar Sync
- Trigger: Cron (every 5 minutes)
- Action: Fetch Google Calendar events
- Store: Appointments in Redis
- Trigger: SMS Scheduler

### Workflow 2: SMS Scheduler
- Trigger: Cron (every 5 minutes)
- Query: Pending SMS jobs from Redis
- Action: Send email to `phone@vtext.com`
- Update: Mark as sent in Redis

## Cost Breakdown

**Vercel:** Free tier (enough for MVP)
**Upstash Redis:** Free tier (10k requests/day)
**n8n Cloud:** Free tier (limited executions)
**Vtext SMS:** Free (Verizon email-to-SMS)
**Google OAuth:** Free

**Total:** $0/month for MVP

## Next Steps

1. [ ] Add Stripe billing
2. [ ] Add analytics dashboard
3. [ ] Add more SMS providers (Twilio fallback)
4. [ ] Add email review requests
5. [ ] Add follow-up SMS for non-responders

## Support

Built by Steve for Aust ❤️
