import React, { useState } from 'react';
import { Send, Hash, Users, Shield, AtSign, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function ChatSystem() {
  const [activeChannel, setActiveChannel] = useState('Global');
  const [message, setMessage] = useState('');

  const channels = [
    { id: 'global', name: 'Global Announcements', type: 'broadcast' },
    { id: 'hack', name: 'Hackathon Coordinator', type: 'staff' },
    { id: 'team1', name: 'Logic Wizards (Team)', type: 'team' },
    { id: 'sports', name: 'Transport Info', type: 'info' },
  ];

  return (
    <div className="h-[calc(100vh-200px)] flex border border-white/5 rounded-[32px] overflow-hidden bg-[#0d0d0d]">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold italic tracking-tighter uppercase text-sm">CHANNELS</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {channels.map((chan) => (
            <button
              key={chan.id}
              onClick={() => setActiveChannel(chan.name)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all group",
                activeChannel === chan.name ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                {chan.type === 'broadcast' ? <Shield size={16} /> : <Hash size={16} />}
                <span className="font-medium">{chan.name.split(' ')[0]}</span>
              </div>
              {chan.type === 'staff' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black/20">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/50">
          <div className="flex items-center gap-3">
            <h3 className="font-bold">{activeChannel}</h3>
            <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              24 Active
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-white transition-colors"><Users size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <ChatMessage 
            user="Coordinator Alex" 
            role="Event Admin" 
            text="The hackathon briefing starts in 10 minutes at Block C! Please be there."
            time="4:05 PM"
            isStaff
          />
          <ChatMessage 
            user="Sarah Chen" 
            role="Participant" 
            text="Is the wifi SSID the same as last year?"
            time="4:06 PM"
          />
          <ChatMessage 
            user="Mike Johnson" 
            role="Participant" 
            text="Yes, 'FEST_GUEST' with the shared password."
            time="4:07 PM"
          />
        </div>

        {/* Input Area */}
        <div className="p-6">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message #${activeChannel.toLowerCase()}...`}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-24 focus:border-indigo-500 focus:outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-2 text-slate-500 hover:text-white transition-colors"><ImageIcon size={18} /></button>
              <button className="p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ user, role, text, time, isStaff }: { user: string, role: string, text: string, time: string, isStaff?: boolean }) {
  return (
    <div className="flex gap-4 group">
      <div className={cn(
        "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold relative",
        isStaff ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
      )}>
        {user.charAt(0)}
        {isStaff && <Shield size={10} className="absolute -bottom-1 -right-1 bg-black rounded-full" />}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-sm font-bold", isStaff ? "text-indigo-400" : "text-white")}>{user}</span>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{time}</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{text}</p>
      </div>
    </div>
  );
}
