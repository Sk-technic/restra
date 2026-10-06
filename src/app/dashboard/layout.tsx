'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Loader } from '@/components/Loader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader size="lg" text="Restra Suite" subtitle="Verifying authorized session..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex p-2.5 sm:p-3 lg:p-4 gap-3 lg:gap-4 antialiased selection:bg-primary-500/30 relative">
      {/* Dynamic Themed Angled Gradient & Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Angled Ambient Beam 1 (Left Magenta/Crimson Glow) */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-pink-600/25 via-rose-600/15 to-transparent dark:from-pink-600/30 dark:via-rose-600/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Angled Ambient Beam 2 (Right Electric Indigo/Violet Glow) */}
        <div className="absolute top-1/4 -right-40 w-[700px] h-[700px] bg-gradient-to-bl from-indigo-600/25 via-purple-600/15 to-transparent dark:from-indigo-600/30 dark:via-purple-600/20 rounded-full blur-[150px] pointer-events-none" />

        {/* Angled Ambient Beam 3 (Bottom Ocean Sapphire Glow) */}
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-t from-sky-500/20 via-blue-600/15 to-transparent dark:from-sky-500/25 dark:via-blue-600/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Diagonal Gradient Mesh Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(219,39,119,0.04)_0%,transparent_45%,rgba(99,102,241,0.04)_100%)] pointer-events-none" />
      </div>

      {/* Floating Glassmorphic Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Panel running directly on background without border or container curves */}
      <div className="relative z-10 flex-1 h-full min-w-0 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-2 sm:p-2 lg:p-2 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
