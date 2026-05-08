import React from 'react';
import { motion } from 'motion/react';
import { Zap, Calendar, Users, Trophy, MessageSquare, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onAuthClick: () => void;
}

export function LandingPage({ onAuthClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-bottom border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tighter">ARCADIUM AI</span>
          </div>
          <button 
            onClick={onAuthClick}
            className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-slate-200 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-indigo-400 font-mono text-sm tracking-widest uppercase mb-4 block">
                The Ultimate College Fest Portal
              </span>
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 italic">
                CRAFT YOUR <br />
                <span className="text-transparent border-text stroke-white" style={{ WebkitTextStroke: '1px white' }}>
                  FESTIVAL 
                </span> <br />
                LEGACY.
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-xl">
                The all-in-one platform for campus organizers and participants to create, 
                discover, and dominate college festivals.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={onAuthClick}
                  className="px-8 py-4 bg-indigo-600 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all flex items-center gap-2 group"
                >
                  Join the Fest 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex -space-x-4 items-center pl-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=user${i}`} alt="user" />
                    </div>
                  ))}
                  <span className="pl-6 text-sm text-slate-500 font-medium font-mono">
                    +2,400 Students Registered
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Calendar className="text-orange-500" />}
            title="Event Discovery"
            desc="Explore multi-category events from dynamic tech workshops to creative arts."
          />
          <FeatureCard 
            icon={<Users className="text-blue-500" />}
            title="Team Builder"
            desc="Form teams, recruit open-slot members, and collaborate in real-time."
          />
          <FeatureCard 
            icon={<Trophy className="text-yellow-500" />}
            title="Live Leaderboard"
            desc="Real-time score updates and rankings. Watch the competition heat up."
          />
          <FeatureCard 
            icon={<MessageSquare className="text-green-500" />}
            title="Secure Chat"
            desc="Direct channels for team discussion and coordinator announcements."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Zap size={20} />
            <span className="font-bold tracking-tighter">ARCADIUM AI</span>
          </div>
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
            Made for the next generation of creators.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
