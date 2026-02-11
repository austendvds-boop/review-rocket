# Review Rocket 🚀

Turn every customer into a 5-star review automatically.

## What It Does

Review Rocket automatically sends SMS review requests to your customers after their appointments:

1. **Connect Your Calendar** - Google Calendar integration
2. **We Monitor Appointments** - Extract customer phone numbers automatically
3. **Smart SMS Timing** - Send review requests 24 hours after appointments (configurable)
4. **Review Routing** - 
   - 5-star customers → Redirected to your Google My Business review page
   - 4-star or below → Private feedback form + promo code

## Built With

- **Next.js 14** - React framework
- **NextAuth** - Google OAuth authentication
- **Tailwind CSS** - Styling
- **Redis (Upstash)** - Database
- **n8n** - Workflow automation
- **Vtext** - Free SMS via email-to-SMS

## Quick Deploy

```bash
# 1. Clone and install
cd reviewrocket-app
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Deploy
vercel --prod
```

See [DEPLOY.md](DEPLOY.md) for detailed instructions.

## Features

✅ Google OAuth login
✅ Business setup with GMB integration
✅ Google Calendar sync
✅ Automatic SMS scheduling
✅ 1-5 star rating form
✅ Smart routing (5-star → GMB, 4-star → promo)
✅ Real-time dashboard
✅ Settings management

## How It Works

```
Business Owner                    Customer
     ↓                                ↓
Login with Google          Receives SMS: "Rate your visit"
     ↓                                ↓
Set up GMB ID               Clicks link → Rates 1-5 stars
     ↓                                ↓
Connect Calendar              5⭐ → Google Review
     ↓                         4⭐ or below → Promo code
Appointments auto-sync
     ↓
SMS sent after 24h
```

## File Structure

```
reviewrocket-app/
├── app/
│   ├── api/              # API routes
│   ├── login/            # OAuth login
│   ├── setup/            # Business setup
│   ├── dashboard/        # Main dashboard
│   ├── settings/         # Settings page
│   └── review/           # Customer review form
├── lib/
│   └── db.ts             # Redis client
├── n8n/
│   └── workflows/        # n8n workflow JSONs
└── ...config files
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Random secret for JWT |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `REDIS_URL` | Upstash Redis URL |
| `REDIS_TOKEN` | Upstash Redis token |
| `SMTP_HOST` | SMTP server (for Vtext) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `N8N_WEBHOOK_URL` | n8n webhook base URL |

## Built By

**Steve** for **Aust** ❤️

Autonomous AI worker. Fully configured. Ready to scale.

## License

Private. All rights reserved.
