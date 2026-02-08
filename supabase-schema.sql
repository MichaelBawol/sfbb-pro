-- SFBB Pro Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'staff')),
  pin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUSINESSES TABLE
-- ============================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  manager_name TEXT,
  food_hygiene_rating INTEGER CHECK (food_hygiene_rating >= 0 AND food_hygiene_rating <= 5),
  last_inspection_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMPLOYEES TABLE
-- ============================================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  email TEXT,
  phone TEXT,
  pin TEXT,
  start_date DATE NOT NULL,
  custom_privileges TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CERTIFICATES TABLE
-- ============================================
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINING RECORDS TABLE
-- ============================================
CREATE TABLE training_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPLIANCES TABLE
-- ============================================
CREATE TABLE appliances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fridge', 'freezer', 'hot_hold', 'dishwasher', 'probe')),
  location TEXT,
  min_temp DECIMAL,
  max_temp DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEMPERATURE LOGS TABLE
-- ============================================
CREATE TABLE temperature_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fridge', 'freezer', 'hot_hold', 'delivery', 'dishwasher', 'probe_calibration')),
  appliance_id UUID REFERENCES appliances(id) ON DELETE SET NULL,
  appliance_name TEXT NOT NULL,
  temperature DECIMAL,
  boiling_temp DECIMAL,
  ice_temp DECIMAL,
  time TEXT NOT NULL,
  date DATE NOT NULL,
  logged_by TEXT NOT NULL,
  notes TEXT,
  is_compliant BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHECKLISTS TABLE
-- ============================================
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('opening', 'closing', 'weekly')),
  date DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  completed_by TEXT,
  remarks TEXT,
  signed_off BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLEANING RECORDS TABLE
-- ============================================
CREATE TABLE cleaning_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  tasks JSONB NOT NULL DEFAULT '[]',
  completed_by TEXT,
  signed_off BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPLIERS TABLE
-- ============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  products TEXT[] DEFAULT '{}',
  last_delivery DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DISHES TABLE
-- ============================================
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  allergens TEXT[] DEFAULT '{}',
  cross_contamination_risks TEXT[] DEFAULT '{}',
  cooking_instructions TEXT,
  storage_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WASTE LOGS TABLE
-- ============================================
CREATE TABLE waste_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  reason TEXT NOT NULL,
  logged_by TEXT NOT NULL,
  cost DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MAINTENANCE LOGS TABLE
-- ============================================
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  appliance_id UUID REFERENCES appliances(id) ON DELETE SET NULL,
  appliance_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('repair', 'service', 'inspection')),
  description TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  cost DECIMAL,
  next_service_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SPOT CHECKS TABLE
-- ============================================
CREATE TABLE spot_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  area TEXT NOT NULL,
  checked_by TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  overall_result TEXT NOT NULL CHECK (overall_result IN ('pass', 'fail')),
  corrective_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ALERTS TABLE
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('certificate_expiry', 'temperature', 'overdue_task', 'inspection')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHECKLIST TEMPLATES TABLE
-- ============================================
CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opening_checks TEXT[] DEFAULT '{}',
  closing_checks TEXT[] DEFAULT '{}',
  daily_cleaning TEXT[] DEFAULT '{}',
  weekly_cleaning TEXT[] DEFAULT '{}',
  monthly_cleaning TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Generic policy for user-owned tables (SELECT, INSERT, UPDATE, DELETE)
-- Businesses
CREATE POLICY "Users can manage own businesses" ON businesses FOR ALL USING (auth.uid() = user_id);

-- Employees
CREATE POLICY "Users can manage own employees" ON employees FOR ALL USING (auth.uid() = user_id);

-- Certificates (through employee ownership)
CREATE POLICY "Users can manage certificates" ON certificates FOR ALL
USING (EXISTS (SELECT 1 FROM employees WHERE employees.id = certificates.employee_id AND employees.user_id = auth.uid()));

-- Training Records (through employee ownership)
CREATE POLICY "Users can manage training records" ON training_records FOR ALL
USING (EXISTS (SELECT 1 FROM employees WHERE employees.id = training_records.employee_id AND employees.user_id = auth.uid()));

-- Appliances
CREATE POLICY "Users can manage own appliances" ON appliances FOR ALL USING (auth.uid() = user_id);

-- Temperature Logs
CREATE POLICY "Users can manage own temperature logs" ON temperature_logs FOR ALL USING (auth.uid() = user_id);

-- Checklists
CREATE POLICY "Users can manage own checklists" ON checklists FOR ALL USING (auth.uid() = user_id);

-- Cleaning Records
CREATE POLICY "Users can manage own cleaning records" ON cleaning_records FOR ALL USING (auth.uid() = user_id);

-- Suppliers
CREATE POLICY "Users can manage own suppliers" ON suppliers FOR ALL USING (auth.uid() = user_id);

-- Dishes
CREATE POLICY "Users can manage own dishes" ON dishes FOR ALL USING (auth.uid() = user_id);

-- Waste Logs
CREATE POLICY "Users can manage own waste logs" ON waste_logs FOR ALL USING (auth.uid() = user_id);

-- Maintenance Logs
CREATE POLICY "Users can manage own maintenance logs" ON maintenance_logs FOR ALL USING (auth.uid() = user_id);

-- Spot Checks
CREATE POLICY "Users can manage own spot checks" ON spot_checks FOR ALL USING (auth.uid() = user_id);

-- Alerts
CREATE POLICY "Users can manage own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);

-- Checklist Templates
CREATE POLICY "Users can manage own checklist templates" ON checklist_templates FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'admin'
  );

  -- Create default checklist templates
  INSERT INTO public.checklist_templates (user_id, opening_checks, closing_checks, daily_cleaning, weekly_cleaning, monthly_cleaning)
  VALUES (
    NEW.id,
    ARRAY[
      'Check all fridges and freezers are at correct temperatures',
      'Ensure all staff have washed hands before starting work',
      'Check food deliveries received are at correct temperatures',
      'Inspect all work surfaces are clean and sanitized',
      'Check pest control measures are in place',
      'Verify probe thermometer is calibrated',
      'Check first aid kit is fully stocked',
      'Ensure all staff are wearing appropriate clothing/PPE'
    ],
    ARRAY[
      'All food stored correctly and covered',
      'All surfaces cleaned and sanitized',
      'All equipment cleaned',
      'Fridges and freezers closed properly',
      'Waste disposed of correctly',
      'Floor swept and mopped',
      'All doors and windows secured',
      'Temperature logs completed for the day'
    ],
    ARRAY[
      'Clean and sanitize all food preparation surfaces',
      'Clean and sanitize chopping boards',
      'Clean and sanitize sinks',
      'Mop kitchen floors',
      'Clean and sanitize door handles',
      'Empty and clean bins',
      'Clean coffee machine',
      'Wipe down equipment exteriors'
    ],
    ARRAY[
      'Deep clean fridge interiors',
      'Clean behind and under equipment',
      'Clean extraction hood filters',
      'Sanitize storage shelves',
      'Clean walls in food prep areas',
      'Descale kettles/urns',
      'Clean light fittings',
      'Deep clean floors (grout)'
    ],
    ARRAY[
      'Deep clean freezer',
      'Clean and service extraction system',
      'Deep clean ovens',
      'Clean behind heavy equipment',
      'Pest control inspection',
      'Clean ceiling tiles/vents',
      'Service grease traps',
      'Review cleaning chemicals stock'
    ]
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appliances_updated_at BEFORE UPDATE ON appliances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cleaning_records_updated_at BEFORE UPDATE ON cleaning_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON checklist_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_temperature_logs_user_date ON temperature_logs(user_id, date);
CREATE INDEX idx_checklists_user_date ON checklists(user_id, date);
CREATE INDEX idx_cleaning_records_user_date ON cleaning_records(user_id, date);
CREATE INDEX idx_waste_logs_user_date ON waste_logs(user_id, date);
CREATE INDEX idx_maintenance_logs_user_date ON maintenance_logs(user_id, date);
CREATE INDEX idx_alerts_user_acknowledged ON alerts(user_id, acknowledged);

-- ============================================
-- DIARY ENTRIES TABLE (Weekly diary)
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

-- ============================================
-- SUBSCRIPTIONS TABLE (Stripe integration)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'professional', 'vip')),
  status TEXT NOT NULL DEFAULT 'incomplete',
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Updated at trigger
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
