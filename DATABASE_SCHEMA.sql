-- SQL Schema Fix for Arcadium AI

-- 1. Profiles Table (Ensure email column exists)
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id TEXT;

-- 2. Messages Table FIX
-- If you are getting "Could not find the 'content' column of 'messages'"
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Team Members Table FIX (Ensure status column exists)
-- If you are getting "Could not find the 'status' column of 'team_members'"
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'leader' or 'member'
  status TEXT DEFAULT 'pending', -- 'pending' or 'approved'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, profile_id)
);

-- 4. RPC for incrementing team count
CREATE OR REPLACE FUNCTION increment_team_count(team_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE teams
  SET member_count = member_count + 1
  WHERE id = team_id_input;
END;
$$ LANGUAGE plpgsql;

-- 5. Enable RLS and set policies (Basic examples)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

-- Policy: Team members can read/write messages in their teams
CREATE POLICY "Team members can view messages" ON messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = messages.team_id AND profile_id = auth.uid() AND status = 'approved'
    ) OR EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = messages.team_id AND profile_id = auth.uid() AND role = 'leader'
    )
);

CREATE POLICY "Team members can insert messages" ON messages 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = messages.team_id AND profile_id = auth.uid() AND status = 'approved'
    ) OR EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = messages.team_id AND profile_id = auth.uid() AND role = 'leader'
    )
);
