import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { X, Calendar as CalIcon, MapPin, Users, Tag, AlertCircle, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

interface EventFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function EventForm({ onClose, onSuccess }: EventFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    date: '',
    venue: '',
    category: 'Tech',
    participant_limit: 100,
    status: 'published' as 'draft' | 'published'
  });

  const categories = ['Tech', 'Arts', 'Sports', 'Workshops', 'Gaming', 'Miscellaneous'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          ...formData,
          created_by: user.id,
          current_participants: 0
        });

      if (error) throw error;

      toast.success('Event created successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in scale-in-95 duration-200">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter">NEW FESTIVAL EVENT</h3>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1">Fill in the details to launch your event</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Event Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Pixel Perfect Design"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:outline-none transition-all appearance-none"
                >
                  {categories.map(c => <option key={c} value={c} className="bg-[#0d0d0d]">{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Short Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this event about?"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Rules & Guidelines</label>
              <textarea
                required
                rows={4}
                value={formData.rules}
                onChange={e => setFormData({ ...formData, rules: e.target.value })}
                placeholder="List down the event rules..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-indigo-500 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Date & Time</label>
                <div className="relative">
                  <CalIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    required
                    type="datetime-local"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Venue</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    required
                    type="text"
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Block C Aud."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Participant Limit</label>
                <div className="relative">
                  <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.participant_limit}
                    onChange={e => setFormData({ ...formData, participant_limit: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Publishing Status</label>
                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
                  {(['draft', 'published'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s })}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        formData.status === s ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={18} />
                  Initiate Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
