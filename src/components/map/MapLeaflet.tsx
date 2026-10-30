'use client';

import React, { useEffect, useRef } from 'react';
import { Venue, EventItem } from '@/types';
import { getCategory } from '@/data/mockData';
import L from 'leaflet';

interface MapLeafletProps {
  pins: { v: Venue; evs: EventItem[] }[];
  me: { lat: number; lng: number } | null;
  radiusKm: number;
  sel: string | null;
  onSelect: (venueId: string) => void;
}

export default function MapLeaflet({ pins, me, radiusKm, sel, onSelect }: MapLeafletProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [10.7769, 106.7009];
    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 14,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    // Add Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add OSM TileLayer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    const userLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;
    userLayerRef.current = userLayer;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update user position and radius circle
  useEffect(() => {
    const userLayer = userLayerRef.current;
    if (!userLayer) return;

    userLayer.clearLayers();

    if (me) {
      const userPos: [number, number] = [me.lat, me.lng];

      // Radius circle
      L.circle(userPos, {
        radius: radiusKm * 1000,
        color: 'hsl(262 60% 55%)',
        weight: 1.5,
        fillColor: 'hsl(262 60% 55%)',
        fillOpacity: 0.08,
      }).addTo(userLayer);

      // User location dot with pulsing outer ring
      L.circleMarker(userPos, {
        radius: 8,
        color: '#ffffff',
        weight: 3,
        fillColor: 'hsl(262 60% 55%)',
        fillOpacity: 1,
      }).addTo(userLayer);
    }
  }, [me, radiusKm]);

  // Update event venue markers
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    pins.forEach(({ v, evs }) => {
      const firstCat = getCategory(evs[0].category);
      const isSelected = sel === v.id;

      const customIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            display: grid;
            place-items: center;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            background: #fff;
            border: 2px solid #7c5cbf;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            cursor: pointer;
            ${isSelected ? 'outline: 3px solid #7c5cbf; outline-offset: 1px;' : ''}
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">${firstCat.emoji}</span>
            ${
              evs.length > 1
                ? `<span style="
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    display: grid;
                    place-items: center;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #7c5cbf;
                    color: #fff;
                    font-size: 9px;
                    font-weight: 700;
                    transform: rotate(45deg);
                  ">${evs.length}</span>`
                : ''
            }
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([v.lat, v.lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="padding: 2px; font-family: inherit;">
          <b style="font-size: 13px; color: #1e1b4b;">${v.name}</b>
          <p style="font-size: 11px; color: #64748b; margin-top: 2px;">${v.district} · ${evs.length} hoạt động</p>
        </div>
      `);

      marker.on('click', () => {
        onSelect(v.id);
      });

      marker.addTo(markersLayer);
    });

    // Pan to selected venue
    const selectedVenue = pins.find((p) => p.v.id === sel);
    if (selectedVenue) {
      map.flyTo([selectedVenue.v.lat, selectedVenue.v.lng], Math.max(map.getZoom(), 15), {
        duration: 0.8,
      });
    } else if (me && !sel) {
      map.flyTo([me.lat, me.lng], 14, { duration: 0.8 });
    }
  }, [pins, sel, me, onSelect]);

  return <div ref={containerRef} className="h-full w-full rounded-[26px]" />;
}
