'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sidebar,
  BottomNav,
  HomeTab,
  CultureMapTab,
  CultureMatchTab,
  MyTicketsTab,
  ProfileAdminTab,
  EventDetailModal,
  SplashIntro,
} from '@/components';

export default function CultureLinkPage() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-app text-foreground font-sans relative selection:bg-purple-200 selection:text-purple-900">
      {/* 1. Splash Intro Screen (1.6s on first visit) */}
      <SplashIntro />

      {/* 2. Mobile Floating Bottom Navigation */}
      <BottomNav />

      {/* 3. Desktop Left Sidebar */}
      <Sidebar />

      {/* 4. Main Responsive Content Container */}
      <div className="md:pl-60">
        <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 md:pb-10 min-h-screen">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'map' && <CultureMapTab />}
          {activeTab === 'match' && <CultureMatchTab />}
          {activeTab === 'tickets' && <MyTicketsTab />}
          {activeTab === 'profile' && <ProfileAdminTab />}
        </main>
      </div>

      {/* 5. Global Event Detail & Booking Modal */}
      <EventDetailModal />
    </div>
  );
}
