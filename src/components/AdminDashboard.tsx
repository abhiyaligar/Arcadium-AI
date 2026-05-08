import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Plus, 
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Megaphone,
  MoreVertical,
  Edit,
  Trash,
  Settings
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import { EventForm } from './EventForm';
import { StaffManagement } from './StaffManagement';

type AdminTab = 'overview' | 'staff';

export function AdminDashboard() {
  const { profile } = useAuth();
  const isMainAdmin = profile?.role === 'main_admin';
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [showEventForm, setShowEventForm] = useState(false);
  const [stats, setStats] = useState({
    totalRegs: 0,
    activeEvents: 0,
    revenue: 0,
    teamFormation: 0
  });
  const [recentRegs, setRecentRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      setLoading(true);
      // Fetch stats
      const [regsCount, eventsCount, regsData] = await Promise.all([
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('registrations').select(`
          id,
          payment_status,
          created_at,
          profiles(full_name, email),
          events(title)
        `).order('created_at', { ascending: false }).limit(5)
      ]);

      setStats({
        totalRegs: regsCount.count || 0,
        activeEvents: eventsCount.count || 0,
        revenue: (regsCount.count || 0) * 100, // Example calculation
        teamFormation: 0 // Logic for team stats
      });

      if (regsData.data) {
        setRecentRegs(regsData.data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter mb-2">ADMIN COMMAND</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={cn(
                "text-[10px] font-mono uppercase tracking-widest transition-colors",
                activeTab === 'overview' ? "text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Overview
            </button>
            {isMainAdmin && (
              <button 
                onClick={() => setActiveTab('staff')}
                className={cn(
                  "text-[10px] font-mono uppercase tracking-widest transition-colors",
                  activeTab === 'staff' ? "text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Staff Control
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 font-bold text-sm tracking-widest uppercase transition-all flex items-center gap-2">
            <Megaphone size={18} />
            Post Updates
          </button>
          <button 
            onClick={() => setShowEventForm(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            New Event
          </button>
        </div>
      </div>

      {showEventForm && (
        <EventForm 
          onClose={() => setShowEventForm(false)} 
          onSuccess={fetchAdminData} 
        />
      )}

      {activeTab === 'staff' ? (
        <StaffManagement />
      ) : (
        <>
          {/* Admin Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="TOTAL REGISTRATIONS" value={stats.totalRegs.toString()} icon={<Users />} color="indigo" />
            <StatCard title="ACTIVE EVENTS" value={stats.activeEvents.toString()} icon={<Calendar />} color="blue" />
            <StatCard title="REVENUE (TOKEN)" value={stats.revenue.toLocaleString()} icon={<DollarSign />} color="green" />
            <StatCard title="TEAM FORMATION" value={`${stats.teamFormation}%`} icon={<TrendingUp />} color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Registrations */}
            <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold italic tracking-tight uppercase">Recent Activity</h3>
                <button className="text-xs font-mono uppercase text-slate-500 hover:text-white">View Logs</button>
              </div>
              <div className="space-y-4">
                {recentRegs.length > 0 ? recentRegs.map((reg) => (
                  <UserRow 
                    key={reg.id}
                    name={reg.profiles?.full_name || 'Unknown'} 
                    email={reg.profiles?.email || ''} 
                    event={reg.events?.title || 'Unknown Event'} 
                    status={reg.payment_status === 'completed' ? 'paid' : 'pending'} 
                  />
                )) : (
                  <p className="text-center text-slate-500 py-10 font-mono text-xs italic">NO RECENT REGISTRATIONS</p>
                )}
              </div>
            </div>

            {/* Role Scoped Tools */}
            <div className="p-8 rounded-[32px] bg-indigo-600/10 border border-indigo-500/20 flex flex-col justify-center space-y-6">
              <div className="text-center space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto rotate-12">
                  <ShieldCheck className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Security & Permissions</h3>
                <p className="text-slate-400 text-sm italic">
                  {isMainAdmin 
                    ? "You have global read/write access. Manage event admins and global system parameters."
                    : "Manage scores, leaderboard, and participant verification for your assigned events."}
                </p>
                <div className="pt-4 grid grid-cols-2 gap-3">
                  {isMainAdmin ? (
                    <button 
                      onClick={() => setActiveTab('staff')}
                      className="p-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all border border-transparent shadow-lg shadow-indigo-600/20"
                    >
                      Manage Staff
                    </button>
                  ) : (
                    <button className="p-4 bg-white/5 rounded-2xl text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5">
                      Staff List
                    </button>
                  )}
                  <button className="p-4 bg-white/5 rounded-2xl text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5">
                    Audit Trail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, change, icon, color }: { title: string, value: string, change?: string, icon: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };

  return (
    <div className={cn("p-6 rounded-[24px] border space-y-4 bg-white/5", colors[color])}>
      <div className="flex items-center justify-between">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        {change && <span className="text-xs font-mono font-bold">{change}</span>}
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-black italic text-white">{value}</p>
      </div>
    </div>
  );
}

function UserRow({ name, email, event, status }: { name: string, email: string, event: string, status: 'paid' | 'pending', key?: any }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 transition-all hover:bg-white/10 group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-slate-400">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{event}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          status === 'paid' ? "bg-green-500/20 text-green-500" : "bg-orange-500/20 text-orange-500"
        )}>
          {status}
        </span>
        <button className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
