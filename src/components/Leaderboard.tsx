import React, { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Search, User, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export function Leaderboard() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          id,
          score,
          rank,
          teams(name),
          profiles(full_name),
          events(category)
        `)
        .order('rank', { ascending: true });

      if (data) setStandings(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter mb-2">HALL OF FAME</h2>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Real-time standings across all festival events.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
      ) : (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-8 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] px-4">
              <span className="w-8 text-center">Rank</span>
              <span className="w-64">Team / Name</span>
              <span className="w-32">Category</span>
              <span>Score</span>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {standings.length > 0 ? (
              standings.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-6 hover:bg-white/[0.02] group transition-all">
                  <div className="flex items-center gap-8 px-4">
                    <span className={cn(
                      "w-8 font-black italic text-xl text-center",
                      item.rank === 1 ? "text-yellow-500" : item.rank === 2 ? "text-slate-400" : item.rank === 3 ? "text-orange-600" : "text-slate-600"
                    )}>
                      {item.rank?.toString().padStart(2, '0') || '--'}
                    </span>
                    <div className="w-64 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                        <User size={18} className="text-slate-500" />
                      </div>
                      <span className="font-bold text-lg">
                        {item.teams?.name || item.profiles?.full_name || 'Anonymous Competitor'}
                      </span>
                    </div>
                    <span className="w-32 text-xs font-mono text-slate-500 uppercase tracking-widest leading-none">
                      {item.events?.category || 'General'}
                    </span>
                    <span className="font-black text-xl text-indigo-400">{item.score || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <Trophy size={48} className="text-slate-800" />
                <div>
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">LEADERBOARD IS EMPTY</p>
                  <p className="text-slate-600 text-sm italic">Rankings will appear as events conclude.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
