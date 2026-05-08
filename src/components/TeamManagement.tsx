import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, MessageSquare, ArrowRight, Star, Loader2, User, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { TeamForm } from './TeamForm';
import { TeamDetailsModal } from './TeamDetailsModal';
import { toast } from 'react-hot-toast';
import { EmailService } from '../services/emailService';

export function TeamManagement() {
  const { profile, user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [openRecruitments, setOpenRecruitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [selectedTeamForManage, setSelectedTeamForManage] = useState<any>(null);
  const [joinKeyInput, setJoinKeyInput] = useState('');
  const [findingSquad, setFindingSquad] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchTeams();
    }
  }, [profile]);

  const handleJoinTeam = async (teamId: string) => {
    if (!user) return;
    setJoining(teamId);
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          profile_id: user.id,
          role: 'member',
          status: 'pending' // Initially pending for leader approval
        });

      if (error) throw error;
      
      // Notify team leader
      const { data: teamData } = await supabase
        .from('teams')
        .select('name, team_members(profiles(email, full_name))')
        .eq('id', teamId)
        .eq('team_members.role', 'leader')
        .single();

      const leaderProfile = teamData?.team_members?.[0]?.profiles;
      const leader = Array.isArray(leaderProfile) ? leaderProfile[0] : leaderProfile;
      
      if (leader?.email && profile) {
        EmailService.sendJoinSquadRequest(leader.email, leader.full_name, profile.full_name, teamData.name);
      }

      toast.success('Join request sent! Waiting for leader approval.');
      fetchTeams();
    } catch (error: any) {
      toast.error(error.message || 'Failed to join team');
    } finally {
      setJoining(null);
    }
  };

  async function fetchTeams() {
    try {
      setLoading(true);
      const [myTeamsData, openData] = await Promise.all([
        supabase.from('team_members').select(`
          team_id,
          role,
          status,
          teams(id, name, event_id, member_count, is_open, join_code, events(title))
        `).eq('profile_id', profile?.id),
        supabase.from('teams').select(`
          id, name, member_count, events(title, category)
        `).eq('is_open', true).limit(6)
      ]);

      if (myTeamsData.data) {
        setTeams(myTeamsData.data.map((tm: any) => ({
          ...tm.teams,
          is_leader: tm.role === 'leader',
          my_status: tm.status
        })));
      }
      setOpenRecruitments(openData.data || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Join by Code Section */}
      <div className="p-8 rounded-[32px] bg-[#0d0d0d] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-400">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">JOIN BY SQUAD KEY</h3>
            <p className="text-xs text-slate-500 font-mono uppercase">Enter the unique key to find a private team.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="6-DIGIT KEY" 
            value={joinKeyInput}
            onChange={(e) => setJoinKeyInput(e.target.value.toUpperCase())}
            className="flex-1 md:w-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono focus:border-indigo-500 outline-none uppercase"
          />
          <button 
            disabled={findingSquad || !joinKeyInput}
            onClick={async () => {
              setFindingSquad(true);
              try {
                const { data, error } = await supabase
                  .from('teams')
                  .select('id')
                  .eq('join_code', joinKeyInput)
                  .maybeSingle();
                
                if (error) throw error;
                if (data) {
                  await handleJoinTeam(data.id);
                  setJoinKeyInput('');
                } else {
                  toast.error('Invalid Squad Key');
                }
              } catch (e: any) {
                toast.error(e.message || 'Error finding squad');
              } finally {
                setFindingSquad(false);
              }
            }}
            className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center min-w-[120px]"
          >
            {findingSquad ? <Loader2 size={16} className="animate-spin" /> : 'Find Squad'}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter mb-2">MY TEAMS</h2>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Collaborate with your squad to achieve victory.</p>
        </div>
        <button 
          onClick={() => setShowTeamForm(true)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center gap-2 group transition-all shadow-lg shadow-indigo-600/10"
        >
          <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
          Create New Team
        </button>
      </div>

      {showTeamForm && <TeamForm onClose={() => setShowTeamForm(false)} onSuccess={fetchTeams} />}
      {selectedTeamForManage && (
        <TeamDetailsModal 
          team={selectedTeamForManage} 
          onClose={() => setSelectedTeamForManage(null)} 
          onUpdate={fetchTeams}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.length > 0 ? teams.map((team) => (
          <div 
            key={team.id} 
            onClick={() => {
              if (team.is_leader || team.my_status !== 'pending') {
                setSelectedTeamForManage(team);
              }
            }}
            className={cn(
              "p-8 rounded-[32px] bg-[#0d0d0d] border border-white/5 relative group overflow-hidden transition-all cursor-pointer",
              team.is_leader ? "hover:border-indigo-500/50" : (team.my_status === 'pending' ? "opacity-60 grayscale cursor-not-allowed" : "hover:border-indigo-500/50")
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold italic tracking-tight">{team.name.toUpperCase()}</h3>
                  {team.is_leader && (
                    <span className="p-1 bg-yellow-500/10 text-yellow-500 rounded-lg">
                      <Shield size={14} />
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest">{team.events?.title}</p>
                {!team.is_leader && team.my_status === 'pending' && (
                  <p className="text-[10px] font-mono text-orange-500 uppercase mt-1 animate-pulse">Request Pending Approval</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  team.is_open ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"
                )}>
                  {team.is_open ? 'Recruiting' : 'Ready'}
                </span>
                {team.join_code && team.is_leader && (
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Key: {team.join_code}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-3 h-10 items-center">
                {Array.from({ length: team.member_count }).map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-[#0d0d0d] bg-slate-800 flex items-center justify-center text-xs font-bold ring-1 ring-white/10">
                    <User size={14} />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button 
                  disabled={!team.is_leader && team.my_status === 'pending'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTeamForManage(team);
                  }}
                  className={cn(
                    "p-3 rounded-xl transition-colors",
                    (!team.is_leader && team.my_status === 'pending') ? "bg-white/2 text-slate-700 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 text-white"
                  )}
                >
                  <MessageSquare size={18} />
                </button>
                {team.is_leader && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTeamForManage(team);
                    }}
                    className="p-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl transition-all"
                  >
                    <Star size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="lg:col-span-2 p-20 rounded-[32px] border border-dashed border-white/10 flex flex-col items-center text-center space-y-4">
            <Users className="text-slate-800" size={64} />
            <div>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">YOU ARE NOT IN ANY TEAMS YET</p>
              <p className="text-white font-bold text-lg">Start by creating or joining one below.</p>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Teams to Join */}
      <div className="pt-10">
        <h3 className="text-xl font-bold italic tracking-tight uppercase mb-6 flex items-center gap-2">
          <Star className="text-yellow-500" size={20} />
          Open Recruitments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {openRecruitments.length > 0 ? openRecruitments.map((team) => (
            <JoinCard 
              key={team.id} 
              name={team.name} 
              event={team.events?.title} 
              spots={team.member_count} 
              onJoin={() => handleJoinTeam(team.id)}
              isJoining={joining === team.id}
            />
          )) : (
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest italic py-4">NO TEAMS CURRENTLY RECRUITING</p>
          )}
        </div>
      </div>
    </div>
  );
}

function JoinCard({ name, event, spots, onJoin, isJoining }: { name: string, event: string, spots: number, onJoin: () => void, isJoining: boolean, key?: any }) {
  return (
    <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 hover:border-indigo-500/30 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-lg italic">{name.toUpperCase()}</h4>
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">{event}</span>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{spots} Members</p>
        <button 
          onClick={onJoin}
          disabled={isJoining}
          className="text-xs font-bold font-mono uppercase bg-indigo-600/10 text-indigo-400 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all disabled:opacity-50"
        >
          {isJoining ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            'Join Squad →'
          )}
        </button>
      </div>
    </div>
  );
}
