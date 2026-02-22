-- Experience sections table for Overview and Vision tab content
CREATE TABLE IF NOT EXISTS experience_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ko', 'en')),
  section_type TEXT NOT NULL CHECK (section_type IN ('overview', 'vision')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, language, section_type)
);

-- Enable RLS
ALTER TABLE experience_sections ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access for experience sections"
  ON experience_sections
  FOR SELECT
  USING (true);

-- Create policy for authenticated write access (for admin)
CREATE POLICY "Admin write access for experience sections"
  ON experience_sections
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_experience_sections_user_lang ON experience_sections(user_id, language, section_type);
