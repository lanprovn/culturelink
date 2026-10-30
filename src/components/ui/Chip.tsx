'use client';

import React from 'react';

interface ChipProps {
  on?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function Chip({ on, onClick, children }: ChipProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        on
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-secondary text-secondary-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

export function DemoBadge({ text = 'DEMO' }: { text?: string }) {
  return (
    <span className="rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
      {text}
    </span>
  );
}

export function LogoBadge({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative grid place-items-center rounded-2xl bg-brand font-bold text-primary-foreground shadow-soft"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      C
      <span className="absolute -right-1 -top-1 text-xs">✦</span>
    </div>
  );
}
