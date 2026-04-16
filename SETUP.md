# GatePass — Setup Guide

## 1. Create a Supabase Project

1. Go to https://supabase.com and sign up (free)
2. Click **New project** → choose a name (e.g. `gatepass`) → set a database password → click Create
3. Wait ~2 minutes for the project to spin up

## 2. Run the Database Schema

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste the entire contents of `supabase/schema.sql`
4. Click **Run** (green button)

This creates all tables, indexes, Row Level Security policies, and seeds 12 sample houses.

## 3. Get your API keys

1. In the dashboard, go to **Project Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public** key (long string starting with `eyJ...`)

## 4. Configure your .env file

Edit the `.env` file in the project root:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. Enable Email Auth (disable email confirmation for dev)

1. In Supabase: **Authentication → Providers → Email**
2. Make sure Email is **enabled**
3. For development, turn OFF **"Confirm email"** so you can register without clicking an email link

## 6. Run the app

```bash
npm run dev
```

Open http://localhost:5173

## 7. Create your first Admin account

1. Open the app → click **Register / Login** → **Register here**
2. Fill in your name, email, password
3. Select role: **Admin**
4. After registering, go to Supabase **Table Editor → users** and verify your row
5. (If email confirmation is on, check your inbox first)

## Folder Structure

```
src/
  pages/         Landing, RoleSelect, Register, Login,
                 VisitorForm, VisitorQR,
                 AdminDashboard, OwnerDashboard, SecurityDashboard
  components/    Navbar, ProtectedRoute, VisitorCard, QRCodeDisplay,
                 ShiftFilter, NotificationBadge, QRScanner, LoadingSpinner
  context/       AuthContext.jsx
  supabase/      config.js, auth.js, db.js
  routes/        AppRouter.jsx
supabase/
  schema.sql     ← Run this in Supabase SQL Editor
```

## Adding more houses

Run in Supabase SQL Editor:
```sql
INSERT INTO houses (house_number, block) VALUES ('101', 'E');
```

## Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React 19 + Vite               |
| Styling   | Tailwind CSS v3               |
| Database  | Supabase (PostgreSQL)         |
| Auth      | Supabase Auth (email/password)|
| Storage   | Supabase Storage              |
| Real-time | Supabase Realtime (postgres_changes) |
| QR Gen    | qrcode npm                    |
| QR Scan   | html5-qrcode                  |
| Icons     | lucide-react                  |
| Toasts    | react-toastify                |
