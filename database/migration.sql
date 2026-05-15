-- =============================================================================
-- Smart Parking — Database Migration
-- Al Yamamah University
--
-- Run this in Supabase SQL Editor AFTER your existing tables are created.
-- It adds user info columns to the reservations table and seeds initial spots.
-- =============================================================================

-- 1) Add user info columns to reservations (so the website can save who reserved)
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS user_name  varchar,
  ADD COLUMN IF NOT EXISTS user_phone varchar,
  ADD COLUMN IF NOT EXISTS user_plate varchar;

-- 2) Seed four demo parking spots if they don't already exist.
INSERT INTO public.parking_spots (spot_name, status, sensor_status, is_gate_open)
SELECT 'A1', 'available', 'not_detected', false
WHERE NOT EXISTS (SELECT 1 FROM public.parking_spots WHERE spot_name = 'A1');

INSERT INTO public.parking_spots (spot_name, status, sensor_status, is_gate_open)
SELECT 'A2', 'available', 'not_detected', false
WHERE NOT EXISTS (SELECT 1 FROM public.parking_spots WHERE spot_name = 'A2');

INSERT INTO public.parking_spots (spot_name, status, sensor_status, is_gate_open)
SELECT 'A3', 'occupied', 'detected', false
WHERE NOT EXISTS (SELECT 1 FROM public.parking_spots WHERE spot_name = 'A3');

INSERT INTO public.parking_spots (spot_name, status, sensor_status, is_gate_open)
SELECT 'A4', 'available', 'not_detected', false
WHERE NOT EXISTS (SELECT 1 FROM public.parking_spots WHERE spot_name = 'A4');

-- 3) Row-Level Security: enable read+write with anon key (DEMO ONLY)
-- For a production app you should restrict by user. For this demo we allow
-- the anon key to do everything on these tables so the website works.
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_commands  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis    ENABLE ROW LEVEL SECURITY;

-- Drop existing demo policies first (so the script is idempotent)
DROP POLICY IF EXISTS "demo_all_parking_spots" ON public.parking_spots;
DROP POLICY IF EXISTS "demo_all_reservations"  ON public.reservations;
DROP POLICY IF EXISTS "demo_all_iot_logs"       ON public.iot_logs;
DROP POLICY IF EXISTS "demo_all_gate_commands"  ON public.gate_commands;
DROP POLICY IF EXISTS "demo_all_ai_analysis"    ON public.ai_analysis;

-- Permissive demo policies (replace these in production)
CREATE POLICY "demo_all_parking_spots" ON public.parking_spots
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "demo_all_reservations" ON public.reservations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "demo_all_iot_logs" ON public.iot_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "demo_all_gate_commands" ON public.gate_commands
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "demo_all_ai_analysis" ON public.ai_analysis
  FOR ALL USING (true) WITH CHECK (true);

-- Done!
SELECT 'Migration complete. Spots seeded: ' || count(*)::text AS message
FROM public.parking_spots;
