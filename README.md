# Subscription Manager

An app that automatically scans your Gmail for subscription receipts, extracts pricing and renewal dates, and emails you before anything renews — no manual entry required.

**Live demo:** https://subcriptionmanagershaunak.vercel.app/
**Backend API:** https://subcription-manager-2oez.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time can take 20–30 seconds to wake up — this is expected, not a bug.

> Known limitation: login uses a cross-domain cookie between the frontend (Vercel) and backend (Render). This works correctly in Chrome and most browsers, but Firefox's Enhanced Tracking Protection blocks third-party cookies by default, which can prevent login unless tracking protection is relaxed for the site.

---

## What it does

1. Signs in with Google (read-only Gmail access, via OAuth2)
2. Scans the inbox for subscription-related emails (receipts, renewal notices, billing confirmations)
3. Parses each email to extract the service name, amount, and renewal date
4. Saves the data to a database, updating existing subscriptions instead of duplicating them
5. Runs a daily background job that checks for renewals coming up in the next 3 days and sends a summary email alert
6. Displays everything on a dashboard with renewal-urgency indicators and the ability to cancel tracking for a subscription

---

## Architecture

```
React (Vite) frontend  --HTTPS-->  Express API  --JWT auth-->  protected routes
                                        |
                                        |--- Google OAuth2 (Gmail read-only scope)
                                        |--- MongoDB Atlas (Users, Subscriptions)
                                        |--- BullMQ + Upstash Redis (background job queue)
                                        |         |
                                        |         --- Daily job: scan inbox, detect upcoming renewals
                                        |
                                        --- Nodemailer (SMTP) --> renewal alert emails
```

## Tech stack

- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)
- **Background jobs:** BullMQ + Upstash Redis
- **Auth:** Google OAuth2 (Gmail access) + JWT (app sessions)
- **Email:** Nodemailer over Gmail SMTP
- **Testing:** Jest (unit tests on the email-parsing engine)
- **Deployment:** Vercel (frontend), Render (backend)

## Key engineering decisions

- **Background job queue over a simple cron script** — email fetching and renewal-checking are separate BullMQ jobs, so a slow Gmail API call never blocks the alert-sending job or the API itself.
- **Encrypted token storage** — Google refresh tokens are AES-256 encrypted before being saved to MongoDB, never stored in plain text.
- **Read-only Gmail scope** — the app requests `gmail.readonly` only; it can never send, delete, or modify anything in a user's inbox.
- **Graceful parsing failures** — when an email can't be confidently parsed (no amount or date found), it's saved with a `needs_review` status instead of being dropped or guessed at incorrectly.
- **Deduplication by user + service** — re-processing an inbox updates the existing subscription's renewal date rather than creating duplicate entries each time a new receipt arrives.

---

## Running locally

### Prerequisites
- Node.js 20+
- A MongoDB Atlas account (free tier)
- A Google Cloud project with the Gmail API enabled
- An Upstash Redis database (free tier)
- A Gmail account with an App Password for sending alert emails

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/smbcode/subcription-manager.git
   cd subcription-manager
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create `backend/.env` with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
   JWT_SECRET=your_random_secret
   ENCRYPTION_KEY=your_random_secret
   REDIS_URL=your_upstash_redis_url
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_gmail_address
   SMTP_PASS=your_gmail_app_password
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the backend:
   ```bash
   node server.js
   ```

5. In a separate terminal, start the background worker:
   ```bash
   node workers/renewalWorker.js
   ```

6. Install and start the frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

7. Visit `http://localhost:5173`

### Running tests

```bash
cd backend
npx jest
```

---

## Project structure

```
subscription-manager/
├── backend/
│   ├── config/          # Redis connection setup
│   ├── middleware/       # JWT auth middleware
│   ├── models/            # Mongoose schemas (User, Subscription)
│   ├── queues/            # BullMQ queue definitions
│   ├── routes/            # Express routes (auth, subscriptions, user)
│   ├── services/          # Email fetching, parsing, and mailer logic
│   ├── workers/           # Background job worker
│   └── server.js
└── frontend/
    └── src/
        ├── components/     # Navbar
        └── pages/          # Login, Dashboard
```

---

## Roadmap / things I'd add next

- Move auth from cookies to `Authorization: Bearer` headers to avoid cross-browser cookie restrictions
- Category tagging for subscriptions (streaming, software, fitness, etc.)
- Manual "re-sync inbox" button on the dashboard
- GitHub Actions to run tests automatically on every push
