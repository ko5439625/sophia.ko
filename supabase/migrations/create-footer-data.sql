-- Create footer_data table
CREATE TABLE IF NOT EXISTS footer_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ko',
  section TEXT NOT NULL, -- 'contact', 'links', 'expertise'
  content JSONB NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_footer_user_lang ON footer_data(user_id, language);
CREATE INDEX IF NOT EXISTS idx_footer_section ON footer_data(section);

-- Insert default footer data (Korean)
INSERT INTO footer_data (user_id, language, section, content, display_order) VALUES
('sophia.ko', 'ko', 'contact', '{"label": "이메일", "value": "sophia.ko@example.com", "icon": "email", "link": "mailto:sophia.ko@example.com"}', 0),
('sophia.ko', 'ko', 'contact', '{"label": "LinkedIn", "value": "LinkedIn", "icon": "linkedin", "link": "https://linkedin.com"}', 1),
('sophia.ko', 'ko', 'contact', '{"label": "GitHub", "value": "GitHub", "icon": "github", "link": "https://github.com"}', 2),

('sophia.ko', 'ko', 'links', '{"label": "개요", "link": "/experience?tab=overview"}', 0),
('sophia.ko', 'ko', 'links', '{"label": "프로젝트", "link": "/experience?tab=projects"}', 1),
('sophia.ko', 'ko', 'links', '{"label": "비전", "link": "/experience?tab=vision"}', 2),

('sophia.ko', 'ko', 'expertise', '{"label": "QA Automation"}', 0),
('sophia.ko', 'ko', 'expertise', '{"label": "Test Strategy"}', 1),
('sophia.ko', 'ko', 'expertise', '{"label": "Quality Engineering"}', 2);

-- Create settings table for API keys and configurations
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings for user
INSERT INTO user_settings (user_id, settings) VALUES
('sophia.ko', '{
  "gpt_api_key": "",
  "ai_model": "gpt-4",
  "ai_enabled": false
}')
ON CONFLICT (user_id) DO NOTHING;

-- Add RLS policies
ALTER TABLE footer_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (for now)
CREATE POLICY "Allow all for authenticated users" ON footer_data
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON user_settings
  FOR ALL USING (true);
