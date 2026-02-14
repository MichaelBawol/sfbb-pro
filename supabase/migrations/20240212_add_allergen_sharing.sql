-- ============================================
-- ALLERGEN SHARING (Public QR code access)
-- ============================================

-- Add share settings to locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS allergen_share_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS allergen_share_code TEXT UNIQUE;

-- Create index for share code lookups
CREATE INDEX IF NOT EXISTS idx_locations_share_code ON locations(allergen_share_code) WHERE allergen_share_code IS NOT NULL;

-- Function to generate a random share code
CREATE OR REPLACE FUNCTION generate_share_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a view for public allergen access (dishes with their allergens)
CREATE OR REPLACE VIEW public_allergen_menu AS
SELECT
  l.allergen_share_code,
  l.name as location_name,
  b.name as business_name,
  d.id as dish_id,
  d.name as dish_name,
  d.description as dish_description,
  d.category as dish_category,
  d.allergens,
  d.cross_contamination_risks
FROM locations l
JOIN profiles p ON l.user_id = p.id
LEFT JOIN businesses b ON b.user_id = p.id
LEFT JOIN dishes d ON (d.location_id = l.id OR (d.location_id IS NULL AND d.user_id = l.user_id))
WHERE l.allergen_share_enabled = TRUE
  AND l.allergen_share_code IS NOT NULL;

-- Grant public access to the view
GRANT SELECT ON public_allergen_menu TO anon;
