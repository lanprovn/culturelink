'use client';

import React, { useState, useEffect } from 'react';
import { LogoBadge } from '@/components/ui/Chip';

export default function SplashIntro() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!sessionStorage.getItem('cl-splash')) {
      const showTimer = setTimeout(() => {
        setShowSplash(true);
      }, 0);

      const hideTimer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('cl-splash', '1');
      }, 1600);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  if (!showSplash) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-app animate-in fade-in-0 duration-300"
      role="status"
    >
      <LogoBadge size={84} />
      <h1 className="text-3xl font-bold text-brand">CultureLink</h1>
      <p className="max-w-xs text-center text-sm text-muted-foreground">
        Kết nối bạn với những trải nghiệm văn hóa tại TP.HCM
      </p>

      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-brand" />
      </div>

      <p className="text-xs text-muted-foreground">Đang tải trải nghiệm…</p>

      <img
        src="/assets/banner.jpg"
        alt=""
        className="absolute bottom-0 h-1/3 w-full object-cover opacity-30 pointer-events-none [mask-image:linear-gradient(transparent,black)]"
      />
    </div>
  );
}
