-- Portfolio Content Table
-- Stores all editable text content for About and Experience pages
CREATE TABLE IF NOT EXISTS portfolio_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  language TEXT NOT NULL, -- 'ko' or 'en'
  content_key TEXT NOT NULL,
  content_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, language, content_key)
);

-- Profile Images Table
-- Stores profile image URL and crop settings
CREATE TABLE IF NOT EXISTS profile_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL, -- Supabase Storage URL
  crop_zoom FLOAT DEFAULT 1.0,
  crop_offset_x FLOAT DEFAULT 0.0,
  crop_offset_y FLOAT DEFAULT 0.0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
-- Stores project information for Experience page
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  language TEXT NOT NULL,
  project_id TEXT NOT NULL, -- unique identifier for the project
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'project' | 'ai_learning' | 'skill' | 'vision'
  overview TEXT,
  background TEXT,
  key_features JSONB, -- array of features
  tech_stack TEXT[], -- array of technologies
  achievements JSONB, -- array of achievements
  timeline TEXT,
  details JSONB, -- flexible JSON for additional project-specific data
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, language, project_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolio_content_user_lang ON portfolio_content(user_id, language);
CREATE INDEX IF NOT EXISTS idx_projects_user_lang ON projects(user_id, language);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE portfolio_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view)
CREATE POLICY "Public read access for portfolio_content"
  ON portfolio_content FOR SELECT
  USING (true);

CREATE POLICY "Public read access for profile_images"
  ON profile_images FOR SELECT
  USING (true);

CREATE POLICY "Public read access for projects"
  ON projects FOR SELECT
  USING (true);

-- Create policies for authenticated write access (admin can edit)
-- Note: You should replace this with proper authentication
CREATE POLICY "Admin write access for portfolio_content"
  ON portfolio_content FOR ALL
  USING (true); -- TODO: Add proper auth check

CREATE POLICY "Admin write access for profile_images"
  ON profile_images FOR ALL
  USING (true); -- TODO: Add proper auth check

CREATE POLICY "Admin write access for projects"
  ON projects FOR ALL
  USING (true); -- TODO: Add proper auth check

-- Create storage bucket for profile images
-- Run this in Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Create storage policy for public read access
-- CREATE POLICY "Public read access for profile images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'profile-images');

-- Create storage policy for authenticated upload
-- CREATE POLICY "Admin upload access for profile images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'profile-images');
