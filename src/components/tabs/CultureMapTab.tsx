'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CategoryId, Venue } from '@/types';
import {
  CATEGORIES,
  VENUES,
  EVENTS,
  getCategory,
  removeDiacritics,
  haversineDistanceKm,
  formatPrice,
} from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import Chip from '@/components/ui/Chip';
import { Search, LocateFixed, Navigation, X } from 'lucide-react';

const MapLeaflet = dynamic(() => import('@/components/map/MapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-cream/50 text-sm text-muted-foreground rounded-[26px]">
      Đang tải bản đồ…
    </div>
  ),
});

const RADIUS_OPTIONS = [1, 2, 5];

interface WeatherData {
  temp: number;
  code: number;
  desc: string;
  icon: string;
}

const getWeatherDetails = (code: number) => {
  if (code === 0) return { desc: 'Trời quang đãng, nắng đẹp', icon: '☀️' };
  if (code === 1 || code === 2) return { desc: 'Ít mây, trời nắng dịu', icon: '🌤️' };
  if (code === 3) return { desc: 'Nhiều mây, thời tiết mát mẻ', icon: '☁️' };
  if (code === 45 || code === 48) return { desc: 'Có sương mù nhẹ', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { desc: 'Mưa phùn rải rác', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { desc: 'Có mưa rào', icon: '🌧️' };
  if (code >= 80 && code <= 82) return { desc: 'Mưa rào từng cơn', icon: '🌧️' };
  if (code >= 95) return { desc: 'Có dông sét, mang theo ô', icon: '⛈️' };
  return { desc: 'Thời tiết ổn định', icon: '☀️' };
};

const formatSessionDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const hour = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const dayOfWeek = d.getDay();
  const weekdayStr = dayOfWeek === 0 ? 'CN' : `Th ${dayOfWeek + 1}`;
  return `${hour}:${min} ${weekdayStr}, ${day}/${month}`;
};

export default function CultureMapTab() {
  const { setSelectedEventId, left } = useApp();

  const [selectedCat, setSelectedCat] = useState<CategoryId | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>('v5');
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(2);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Compute pins
  const pins = useMemo(() => {
    return VENUES.map((venue) => {
      const evs = EVENTS.filter(
        (ev) => ev.venueId === venue.id && (!selectedCat || ev.category === selectedCat)
      );
      return { v: venue, evs };
    })
      .filter((item) => item.evs.length > 0)
      .filter(
        (item) =>
          !searchTerm ||
          removeDiacritics(item.v.name).includes(removeDiacritics(searchTerm)) ||
          removeDiacritics(item.v.district).includes(removeDiacritics(searchTerm))
      )
      .filter((item) => {
        if (!userLocation) return true;
        const dist = haversineDistanceKm(userLocation, item.v);
        return dist <= radiusKm;
      });
  }, [selectedCat, searchTerm, userLocation, radiusKm]);

  const selectedPin = useMemo(() => {
    return pins.find((p) => p.v.id === selectedVenueId) || null;
  }, [pins, selectedVenueId]);

  const activeEvent = selectedPin?.evs[activeEventIndex] || selectedPin?.evs[0] || null;

  // Fetch live weather when selected venue changes
  useEffect(() => {
    if (!selectedPin) return;

    let active = true;

    const fetchWeather = async () => {
      await Promise.resolve();
      if (!active) return;
      setIsWeatherLoading(true);

      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${selectedPin.v.lat}&longitude=${selectedPin.v.lng}&current_weather=true`
        );
        if (!res.ok) throw new Error('Weather request failed');
        const data = await res.json();
        if (!active) return;
        if (data?.current_weather) {
          const { temperature, weathercode } = data.current_weather;
          const details = getWeatherDetails(weathercode);
          setWeather({
            temp: Math.round(temperature),
            code: weathercode,
            desc: details.desc,
            icon: details.icon,
          });
        }
      } catch {
        if (active) setWeather(null);
      } finally {
        if (active) setIsWeatherLoading(false);
      }
    };

    fetchWeather();

    return () => {
      active = false;
    };
  }, [selectedPin]);

  const getDistanceText = (venue: Venue) => {
    if (!userLocation) return null;
    return `${haversineDistanceKm(userLocation, venue).toFixed(1)} km`;
  };

  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setLocationError('Không lấy được vị trí. Hãy cho phép truy cập vị trí và thử lại.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Render Venue & Event Info Card
  const renderDetailCard = (isOverlay: boolean) => {
    if (!selectedPin || !activeEvent) return null;

    return (
      <div
        onMouseDown={(e) => isOverlay && e.stopPropagation()}
        onTouchStart={(e) => isOverlay && e.stopPropagation()}
        className={`rounded-[24px] bg-card/95 backdrop-blur-md p-4 shadow-xl border border-border/80 space-y-3 ${
          isOverlay
            ? 'absolute top-3 right-3 sm:top-4 sm:right-4 z-[999] w-[calc(100%-1.5rem)] sm:w-[350px] max-h-[calc(100%-2rem)] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200'
            : 'animate-in fade-in-0 duration-200'
        }`}
      >
        {/* Top Direction Button */}
        <div className="relative">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.v.lat},${selectedPin.v.lng}`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-2.5 px-4 text-xs font-bold text-primary-foreground shadow-md hover:opacity-95 transition-all text-center"
          >
            <Navigation className="h-4 w-4 shrink-0 fill-current" />
            Chỉ đường trên Google Maps
          </a>

          {isOverlay && (
            <button
              type="button"
              onClick={() => {
                setSelectedVenueId(null);
                setWeather(null);
              }}
              className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-muted/80 text-foreground hover:bg-muted shadow-sm"
              aria-label="Đóng"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Weather section */}
        <div className="rounded-2xl bg-muted/30 p-2.5 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
              <span className="text-sm">{weather ? weather.icon : '☀️'}</span>
              <span>Thời tiết tại địa điểm</span>
            </div>
            {weather && (
              <span className="text-xs font-bold text-primary">{weather.temp}°C</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground pl-5 leading-tight">
            {isWeatherLoading
              ? 'Đang kiểm tra thời tiết…'
              : weather
              ? `${weather.desc} (khu vực ${selectedPin.v.district})`
              : 'Chưa kết nối dữ liệu thời tiết trực tiếp.'}
          </p>
        </div>

        <div className="h-px bg-border/60" />

        {/* Multi-events tabs if venue has > 1 event */}
        {selectedPin.evs.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {selectedPin.evs.map((ev, idx) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => setActiveEventIndex(idx)}
                className={`px-2.5 py-1 text-[11px] rounded-full transition-all shrink-0 font-medium ${
                  activeEvent.id === ev.id
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {ev.title.length > 20 ? ev.title.slice(0, 20) + '…' : ev.title}
              </button>
            ))}
          </div>
        )}

        {/* Event Title, Summary, Price */}
        <div className="space-y-1">
          <h3 className="font-bold text-foreground text-sm leading-snug">
            {activeEvent.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {activeEvent.summary}
          </p>
          <p className="text-sm font-bold text-primary pt-0.5">
            {formatPrice(activeEvent.price)} / vé
          </p>
        </div>

        {/* Sessions & Tickets Left */}
        <div className="space-y-2 pt-1 border-t border-border/40">
          {activeEvent.sessions.map((session) => {
            const remaining = left[session.id] ?? session.left;
            return (
              <div key={session.id} className="space-y-0.5 text-xs">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <span>📅</span>
                  <span>{formatSessionDateTime(session.start)}</span>
                </p>
                <p className="flex items-center gap-1.5 text-primary pl-5 font-semibold text-[11px]">
                  <span>🎟️</span>
                  <span>
                    Còn {remaining} vé · Sức chứa {session.capacity}
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Collapsible Activity Content */}
        <div className="pt-1 border-t border-border/40 space-y-1.5">
          <button
            type="button"
            onClick={() => setIsActivityExpanded(!isActivityExpanded)}
            className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer select-none"
          >
            <span className="text-[10px] text-primary">{isActivityExpanded ? '▼' : '▶'}</span>
            <span>Nội dung hoạt động</span>
          </button>

          {isActivityExpanded && (
            <div className="rounded-xl bg-muted/40 p-2.5 text-xs text-muted-foreground space-y-1 animate-in fade-in-50 duration-150">
              {activeEvent.program && activeEvent.program.length > 0 && (
                <ul className="space-y-1 pl-1">
                  {activeEvent.program.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-foreground/90">
                      <span className="text-primary">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeEvent.requirements && (
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 mt-1.5">
                  <span className="font-semibold text-foreground/80">Lưu ý: </span>
                  {activeEvent.requirements}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Detail & Booking Action Button */}
        <button
          type="button"
          onClick={() => setSelectedEventId(activeEvent.id)}
          className="w-full rounded-full bg-primary/15 py-2.5 text-xs font-bold text-primary hover:bg-primary/25 transition-all text-center cursor-pointer shadow-sm"
        >
          Xem chi tiết & đặt vé
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3 pb-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Culture Map</h1>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-soft">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          aria-label="Tìm địa điểm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm địa điểm (ví dụ: Bảo tàng, Chợ Bến Thành...)"
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
        <Chip on={!selectedCat} onClick={() => setSelectedCat(null)}>
          Tất cả
        </Chip>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            on={selectedCat === cat.id}
            onClick={() => setSelectedCat(cat.id)}
          >
            {cat.emoji} {cat.name}
          </Chip>
        ))}
      </div>

      {/* Mode Switcher & GPS Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip on={viewMode === 'map'} onClick={() => setViewMode('map')}>
          Bản đồ
        </Chip>
        <Chip on={viewMode === 'list'} onClick={() => setViewMode('list')}>
          Danh sách
        </Chip>

        <span className="mx-1 h-5 w-px bg-border" />

        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition-opacity disabled:opacity-60"
        >
          <LocateFixed className="h-4 w-4" />
          {isLocating ? 'Đang định vị…' : userLocation ? 'Cập nhật vị trí' : 'Vị trí của tôi'}
        </button>

        {userLocation &&
          RADIUS_OPTIONS.map((r) => (
            <Chip key={r} on={radiusKm === r} onClick={() => setRadiusKm(r)}>
              {r} km
            </Chip>
          ))}
      </div>

      {/* Alerts & Info */}
      {locationError && (
        <p className="rounded-2xl bg-warning/20 px-4 py-2 text-xs text-foreground">
          {locationError}
        </p>
      )}

      {/* Map Usage Guide Hint */}
      {!userLocation && (
        <div className="flex items-center gap-2 rounded-2xl bg-brand/5 border border-brand/20 px-3.5 py-2 text-xs text-muted-foreground animate-in fade-in-0 duration-200">
          <span className="text-sm shrink-0">📍</span>
          <span>Bấm <strong>Vị trí của tôi</strong> để tự động tìm các sự kiện quanh bạn trong bán kính 1km - 5km. Nhấn vào từng điểm ghim để xem thời tiết, nội dung diễn và chỉ đường.</span>
        </div>
      )}

      {userLocation && (
        <p className="text-xs text-muted-foreground">
          Đang hiển thị {pins.length} địa điểm trong bán kính {radiusKm} km quanh bạn.
        </p>
      )}

      {/* Map View / List View */}
      {viewMode === 'map' ? (
        <div className="relative h-[72vh] min-h-[460px] overflow-hidden rounded-[26px] shadow-soft bg-cream/30 border border-border/40">
          <MapLeaflet
            pins={pins}
            me={userLocation}
            radiusKm={radiusKm}
            sel={selectedVenueId}
            onSelect={(venueId) => {
              setSelectedVenueId(venueId);
              setActiveEventIndex(0);
            }}
          />

          {/* Floating Detail Card over the map */}
          {renderDetailCard(true)}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {pins.map(({ v, evs }) => {
              const firstCat = getCategory(evs[0].category);
              const dist = getDistanceText(v);
              const isSelected = selectedVenueId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedVenueId(v.id);
                    setActiveEventIndex(0);
                  }}
                  className={`flex w-full justify-between items-center rounded-2xl p-3 text-left text-sm shadow-soft transition-all ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-card hover:bg-muted/50'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-foreground">
                      {firstCat.emoji} {v.name}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {v.district} · {evs.length} sự kiện
                    </p>
                  </div>
                  {dist && <span className="text-xs font-semibold text-primary">{dist}</span>}
                </button>
              );
            })}

            {pins.length === 0 && (
              <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
                Không có hoạt động nào trong bán kính này. Thử mở rộng bán kính.
              </p>
            )}
          </div>

          {/* Details below list view */}
          {renderDetailCard(false)}
        </div>
      )}
    </div>
  );
}
