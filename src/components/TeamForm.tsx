import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { X, Users, Lock, Unlock, Loader2, Save, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Event } from '../types';

interface TeamFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function TeamForm({ onClose, onSuccess }: TeamFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [fetchingEvents, setFetchingEvents] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    event_id: '',
    is_open: true,
  });

  useEffect(() => {
    fetchMyEvents();
  }, []);

  async function fetchMyEvents() {
    try {
      // Find events the user is registered for
      const { data, error } = await supabase
        .from('registrations')
        .select('events(*)')
        .eq('profile_id', user?.id);

      if (error) throw error;
      
      const registeredEvents = (data?.map(r => r.events) as any[]).filter(Boolean) as Event[];
      setEvents(registeredEvents);
      if (registeredEvents.length > 0) {
        setFormData(prev => ({ ...prev, event_id: registeredEvents[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingEvents(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.event_id) return;
    
    setLoading(true);
    try {
      // 1. Generate a unique join key
      const joinKey = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 2. Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: formData.name,
          event_id: formData.event_id,
          created_by: user.id,
          is_open: formData.is_open,
          member_count: 1,
          join_code: joinKey // Assume this column exists or was added
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // 3. Add creator as the leader
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          profile_id: user.id,
          role: 'leader',
          status: 'approved'
        });

      if (memberError) throw memberError;

      toast.success(`Team "${formData.name}" created! Join Key: ${joinKey}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in scale-in-95 duration-200">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter">CREATE A SQUAD</h3>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1">Recruit members and prepare for battle</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 ml-1">Team Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Shadow Realm Masters"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 ml-1">Select Event</label>
              <div className="relative">
                <select
                  required
                  value={formData.event_id}
                  onChange={e => setFormData({ ...formData, event_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:outline-none transition-all appearance-none"
                  disabled={fetchingEvents}
                >
                  {events.length > 0 ? (
                    events.map(ev => <option key={ev.id} value={ev.id} className="bg-[#0d0d0d]">{ev.title}</option>)
                  ) : (
                    <option className="bg-[#0d0d0d]">No registered events found</option>
                  )}
                </select>
                {fetchingEvents ? (
                  <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-slate-500" size={16} />
                ) : (
                  <Search size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                )}
              </div>
              {events.length === 0 && !fetchingEvents && (
                <p className="text-[10px] text-orange-500 italic mt-1 font-mono">You must register for an event first.</p>
              )}
            </div>

            <div className="pt-4">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 block ml-1">Recruitment Status</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_open: !formData.is_open })}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                  formData.is_open 
                    ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-400" 
                    : "bg-white/5 border-white/10 text-slate-500"
                )}
              >
                <div className="flex items-center gap-3">
                  {formData.is_open ? <Unlock size={20} /> : <Lock size={20} />}
                  <span className="font-bold text-sm tracking-widest uppercase">
                    {formData.is_open ? 'Open Recruitment' : 'Private Squad'}
                  </span>
                </div>
                <div className={cn(
                  "w-4 h-4 rounded-full",
                  formData.is_open ? "bg-indigo-500 shadow-lg shadow-indigo-500/50" : "bg-slate-700"
                )} />
              </button>
              <p className="text-[10px] text-slate-600 mt-3 font-mono leading-relaxed pl-1">
                {formData.is_open 
                  ? "Others can find and join your team from the Open Recruitments list." 
                  : "Only people with your unique team join key can find this squad."}
              </p>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 font-bold uppercase tracking-widest text-xs text-slate-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || events.length === 0}
              className="flex-[2] py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
              CREATE TEAM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
