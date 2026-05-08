import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Event } from '../types';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar as CalIcon, 
  Users, 
  Tag, 
  ChevronRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { EventDetails } from './EventDetails';

export function EventDiscovery() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  }

  const categories = ['all', 'Tech', 'Arts', 'Sports', 'Workshops', 'Gaming'];

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                         e.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || e.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter mb-2">DISCOVER EVENTS</h2>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Explore and join the most exciting fest activities.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/5 p-1 rounded-2xl flex gap-1 border border-white/5">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all",
                  category === c ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={event.id}
              className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden group hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div className="aspect-video bg-gradient-to-br from-indigo-900/20 to-purple-900/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {event.category}
                  </span>
                </div>
                <Sparkles className="absolute bottom-4 right-4 text-indigo-500/50 group-hover:text-indigo-400 transition-colors" />
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={14} className="text-indigo-400" />
                    <span className="text-xs truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalIcon size={14} className="text-indigo-400" />
                    <span className="text-xs">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500 font-mono">
                    <span className="text-white font-bold">{event.current_participants}</span> / {event.participant_limit} slots
                  </div>
                  <button 
                    onClick={() => setSelectedEventId(event.id)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group/btn"
                  >
                    View Details <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedEventId && (
        <EventDetails 
          eventId={selectedEventId} 
          onClose={() => setSelectedEventId(null)}
          onRegistered={fetchEvents}
        />
      )}
    </div>
  );
}
