import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { X, Check, Trash2, MessageSquare, Users, Shield, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

import { EmailService } from '../services/emailService';

interface TeamDetailsModalProps {
  team: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function TeamDetailsModal({ team, onClose, onUpdate }: TeamDetailsModalProps) {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat');

  useEffect(() => {
    fetchMembers();
    fetchMessages();

    // Poll for new messages every 5 seconds since real-time/websockets are disabled
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [team.id]);

  async function fetchMembers() {
    setLoadingMembers(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('*, profiles(full_name, email, avatar_url, student_id)')
      .eq('team_id', team.id);
    
    if (data) setMembers(data);
    setLoadingMembers(false);
  }

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('team_id', team.id)
      .order('created_at', { ascending: true });
    
    if (data) {
      // Map fields if necessary to match expected UI usage
      const formattedMessages = data.map((msg: any) => ({
        ...msg,
        content: msg.text || msg.content, // Fallback for flexibility
        profile_id: msg.sender_id || msg.profile_id
      }));
      setMessages(formattedMessages);
    }
  }

  const handleApprove = async (memberId: string, name: string) => {
    if (!confirm(`APPROVE "${name.toUpperCase()}" TO JOIN THE SQUAD?`)) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status: 'approved' })
        .eq('id', memberId);

      if (error) throw error;
      
      // Send approval email
      const member = members.find(m => m.id === memberId);
      const mProfileData = member?.profiles;
      const mProfile = Array.isArray(mProfileData) ? mProfileData[0] : mProfileData;
      
      if (mProfile?.email) {
        EmailService.sendJoinSquadApproval(mProfile.email, mProfile.full_name, team.name);
      }

      // Increment member count in teams table
      await supabase.rpc('increment_team_count', { team_id_input: team.id });
      
      toast.success(`${name} is now a squad member!`);
      fetchMembers();
      onUpdate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDecline = async (memberId: string, name: string) => {
    if (!confirm(`DECLINE "${name.toUpperCase()}"'S REQUEST?`)) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      toast.success('Request declined');
      fetchMembers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSendingMsg(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          team_id: team.id,
          sender_id: user.id, // Try sender_id first
          text: newMessage    // Try text first
        });

      if (error) {
        // If sender_id/text fail, try profile_id/content as fallback
        const { error: retryError } = await supabase
          .from('messages')
          .insert({
            team_id: team.id,
            profile_id: user.id,
            content: newMessage
          });
        if (retryError) throw retryError;
      }
      setNewMessage('');
      fetchMessages();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSendingMsg(false);
    }
  };

  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');
  const myMemberInfo = members.find(m => m.profile_id === user?.id);
  const isApproved = myMemberInfo?.status === 'approved' || team.is_leader;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl h-[80vh] rounded-[40px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-900/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tight">{team.name.toUpperCase()}</h3>
              <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">{team.events?.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-8 pt-2 bg-black/20">
          <button 
            onClick={() => setActiveTab('chat')}
            className={cn(
              "px-6 py-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border-b-2",
              activeTab === 'chat' ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            <MessageSquare size={16} /> Team Chat
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={cn(
              "px-6 py-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative",
              activeTab === 'members' ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            <Users size={16} /> Squad List
            {team.is_leader && pendingMembers.length > 0 && (
              <span className="absolute top-3 right-2 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {!isApproved ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
                    <div className="p-6 bg-orange-500/10 rounded-3xl text-orange-500">
                      <Shield size={48} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold uppercase tracking-tighter italic">Signal Blocked</h4>
                      <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">
                        You are currently in the waiting room. Chat access will be restored once the Team Leader approves your request.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {team.is_leader && pendingMembers.length > 0 && (
                      <div className="mb-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-500 rounded-lg text-white">
                            <Shield size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-widest">
                              {pendingMembers.length} NEW SQUAD REQUESTS
                            </p>
                            <p className="text-[8px] text-orange-500/60 font-mono uppercase tracking-tighter mt-0.5">Awaiting your approval in Squad List</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveTab('members')}
                          className="text-[10px] font-black uppercase tracking-widest bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-orange-500/20"
                        >
                          Review
                        </button>
                      </div>
                    )}
                    {messages.length > 0 ? messages.map((msg) => (
                      <div key={msg.id} className={cn(
                        "flex flex-col gap-1 max-w-[80%]",
                        msg.profile_id === user?.id ? "ml-auto items-end" : "items-start"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{msg.profiles?.full_name}</span>
                        </div>
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-sm",
                          msg.profile_id === user?.id 
                            ? "bg-indigo-600 text-white rounded-tr-none" 
                            : "bg-white/5 text-slate-200 rounded-tl-none border border-white/5"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                        <MessageSquare size={48} />
                        <p className="text-xs font-mono uppercase tracking-widest">No signals detected yet...</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-8 border-t border-white/5 bg-black/40">
                <div className="flex gap-3">
                  <input 
                    disabled={!isApproved}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isApproved ? "TYPE YOUR MESSAGE..." : "CHAT RESTRICTED"}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button 
                    disabled={sendingMsg || !isApproved}
                    className="p-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {sendingMsg ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {/* Pending Requests Section */}
              {team.is_leader && pendingMembers.length > 0 && (
                <div className="mb-10 space-y-4">
                  <h4 className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Shield size={14} /> Pending Requests
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {pendingMembers.map((m) => (
                      <div key={m.id} className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center font-bold text-orange-400">
                            {m.profiles?.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{m.profiles?.full_name}</p>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{m.profiles?.student_id || 'ID NOT VERIFIED'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApprove(m.id, m.profiles?.full_name || 'User')}
                            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-lg shadow-green-500/20"
                          >
                            <Check size={20} />
                          </button>
                          <button 
                            onClick={() => handleDecline(m.id, m.profiles?.full_name || 'User')}
                            className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Members List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Users size={14} /> Active Squad
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {approvedMembers.map((m) => (
                    <div key={m.id} className="p-5 rounded-[28px] bg-white/2 border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold ring-1 ring-white/10">
                        {m.profiles?.avatar_url ? (
                          <img src={m.profiles.avatar_url} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          m.profiles?.full_name?.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{m.profiles?.full_name}</p>
                          {m.role === 'leader' && <Shield size={12} className="text-yellow-500" />}
                        </div>
                        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
