'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { House, Map, Sparkles, Ticket, User } from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, user, tickets } = useApp();
  const activeTicketsCount = tickets.filter((t) => t.status === 'active').length;

  const navItems = [
    { id: 'home' as const, label: 'Trang chủ', icon: House },
    { id: 'map' as const, label: 'Culture Map', icon: Map },
    { id: 'match' as const, label: 'Culture Match', icon: Sparkles },
    { id: 'tickets' as const, label: 'Vé của tôi', icon: Ticket },
    { id: 'profile' as const, label: 'Cá nhân', icon: User },
  ];

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-[26px] border border-border bg-card/95 px-1 py-2 shadow-soft backdrop-blur md:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-label={item.label}
            className={`relative flex flex-1 flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className="relative">
              {item.id === 'profile' && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="h-5 w-5 rounded-full object-cover border border-primary/40"
                />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              {item.id === 'tickets' && activeTicketsCount > 0 && (
                <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand px-0.5 text-[8px] font-bold text-primary-foreground leading-none">
                  {activeTicketsCount}
                </span>
              )}
            </div>
            <span>{item.label}</span>
            {isActive && (
              <span className="absolute -bottom-2 h-1 w-6 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
