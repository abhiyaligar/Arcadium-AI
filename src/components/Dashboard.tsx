import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Trophy, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  X,
  CreditCard,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ParticipantDashboard } from './ParticipantDashboard';
import { AdminDashboard } from './AdminDashboard';
import { EventDiscovery } from './EventDiscovery';
import { TeamManagement } from './TeamManagement';
import { ChatSystem } from './ChatSystem';
import { Leaderboard } from './Leaderboard';

type View = 'overview' | 'discovery' | 'teams' | 'chat' | 'leaderboard' | 'admin' | 'settings';

export function Dashboard() {
  const { profile, signOut } = useAuth();
  const [activeView, setActiveView] = useState<View>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isAdmin = profile?.role === 'main_admin' || profile?.role === 'event_admin';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'discovery', label: 'Discover Events', icon: Calendar },
    { id: 'teams', label: 'My Teams', icon: Users },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Manage Fest', icon: Settings });
  }

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return profile?.role === 'participant' ? <ParticipantDashboard /> : <AdminDashboard />;
      case 'discovery':
        return <EventDiscovery />;
      case 'teams':
        return <TeamManagement />;
      case 'chat':
        return <ChatSystem />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div className="p-8">View Coming Soon</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0d0d] border-r border-white/5 transition-transform duration-300 transform md:relative md:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Plus className="text-white" size={18} />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">Arcadium AI</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  activeView === item.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} className={cn(
                  activeView === item.id ? "text-white" : "group-hover:text-indigo-400"
                )} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold">
                {profile?.full_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{profile?.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono truncate">{profile?.role}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-8 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="relative group hidden sm:block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search events, teams..."
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-4 w-64 focus:w-80 focus:border-indigo-500 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors group">
              <Bell size={20} className="text-slate-400 group-hover:text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-black" />
            </button>
            <div className="h-8 w-[1px] bg-white/5 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-mono uppercase text-slate-500 tracking-widest leading-none mb-1">Today's Date</p>
                <p className="text-sm font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
