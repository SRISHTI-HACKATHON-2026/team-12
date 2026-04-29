-- ═══ EcoVoice Supabase Schema ═══
-- Run this entire file in your Supabase SQL Editor

-- Villages table
CREATE TABLE IF NOT EXISTS villages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  lat REAL,
  lng REAL,
  score INTEGER DEFAULT 500,
  water_score INTEGER DEFAULT 50,
  waste_score INTEGER DEFAULT 50,
  energy_score INTEGER DEFAULT 50,
  green_score INTEGER DEFAULT 50,
  community_score INTEGER DEFAULT 50,
  health_score INTEGER DEFAULT 50,
  badge TEXT DEFAULT 'NONE',
  total_reports INTEGER DEFAULT 0,
  resolved_reports INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  username TEXT DEFAULT 'Anonymous',
  village TEXT NOT NULL,
  category TEXT NOT NULL,
  method TEXT DEFAULT 'text',
  message TEXT,
  audio_url TEXT,
  photo_url TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow public read on villages
CREATE POLICY "Public can read villages" ON villages FOR SELECT USING (true);

-- Allow public insert on reports
CREATE POLICY "Public can insert reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read reports" ON reports FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service full access villages" ON villages USING (true) WITH CHECK (true);
CREATE POLICY "Service full access reports" ON reports USING (true) WITH CHECK (true);

-- Seed villages data
INSERT INTO villages (name, state, district, lat, lng, score, water_score, waste_score, energy_score, green_score, community_score, health_score, badge) VALUES
  ('Rampur', 'Maharashtra', 'Pune', 18.52, 73.86, 742, 78, 61, 89, 70, 82, 62, 'SILVER'),
  ('Sundarpur', 'Maharashtra', 'Nashik', 20.00, 73.78, 891, 92, 85, 95, 88, 90, 87, 'GOLD'),
  ('Nandgaon', 'Maharashtra', 'Nashik', 20.31, 74.65, 698, 72, 58, 80, 65, 75, 55, 'BRONZE'),
  ('Khedgaon', 'Maharashtra', 'Ahmednagar', 19.09, 74.73, 543, 55, 45, 60, 50, 55, 48, 'NONE'),
  ('Kalyanpur', 'Rajasthan', 'Jaipur', 26.92, 75.79, 887, 95, 88, 90, 85, 88, 82, 'GOLD'),
  ('Govindpur', 'Bihar', 'Patna', 25.61, 85.14, 756, 85, 65, 78, 72, 80, 70, 'SILVER'),
  ('Anantapur', 'Andhra Pradesh', 'Anantapur', 14.68, 77.60, 834, 82, 80, 92, 85, 82, 78, 'SILVER'),
  ('Palakkad', 'Kerala', 'Palakkad', 10.78, 76.65, 912, 95, 92, 93, 90, 92, 88, 'GOLD'),
  ('Mandya', 'Karnataka', 'Mandya', 12.52, 76.90, 678, 70, 60, 72, 68, 65, 58, 'BRONZE'),
  ('Warangal', 'Telangana', 'Warangal', 17.98, 79.60, 723, 75, 63, 82, 70, 78, 60, 'SILVER'),
  ('Dindigul', 'Tamil Nadu', 'Dindigul', 10.37, 77.97, 801, 85, 75, 88, 78, 82, 72, 'SILVER'),
  ('Moga', 'Punjab', 'Moga', 30.80, 75.17, 645, 65, 55, 70, 62, 60, 55, 'BRONZE'),
  ('Jhunjhunu', 'Rajasthan', 'Jhunjhunu', 28.13, 75.40, 567, 58, 48, 62, 55, 58, 50, 'NONE'),
  ('Chitradurga', 'Karnataka', 'Chitradurga', 14.23, 76.40, 710, 72, 62, 78, 70, 72, 62, 'SILVER'),
  ('Barabanki', 'Uttar Pradesh', 'Barabanki', 26.93, 81.18, 489, 50, 40, 55, 48, 50, 42, 'NONE')
ON CONFLICT DO NOTHING;
