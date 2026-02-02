-- SFBB Diary & 4-Weekly Review Tables
-- Run this in your Supabase SQL Editor

-- ============================================
-- DIARY ENTRIES TABLE (Daily diary entries)
-- ============================================
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  problems_changes TEXT,
  opening_checks_done BOOLEAN DEFAULT FALSE,
  closing_checks_done BOOLEAN DEFAULT FALSE,
  staff_name TEXT,
  signed_off BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- WEEKLY EXTRA CHECKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_extra_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_commencing DATE NOT NULL,
  extra_checks_notes TEXT,
  staff_name TEXT,
  signed_off BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_commencing)
);

-- ============================================
-- 4-WEEKLY REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS four_weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  week_commencing DATE NOT NULL,

  -- Problems observed
  problems_observed BOOLEAN,
  problem_details TEXT,
  problem_actions TEXT,

  -- Safe Method Checklist (12 questions)
  reviewed_safe_methods BOOLEAN,
  allergen_info_updated BOOLEAN,
  equipment_processes_changed BOOLEAN,
  new_suppliers_recorded BOOLEAN,
  cleaning_schedule_updated BOOLEAN,
  new_staff_trained BOOLEAN,
  existing_staff_refresher BOOLEAN,
  extra_checks_required BOOLEAN,
  food_complaints_investigated BOOLEAN,
  probes_calibrated BOOLEAN,
  extra_checks_completed BOOLEAN,
  prove_it_checks_completed BOOLEAN,

  -- Additional details
  additional_details TEXT,

  -- Sign off
  manager_name TEXT,
  signed_off BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_extra_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE four_weekly_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own diary entries" ON diary_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own weekly extra checks" ON weekly_extra_checks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own 4-weekly reviews" ON four_weekly_reviews FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date ON diary_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_extra_checks_user_week ON weekly_extra_checks(user_id, week_commencing);
CREATE INDEX IF NOT EXISTS idx_four_weekly_reviews_user_date ON four_weekly_reviews(user_id, review_date);

-- Add updated_at trigger
CREATE TRIGGER update_diary_entries_updated_at BEFORE UPDATE ON diary_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_extra_checks_updated_at BEFORE UPDATE ON weekly_extra_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_four_weekly_reviews_updated_at BEFORE UPDATE ON four_weekly_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
