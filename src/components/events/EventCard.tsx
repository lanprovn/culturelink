'use client';

import React from 'react';
import { EventItem } from '@/types';
import { useApp } from '@/context/AppContext';
import { getEventImage, getCategory, getVenue, formatDate, formatPrice } from '@/data/mockData';
import { Calendar, MapPin, Heart } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  wide?: boolean;
}

export default function EventCard({ event, wide }: EventCardProps) {
  const { favs, toggleFav, setSelectedEventId } = useApp();
  const isFav = favs.includes(event.id);
  const category = getCategory(event.category);
  const venue = getVenue(event.venueId);

  return (
    <div
      className={`overflow-hidden rounded-[22px] bg-card shadow-soft transition-all duration-300 hover:shadow-md ${
        wide ? 'w-64 shrink-0' : ''
      }`}
    >
      <div className="relative h-36 overflow-hidden">
        <button
          onClick={() => setSelectedEventId(event.id)}
          className="h-full w-full block text-left"
          aria-label={`Xem chi tiết ${event.title}`}
        >
          <img
            src={getEventImage(event.img)}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            style={{ objectPosition: event.pos }}
          />
        </button>

        <span className="absolute left-3 top-3 rounded-full bg-card/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 shadow-xs pointer-events-none">
          <span>{category.emoji}</span>
          <span>{category.name}</span>
        </span>

        <button
          type="button"
          aria-label={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(event.id);
          }}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-card/90 backdrop-blur-sm shadow-xs transition-transform active:scale-90"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFav ? 'fill-accent text-accent' : 'text-muted-foreground'
            }`}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setSelectedEventId(event.id)}
        className="block w-full text-left space-y-1 p-3.5 focus:outline-none"
      >
        <h3 className="line-clamp-1 font-semibold text-foreground text-sm hover:text-primary transition-colors">
          {event.title}
        </h3>

        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{formatDate(event.sessions[0].start)}</span>
        </p>

        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{venue.name}</span>
        </p>

        <p className="pt-1 font-bold text-primary text-sm">
          {formatPrice(event.price)}
        </p>
      </button>
    </div>
  );
}
