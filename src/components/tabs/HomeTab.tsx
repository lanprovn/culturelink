'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { CategoryId } from '@/types';
import {
  CATEGORIES,
  EVENTS,
  getEventImage,
  getCategory,
  getVenue,
  removeDiacritics,
} from '@/data/mockData';
import Chip, { LogoBadge } from '@/components/ui/Chip';
import EventCard from '@/components/events/EventCard';
import NotificationModal, { NotificationItem } from '@/components/ui/NotificationModal';
import UserGuideModal from '@/components/ui/UserGuideModal';
import { Bell, SlidersHorizontal, Search, HelpCircle, X } from 'lucide-react';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Đêm nhạc Áo Dài & Nhạc Trịnh',
    message: 'Suất diễn cuối tuần tại Nhà hát Thành phố sắp đầy 90% ghế. Đặt vé sớm để giữ chỗ đẹp!',
    time: '15 phút trước',
    type: 'event',
    isRead: false,
    linkTab: 'home',
  },
  {
    id: 'n2',
    title: 'Ưu đãi Hội viên Plus & Pro',
    message: 'Nâng cấp gói Hội viên để được giảm giá tới 20% toàn bộ vé sự kiện và ưu tiên giữ chỗ 24h.',
    time: '2 giờ trước',
    type: 'promo',
    isRead: false,
    linkTab: 'profile',
  },
  {
    id: 'n3',
    title: 'Khám phá Đường sách Nguyễn Văn Bình',
    message: 'Phiên chợ Sách & Cộng đồng đọc đang diễn ra hôm nay. Vào cửa hoàn toàn miễn phí!',
    time: 'Hôm qua',
    type: 'system',
    isRead: true,
    linkTab: 'home',
  },
];

const HERO_BANNERS = [
  {
    title: 'Sài Gòn về đêm',
    subtitle: 'Âm nhạc & nghệ thuật dưới ánh đèn',
    pos: '50% 50%',
    img: '/assets/events/hero-saigon.jpg',
  },
  {
    title: 'Tay nghề Việt',
    subtitle: 'Workshop sơn mài, áo dài, cà phê',
    pos: '50% 50%',
    img: '/assets/events/hero-craft.jpg',
  },
  {
    title: 'Hương vị phố',
    subtitle: 'Tour ẩm thực Chợ Lớn',
    pos: '50% 50%',
    img: '/assets/events/hero-food.jpg',
  },
];

export default function HomeTab() {
  const { user, setActiveTab, favs } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'pop'>('time');
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showQuickGuide, setShowQuickGuide] = useState(true);

  const unreadNotiCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSelectNotification = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    if (item.linkTab) {
      setActiveTab(item.linkTab);
      setIsNotiOpen(false);
    }
  };

  // Auto-rotate hero banner every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    const query = removeDiacritics(search.trim());

    return EVENTS.filter((e) => {
      if (onlyFavs && !favs.includes(e.id)) return false;
      if (!query) return true;
      const titleMatch = removeDiacritics(e.title).includes(query);
      const catMatch = removeDiacritics(getCategory(e.category).name).includes(query);
      const venueMatch = removeDiacritics(getVenue(e.venueId).name).includes(query);
      return titleMatch || catMatch || venueMatch;
    })
      .filter((e) => !selectedCategory || e.category === selectedCategory)
      .filter((e) => {
        if (priceFilter === 'free') return e.price === 0;
        if (priceFilter === 'paid') return e.price > 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'pop') return b.popularity - a.popularity;
        return a.sessions[0].start.localeCompare(b.sessions[0].start);
      });
  }, [search, selectedCategory, priceFilter, sortBy, onlyFavs, favs]);

  const activeBanner = HERO_BANNERS[activeBannerIdx];

  return (
    <div className="space-y-4">
      {/* 1. Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoBadge size={36} />
          <div>
            <p className="font-bold leading-none">CultureLink</p>
            <p className="text-[11px] text-muted-foreground">Discover Culture. Connect People.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Help & Guide Button */}
          <button
            type="button"
            aria-label="Hướng dẫn sử dụng"
            title="Cẩm nang hướng dẫn"
            onClick={() => setIsGuideOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-soft hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            <HelpCircle className="h-5 w-5 text-brand" />
          </button>

          <button
            type="button"
            aria-label="Thông báo"
            onClick={() => setIsNotiOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-card shadow-soft hover:bg-muted transition-colors cursor-pointer"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadNotiCount > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
            )}
          </button>

          {user ? (
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              aria-label="Cá nhân"
              className="grid h-10 w-10 place-items-center rounded-full overflow-hidden bg-brand font-semibold text-primary-foreground shadow-soft hover:opacity-90 transition-opacity"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{user.name?.[0] ?? 'U'}</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground border border-border/80 shadow-soft hover:bg-muted transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
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
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Realtime Search Bar */}
      <div className="flex items-center gap-2 rounded-full bg-card px-4 py-3 shadow-soft">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          aria-label="Tìm kiếm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sự kiện, địa điểm… (gõ không dấu được)"
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
        />
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary shrink-0">
          TP.HCM
        </span>
        <button
          type="button"
          aria-label="Bộ lọc"
          onClick={() => setShowFilters((prev) => !prev)}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className={`h-5 w-5 transition-colors ${showFilters ? 'text-accent' : 'text-primary'}`} />
        </button>
      </div>

      {/* 3. Filter Drawer (Expandable) */}
      {showFilters && (
        <div className="space-y-2 rounded-[22px] bg-card p-4 shadow-soft text-sm animate-in fade-in-0 duration-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-1">Mức giá:</span>
            <Chip
              on={onlyFavs}
              onClick={() => setOnlyFavs((prev) => !prev)}
            >
              ❤️ Đã lưu ({favs.length})
            </Chip>
            {(['all', 'free', 'paid'] as const).map((filter) => (
              <Chip
                key={filter}
                on={priceFilter === filter}
                onClick={() => setPriceFilter(filter)}
              >
                {{ all: 'Tất cả', free: 'Miễn phí', paid: 'Trả phí' }[filter]}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-border/50">
            <span className="text-xs text-muted-foreground mr-1">Sắp xếp:</span>
            {(['time', 'price', 'pop'] as const).map((sort) => (
              <Chip
                key={sort}
                on={sortBy === sort}
                onClick={() => setSortBy(sort)}
              >
                {{ time: 'Sớm nhất', price: 'Giá thấp', pop: 'Phổ biến' }[sort]}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Quick Onboarding / How-To Banner */}
      {showQuickGuide && (
        <div className="relative overflow-hidden rounded-[22px] bg-brand/5 border border-brand/20 p-4 animate-in fade-in-0 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-primary-foreground text-xs font-bold shrink-0">
                💡
              </span>
              <div>
                <p className="font-bold text-sm text-foreground">3 Bước Trải nghiệm CultureLink</p>
                <p className="text-[11px] text-muted-foreground">Khám phá văn hóa & đặt vé thông minh tại TP.HCM</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQuickGuide(false)}
              aria-label="Ẩn hướng dẫn"
              className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 text-center">
            <div className="rounded-xl bg-card/80 p-2 border border-border/40 shadow-xs">
              <span className="text-base">1️⃣</span>
              <p className="text-[11px] font-bold text-foreground mt-0.5">Khám phá</p>
              <p className="text-[10px] text-muted-foreground">Chọn show, xem bản đồ bán kính</p>
            </div>
            <div className="rounded-xl bg-card/80 p-2 border border-border/40 shadow-xs">
              <span className="text-base">2️⃣</span>
              <p className="text-[11px] font-bold text-foreground mt-0.5">Thanh toán VietQR</p>
              <p className="text-[10px] text-muted-foreground">Quét QR ngân hàng nhận vé tức thì</p>
            </div>
            <div className="rounded-xl bg-card/80 p-2 border border-border/40 shadow-xs">
              <span className="text-base">3️⃣</span>
              <p className="text-[11px] font-bold text-foreground mt-0.5">Quét QR vào cổng</p>
              <p className="text-[10px] text-muted-foreground">Xuất trình vé tại quầy nhà hát</p>
            </div>
          </div>

          <div className="pt-2.5 text-right">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="text-[11px] font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Xem hướng dẫn chi tiết</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Hero Carousel Banner */}
      <div className="relative h-44 overflow-hidden rounded-[26px] shadow-soft">
        <img
          src={getEventImage(activeBanner.img)}
          alt={activeBanner.title}
          className="h-full w-full object-cover transition-all duration-700"
          style={{ objectPosition: activeBanner.pos }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

        <div className="absolute bottom-4 left-4 text-primary-foreground">
          <p className="font-script text-3xl leading-tight">{activeBanner.title}</p>
          <p className="text-sm opacity-90">{activeBanner.subtitle}</p>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-1">
          {HERO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Banner ${idx + 1}`}
              onClick={() => setActiveBannerIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeBannerIdx ? 'w-5 bg-primary-foreground' : 'w-1.5 bg-primary-foreground/50'
                }`}
            />
          ))}
        </div>
      </div>

      {/* 5. 8 Category Horizontal Scroll Pills */}
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              className="flex w-16 shrink-0 flex-col items-center gap-1 text-[11px] group transition-transform active:scale-95"
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-full text-2xl transition-all shadow-xs ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-105'
                  }`}
                style={{ background: cat.color }}
              >
                {cat.emoji}
              </span>
              <span
                className={`text-center leading-tight transition-colors ${isSelected ? 'font-bold text-primary' : 'text-foreground'
                  }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 6. Section "Gợi ý cho bạn" (Only when not actively filtering) */}
      {!search && !selectedCategory && !onlyFavs && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold">Gợi ý cho bạn</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {[...EVENTS]
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, 5)
              .map((event) => (
                <EventCard key={event.id} event={event} wide />
              ))}
          </div>
        </section>
      )}

      {/* 7. Section "Tất cả sự kiện" / "Kết quả" */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">
          {onlyFavs
            ? `Sự kiện đã lưu (${filteredEvents.length})`
            : search || selectedCategory
            ? `Kết quả (${filteredEvents.length})`
            : 'Tất cả sự kiện'}
        </h2>

        {filteredEvents.length === 0 ? (
          <p className="rounded-[22px] bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
            Không tìm thấy sự kiện phù hợp.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={isNotiOpen}
        onClose={() => setIsNotiOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
