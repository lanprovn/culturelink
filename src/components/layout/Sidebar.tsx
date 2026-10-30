'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { LogoBadge } from '@/components/ui/Chip';
import { House, Map, Sparkles, Ticket, User } from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, user, tickets, signInWithGoogle } = useApp();
  const activeTicketsCount = tickets.filter((t) => t.status === 'active').length;

  const navItems = [
    { id: 'home' as const, label: 'Trang chủ', icon: House },
    { id: 'map' as const, label: 'Culture Map', icon: Map },
    { id: 'match' as const, label: 'Culture Match', icon: Sparkles },
    { id: 'tickets' as const, label: 'Vé của tôi', icon: Ticket },
    { id: 'profile' as const, label: 'Cá nhân', icon: User },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-2 border-r border-border bg-card/80 p-5 backdrop-blur md:flex z-30">
      <div className="mb-6 flex items-center gap-2">
        <LogoBadge size={36} />
        <span className="text-lg font-bold">CultureLink</span>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.id === 'tickets' && activeTicketsCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-primary-foreground">
                  {activeTicketsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Section at bottom of Sidebar */}
      <div className="mt-auto pt-3 border-t border-border/60">
        {user ? (
          <button
            onClick={() => setActiveTab('profile')}
            className="flex w-full items-center gap-2.5 rounded-2xl p-2 hover:bg-muted/60 transition-colors text-left"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-bold text-primary-foreground shrink-0">
                {user.name?.[0] ?? 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </button>
        ) : (
          <button
            onClick={() => signInWithGoogle()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card p-2.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Đăng nhập Google</span>
          </button>
        )}
      </div>
    </aside>
  );
}
