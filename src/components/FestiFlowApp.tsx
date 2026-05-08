import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { LandingPage } from './LandingPage';
import { AuthForm } from './AuthForm';
import { Dashboard } from './Dashboard';
import { Loader2 } from 'lucide-react';

export function FestiFlowApp() {
  const { session, profile, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // If showing auth page
  if (showAuth && !session) {
    return <AuthForm onBack={() => setShowAuth(false)} />;
  }

  // If logged in
  if (session && profile) {
    return <Dashboard />;
  }

  // Otherwise show landing page
  return <LandingPage onAuthClick={() => setShowAuth(true)} />;
}
