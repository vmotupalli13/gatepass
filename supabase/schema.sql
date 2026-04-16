-- =====================================================
-- GatePass — Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- =====================================================

-- 1. HOUSES (seed before users register)
CREATE TABLE houses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_number TEXT NOT NULL,
  block        TEXT NOT NULL,
  owner_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. USERS (profile table mirroring auth.users)
CREATE TABLE users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL CHECK (role IN ('admin','owner','security')),
  house_id   UUID REFERENCES houses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. VISITORS (temporary + frequent)
CREATE TABLE visitors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  photo_url   TEXT,
  purpose     TEXT NOT NULL,
  house_id    UUID REFERENCES houses(id) ON DELETE SET NULL,
  is_frequent BOOLEAN DEFAULT false,
  qr_token    UUID DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. VISITS (entry/exit log)
CREATE TABLE visits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id  UUID REFERENCES visitors(id) ON DELETE CASCADE,
  house_id    UUID REFERENCES houses(id) ON DELETE SET NULL,
  in_time     TIMESTAMPTZ DEFAULT now(),
  out_time    TIMESTAMPTZ,
  shift       TEXT CHECK (shift IN ('morning','night')),
  security_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','completed')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. NOTIFICATIONS
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_owner_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  from_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message       TEXT NOT NULL,
  read          BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES for common queries
-- =====================================================
CREATE INDEX idx_visits_house_id    ON visits(house_id);
CREATE INDEX idx_visits_visitor_id  ON visits(visitor_id);
CREATE INDEX idx_visits_in_time     ON visits(in_time DESC);
CREATE INDEX idx_visits_status      ON visits(status);
CREATE INDEX idx_visitors_house_id  ON visitors(house_id);
CREATE INDEX idx_notifications_owner ON notifications(to_owner_id, read);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can read all users"
  ON users FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can update any user"
  ON users FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- HOUSES policies
CREATE POLICY "Anyone authenticated can read houses"
  ON houses FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read houses (for visitor form)"
  ON houses FOR SELECT USING (true);

CREATE POLICY "Admin can manage houses"
  ON houses FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- VISITORS policies
CREATE POLICY "Public can insert visitors"
  ON visitors FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can read visitors"
  ON visitors FOR SELECT USING (true);

CREATE POLICY "Owner can update their house visitors"
  ON visitors FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('owner', 'admin', 'security')
  );

-- VISITS policies
CREATE POLICY "Security can insert visits"
  ON visits FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('security', 'admin')
  );

CREATE POLICY "Security can update visits"
  ON visits FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('security', 'admin')
  );

CREATE POLICY "Security and admin can read all visits"
  ON visits FOR SELECT USING (
    get_user_role(auth.uid()) IN ('security', 'admin')
  );

CREATE POLICY "Owner can read own house visits"
  ON visits FOR SELECT USING (
    get_user_role(auth.uid()) = 'owner' AND
    house_id = (SELECT house_id FROM users WHERE id = auth.uid())
  );

-- NOTIFICATIONS policies
CREATE POLICY "Admin can insert notifications"
  ON notifications FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Owner can read own notifications"
  ON notifications FOR SELECT USING (to_owner_id = auth.uid());

CREATE POLICY "Owner can update own notifications"
  ON notifications FOR UPDATE USING (to_owner_id = auth.uid());

-- =====================================================
-- SEED: Sample houses (edit block/number as needed)
-- =====================================================
INSERT INTO houses (house_number, block) VALUES
  ('101', 'A'),
  ('102', 'A'),
  ('103', 'A'),
  ('201', 'B'),
  ('202', 'B'),
  ('203', 'B'),
  ('301', 'C'),
  ('302', 'C'),
  ('303', 'C'),
  ('401', 'D'),
  ('402', 'D'),
  ('403', 'D');

-- =====================================================
-- STORAGE: Create bucket for visitor photos
-- Run separately in Supabase Dashboard > Storage
-- Or via SQL:
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('visitor-photos', 'visitor-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read visitor photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'visitor-photos');

CREATE POLICY "Anyone can upload visitor photos"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'visitor-photos');
