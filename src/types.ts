export type UserRole = 'participant' | 'event_admin' | 'main_admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  rules: string;
  date: string;
  venue: string;
  category: string;
  participant_limit: number;
  current_participants: number;
  created_by: string;
  poster_url?: string;
  status: 'draft' | 'published';
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  event_id: string;
  created_by: string;
  is_open: boolean;
  member_count: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  profile_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface Registration {
  id: string;
  profile_id: string;
  event_id: string;
  team_id?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  ticket_id: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_role?: UserRole;
  created_by: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  event_id: string;
  team_id?: string;
  profile_id?: string;
  score: number;
  rank: number;
  updated_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}
