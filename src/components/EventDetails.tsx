import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  X, 
  Calendar as CalIcon, 
  MapPin, 
  Users, 
  Info, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Ticket,
  ShieldAlert
} from 'lucide-react';
import { formatDate, generateTicketId, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { Event } from '../types';

interface EventDetailsProps {
  eventId: string;
  onClose: () => void;
  onRegistered: () => void;
}

export function EventDetails({ eventId, onClose, onRegistered }: EventDetailsProps) {
  const { profile, user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    checkRegistration();
  }, [eventId]);

  async function fetchEventDetails() {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    } else {
      setEvent(data);
    }
    setLoading(false);
  }

  async function checkRegistration() {
    if (!user) return;
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (data) setIsRegistered(true);
  }

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register');
      return;
    }

    if (isRegistered) {
      toast('You are already registered for this event');
      return;
    }

    setRegistering(true);
    try {
      const ticketId = generateTicketId();
      
      const { error: regError } = await supabase
        .from('registrations')
        .insert({
          profile_id: user.id,
          event_id: eventId,
          payment_status: 'completed', // For demo, assume instant payment
          ticket_id: ticketId
        });

      if (regError) throw regError;

      // Update participant count
      if (event) {
        await supabase
          .from('events')
          .update({ current_participants: (event.current_participants || 0) + 1 })
          .eq('id', eventId);
      }

      toast.success('Registration Successful!');
      setIsRegistered(true);
      onRegistered();
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!event) return null;

  const isFull = event.current_participants >= event.participant_limit;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-[#0d0d0d] w-full max-w-2xl h-full sm:h-screen shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header Image */}
        <div className="h-64 relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
          <div className="absolute inset-0 bg-black/20" />
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-2 bg-black/50 hover:bg-black rounded-full text-white transition-colors z-10"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-6 left-8 right-8">
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
              {event.category}
            </span>
            <h2 className="text-4xl font-black italic tracking-tighter text-white">
              {event.title.toUpperCase()}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-10 border-b border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CalIcon size={12} className="text-indigo-400" /> Date & Time
              </p>
              <p className="text-sm font-bold">{formatDate(event.date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-indigo-400" /> Venue
              </p>
              <p className="text-sm font-bold">{event.venue}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} className="text-indigo-400" /> Availability
              </p>
              <p className="text-sm font-bold">
                {isFull ? 'Sold Out' : `${event.participant_limit - event.current_participants} Slots Left`}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-mono font-black uppercase tracking-[0.2em] text-indigo-400">
              <Info size={14} /> Description
            </h4>
            <p className="text-slate-400 leading-relaxed italic">
              {event.description}
            </p>
          </div>

          {/* Rules */}
          <div className="space-y-4 p-6 rounded-3xl bg-white/5 border border-white/5">
             <h4 className="flex items-center gap-2 text-xs font-mono font-black uppercase tracking-[0.2em] text-orange-400">
              <ShieldAlert size={14} /> Official Rules
            </h4>
            <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
              {event.rules}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/5 bg-[#0a0a0a]">
          {isRegistered ? (
            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" />
                <div>
                  <p className="text-sm font-bold text-green-500">YOU ARE REGISTERED</p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Check your dashboard for the ticket</p>
                </div>
              </div>
              <Ticket className="text-green-500/50" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleRegister}
                disabled={registering || isFull}
                className={cn(
                  "flex-1 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-xl",
                  isFull 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                )}
              >
                {registering ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : isFull ? (
                  'Capacity Reached'
                ) : (
                  <>
                    Secure My Spot <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
