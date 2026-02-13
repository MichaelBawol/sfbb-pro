-- ============================================
-- SFBB PACKS TABLE (Digital Safer Food Better Business)
-- ============================================
CREATE TABLE IF NOT EXISTS sfbb_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  pack_type TEXT NOT NULL CHECK (pack_type IN ('caterer', 'retailer', 'care_home', 'childminder')),
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  completed_sections INTEGER DEFAULT 0,
  total_sections INTEGER DEFAULT 0,
  signed_off BOOLEAN DEFAULT FALSE,
  signed_off_by TEXT,
  signed_off_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sfbb_packs ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own sfbb packs" ON sfbb_packs FOR ALL USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_sfbb_packs_user_id ON sfbb_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_sfbb_packs_location ON sfbb_packs(location_id);

-- Updated at trigger
CREATE TRIGGER update_sfbb_packs_updated_at BEFORE UPDATE ON sfbb_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
