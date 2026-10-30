'use client';

import React from 'react';
import { X, Bell, CheckCheck, Sparkles, Ticket, Gift, Compass } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'ticket' | 'promo' | 'event' | 'system';
  isRead: boolean;
  linkTab?: 'home' | 'tickets' | 'profile';
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ticket':
        return <Ticket className="h-5 w-5 text-indigo-500" />;
      case 'promo':
        return <Gift className="h-5 w-5 text-pink-500" />;
      case 'event':
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      default:
        return <Compass className="h-5 w-5 text-emerald-500" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-card rounded-[26px] shadow-2xl border border-border/60 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-brand">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Hộp thông báo</h3>
              <p className="text-[11px] text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                title="Đánh dấu tất cả là đã đọc"
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-border/40 p-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 opacity-40 mb-2" />
              <p className="text-sm">Chưa có thông báo nào</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectNotification?.(item)}
                className={`flex gap-3.5 p-3.5 rounded-2xl transition-colors cursor-pointer ${
                  item.isRead ? 'hover:bg-muted/40 opacity-75' : 'bg-brand/5 hover:bg-brand/10'
                }`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card shadow-xs border border-border/40">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm ${item.isRead ? 'font-medium text-foreground' : 'font-bold text-foreground'}`}>
                      {item.title}
                    </p>
                    {!item.isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 mt-1 font-medium">
                    {item.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/20 border-t border-border/40 p-3 text-center">
          <p className="text-[11px] text-muted-foreground">
            Thông báo văn hóa & ưu đãi từ hệ sinh thái CultureLink Sài Gòn
          </p>
        </div>
      </div>
    </div>
  );
}

