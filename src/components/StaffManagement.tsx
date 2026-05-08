import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, UserPlus, Mail, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

export function StaffManagement() {
  const [email, setEmail] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchStaff();
  }, []);

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('id, title');
    if (data) setEvents(data);
  }

  async function fetchStaff() {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          managed_events:events(id, title)
        `)
        .in('role', ['main_admin', 'event_admin'])
        .order('role', { ascending: true });

      if (error) throw error;
      setStaff(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setFetching(false);
    }
  }

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // Find user by email
      const { data: userProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!userProfile) {
        toast.error('User with this email not found. They must register first.');
        return;
      }

      // Update role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'event_admin' })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      // If an event is selected, assign it
      if (selectedEventId) {
        await supabase
          .from('events')
          .update({ coordinator_id: userProfile.id })
          .eq('id', selectedEventId);
      }

      toast.success(`${userProfile.full_name} assigned as Event Admin`);
      setEmail('');
      setSelectedEventId('');
      fetchStaff();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (profileId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove staff privileges from ${name}?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'participant' })
        .eq('id', profileId);

      if (error) throw error;
      toast.success('Role removed');
      fetchStaff();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-400">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-black italic tracking-tight">STAFF ACCESS CONTROL</h3>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Assign administrative privileges to trusted collaborators.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAssignRole} className="p-8 rounded-[32px] bg-[#0d0d0d] border border-white/5 space-y-6">
            <div className="space-y-4">
              <div className="p-3 bg-indigo-600/20 rounded-xl w-fit text-indigo-400">
                <UserPlus size={20} />
              </div>
              <h4 className="text-lg font-bold">Assign Event Admin</h4>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                Enter the registered email address of the user you want to promote to Event Admin.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:border-indigo-500 focus:outline-none transition-all text-sm text-slate-300"
              >
                <option value="" className="bg-black text-white text-xs">Assign to Specific Event (Optional)</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id} className="bg-black text-white text-xs">
                    {ev.title}
                  </option>
                ))}
              </select>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Grant Access'}
              </button>
            </div>
          </form>
        </div>

        {/* Current Staff List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.4em]">Current Authority</h4>
            <span className="text-[10px] font-mono text-indigo-400">{staff.length} Active Staff</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {fetching ? (
              <div className="py-20 flex justify-center text-slate-700">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : staff.length > 0 ? staff.map((s) => (
              <div key={s.id} className="p-6 rounded-3xl bg-white/2 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold",
                    s.role === 'main_admin' ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                  )}>
                    {s.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{s.full_name}</p>
                      {s.role === 'main_admin' && <Shield size={12} className="text-indigo-400" />}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">{s.email}</p>
                    {s.managed_events && s.managed_events.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.managed_events.map((ev: any) => (
                          <span key={ev.id} className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
                            {ev.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono",
                    s.role === 'main_admin' ? "bg-indigo-500/10 text-indigo-400" : "bg-white/5 text-slate-500"
                  )}>
                    {s.role.replace('_', ' ')}
                  </span>
                  {s.role === 'event_admin' && (
                    <button 
                      onClick={() => handleRemoveRole(s.id, s.full_name)}
                      className="p-2 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center text-slate-500 italic font-mono text-xs">
                No staff members found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
