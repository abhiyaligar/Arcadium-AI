import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Zap, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AuthFormProps {
  onBack: () => void;
}

export function AuthForm({ onBack }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // In a real Supabase setup, a trigger would create the profile.
          // For this app, we'll manually ensure profile creation if the trigger isn't there.
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              role: 'participant', // Default role
            });
          
          if (profileError) console.error('Profile creation error:', profileError);
        }

        toast.success('Account created! Please check your email for verification.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">
      {/* Branding Side */}
      <div className="hidden md:flex w-1/2 bg-indigo-600 p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[100px] opacity-50" />
        
        <div className="z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-indigo-200 hover:text-white transition-colors mb-20"
          >
            <ArrowLeft size={16} /> Back to explore
          </button>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center rotate-6">
              <Zap className="text-indigo-600 fill-indigo-600" size={32} />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter">ARCADIUM AI</h1>
          </div>
          
          <h2 className="text-5xl font-bold leading-tight mb-8">
            Join the <br />
            Digital Heart <br />
            of Campus.
          </h2>
        </div>

        <div className="z-10">
          <p className="text-indigo-200 font-mono text-sm max-w-sm italic opacity-75">
            "The easiest way to organize and participate in our college fest. 
            The real-time updates were a game changer."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-indigo-400" />
            <span className="text-sm font-semibold">Organizing Commitee 2024</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0a]">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 block md:hidden">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-indigo-500" />
              <span className="font-bold tracking-tighter text-xl italic">ARCADIUM AI</span>
            </div>
          </div>

          <h3 className="text-3xl font-bold mb-2">
            {isLogin ? 'Login to continue' : 'Create an account'}
          </h3>
          <p className="text-slate-400 mb-8 font-mono text-sm uppercase tracking-widest">
            {isLogin ? 'Welcome back, student.' : 'Start your festival journey today.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-slate-500 pl-1">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-slate-500 pl-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-slate-500 pl-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
          
          <button 
            onClick={onBack}
            className="mt-6 w-full text-slate-500 hover:text-slate-400 transition-colors text-sm font-mono uppercase tracking-widest md:hidden"
          >
            ← Back to explore
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function ArrowRight({ className, size = 20 }: { className?: string, size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}
