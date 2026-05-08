import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Trophy, 
  Calendar, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Target,
  CreditCard,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';

export function ParticipantDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    events: 0,
    teams: 0,
    rank: '-',
    messages: 0
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      fetchParticipantData();
    }
  }, [profile]);

  async function fetchParticipantData() {
    // 1. Get teams user is in
    const { data: myTeams } = await supabase.from('team_members').select('team_id').eq('profile_id', profile?.id);
    const teamIds = myTeams?.map(t => t.team_id) || [];

    const [eventsCount, teamsCount, announcementsData, registrationsData, messagesCount] = await Promise.all([
      supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('profile_id', profile?.id),
      supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('profile_id', profile?.id),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('registrations').select('*, events(*)').eq('profile_id', profile?.id),
      teamIds.length > 0 
        ? supabase.from('messages').select('*', { count: 'exact', head: true }).in('team_id', teamIds)
        : Promise.resolve({ count: 0 })
    ]);

    setStats({
      events: eventsCount.count || 0,
      teams: teamsCount.count || 0,
      rank: '-',
      messages: messagesCount.count || 0
    });

    setAnnouncements(announcementsData.data || []);
    
    // Sort registrations by event date
    const regs = registrationsData.data || [];
    const activities = regs
      .filter(r => r.events)
      .sort((a, b) => new Date(a.events.date).getTime() - new Date(b.events.date).getTime())
      .slice(0, 3);
    
    setUpcomingActivities(activities);
    setTicket(regs[0] || null);
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="relative p-10 rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-800 overflow-hidden shadow-2xl shadow-indigo-600/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Target size={200} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black italic tracking-tighter mb-4">
            WELCOME BACK, {profile?.full_name?.split(' ')[0].toUpperCase()}!
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            You have {stats.events} events in your schedule. Make sure to coordinate with your team 
            and check the latest rules.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="ENROLLED EVENTS" value={stats.events.toString()} icon={<Calendar />} color="indigo" />
        <StatCard title="TEAMS JOINED" value={stats.teams.toString()} icon={<Users />} color="blue" />
        <StatCard title="GLOBAL RANK" value={stats.rank} icon={<Trophy />} color="yellow" />
        <StatCard title="MESSAGES" value={stats.messages.toString()} icon={<MessageSquare />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrolled Events List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold italic tracking-tight uppercase flex items-center gap-2">
              <Clock className="text-indigo-400" size={20} />
              Upcoming Activities
            </h3>
            <button className="text-xs font-mono uppercase text-indigo-400 hover:text-white transition-colors">View All</button>
          </div>

          <div className="space-y-4">
            {upcomingActivities.length > 0 ? (
              upcomingActivities.map((activity) => (
                <ActivityItem 
                  key={activity.id}
                  title={activity.events?.title || 'Unknown Event'} 
                  time={activity.events?.date ? formatDate(activity.events.date) : 'TBD'} 
                  venue={activity.events?.venue || 'TBD'}
                  status="ready" 
                />
              ))
            ) : (
              <div className="p-12 rounded-3xl bg-white/5 border border-white/5 text-center space-y-4">
                <Calendar className="mx-auto text-slate-700" size={48} />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest italic">
                  No upcoming activities found. <br /> Explore events to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Panel */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold italic tracking-tight uppercase flex items-center gap-2">
              <CreditCard className="text-indigo-400" size={20} />
              My Ticket
            </h3>
          </div>
          <div className="p-8 rounded-[32px] bg-indigo-600 p-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full -translate-y-12 translate-x-12" />
            <div className="bg-black rounded-[28px] p-6 relative z-10 border border-white/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-1">Pass Status</p>
                  <p className="text-lg font-bold italic">{ticket ? 'CONFIRMED' : 'NO PASS'}</p>
                </div>
                <Zap className="text-indigo-500 fill-indigo-500" size={24} />
              </div>
              <div className="space-y-4 mb-8">
                <div className="h-[1px] bg-white/10 w-full dashed" style={{ backgroundImage: 'linear-gradient(to right, white 50%, transparent 50%)', backgroundSize: '10px 1px' }} />
                <div className="flex justify-between text-xs font-mono uppercase tracking-widest text-slate-500">
                  <span>ID: {ticket?.ticket_id || '----'}</span>
                  <span>{ticket?.events?.title || 'No Activity'}</span>
                </div>
              </div>
              {ticket && (
                <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all">
                  Download PDF
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold italic tracking-tight uppercase flex items-center gap-2">
              <Target className="text-orange-400" size={20} />
              Announcements
            </h3>
          </div>
          
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            {announcements.length > 0 ? announcements.map((ann) => (
              <div key={ann.id} className="space-y-2 pb-4 border-b border-white/5">
                <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                  {formatDate(ann.created_at)}
                </p>
                <p className="text-sm font-semibold">{ann.title}</p>
              </div>
            )) : (
              <p className="text-center text-slate-500 py-6 font-mono text-[10px] uppercase tracking-widest italic leading-relaxed">
                NO RECENT <br /> ANNOUNCEMENTS
              </p>
            )}
            <button className="w-full py-3 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
              See All Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500/20 border-indigo-500/30 text-indigo-400',
    blue: 'from-blue-500/20 border-blue-500/30 text-blue-400',
    yellow: 'from-yellow-500/20 border-yellow-500/30 text-yellow-500',
    purple: 'from-purple-500/20 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={cn(
      "p-6 rounded-[24px] bg-gradient-to-br border flex items-center justify-between group hover:scale-[1.02] transition-all",
      colors[color]
    )}>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1 opacity-80">{title}</p>
        <p className="text-3xl font-black italic">{value}</p>
      </div>
      <div className="opacity-40 group-hover:opacity-100 transition-opacity">
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  time: string;
  venue: string;
  status: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, time, venue, status }) => {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          status === 'ready' ? "bg-green-500/10 text-green-500" : 
          status === 'pending' ? "bg-orange-500/10 text-orange-500" : "bg-white/5 text-slate-500"
        )}>
          {status === 'ready' ? <CheckCircle2 /> : <Clock />}
        </div>
        <div>
          <h4 className="font-bold group-hover:text-indigo-400 transition-colors">{title}</h4>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">{time} • {venue}</p>
        </div>
      </div>
      <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
        <ArrowUpRight size={18} />
      </button>
    </div>
  );
}
