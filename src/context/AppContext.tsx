'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, BookingTicket } from '@/types';
import {
  EVENTS,
  getEvent,
  calculateDiscountedPrice,
  canCancelTicket,
  INITIAL_DEMO_TICKETS,
} from '@/data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AppContextType {
  activeTab: 'home' | 'map' | 'match' | 'tickets' | 'profile';
  setActiveTab: (tab: 'home' | 'map' | 'match' | 'tickets' | 'profile') => void;
  user: UserProfile | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  plan: 'free' | 'plus' | 'pro';
  setPlan: (plan: 'free' | 'plus' | 'pro') => void;
  favs: string[];
  toggleFav: (id: string) => void;
  tickets: BookingTicket[];
  left: Record<string, number>;
  book: (params: {
    eventId: string;
    sessionId: string;
    qty: number;
    name: string;
    phone: string;
    combo?: number;
  }) => Promise<{ ok: boolean; code?: string; error?: string }> | { ok: boolean; code?: string; error?: string };
  cancel: (code: string) => Promise<string | null> | string | null;
  checkInTicket: (code: string) => Promise<{ ok: boolean; message: string; ticket?: BookingTicket }>;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  highlightedTicketCode: string | null;
  setHighlightedTicketCode: (code: string | null) => void;
  isSupabaseConnected: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateTicketCode = () => 'CL-' + Math.random().toString(36).slice(2, 8).toUpperCase();

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'match' | 'tickets' | 'profile'>('home');
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (!isSupabaseConfigured()) {
      return {
        name: 'Minh Anh',
        email: 'minhanh@demo.vn',
        isGuest: true,
      };
    }
    return null;
  });
  const [plan, setPlan] = useState<'free' | 'plus' | 'pro'>('free');
  const [favs, setFavs] = useState<string[]>(['e3']);
  const [tickets, setTickets] = useState<BookingTicket[]>(INITIAL_DEMO_TICKETS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [highlightedTicketCode, setHighlightedTicketCode] = useState<string | null>(null);
  const [isSupabaseConnected] = useState<boolean>(() => isSupabaseConfigured());

  // Initialize remaining seat capacity per sessionId
  const [left, setLeft] = useState<Record<string, number>>(() =>
    Object.fromEntries(EVENTS.flatMap((e) => e.sessions.map((s) => [s.id, s.left])))
  );

  const loadSupabaseTickets = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Lỗi tải vé từ Supabase:', error);
        return;
      }

      if (data && data.length > 0) {
        const mappedTickets: BookingTicket[] = data.map((t) => ({
          code: t.ticket_code,
          eventId: t.event_id,
          sessionId: t.session_id,
          qty: t.qty,
          name: t.buyer_name,
          phone: t.buyer_phone,
          total: t.total_price,
          status: t.status as 'active' | 'used' | 'cancelled',
          createdAt: t.created_at,
        }));
        setTickets(mappedTickets);
      }
    } catch (err) {
      console.warn('Supabase offline or table not ready:', err);
    }
  }, []);

  // Initialize Supabase Auth listener & Session
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Người dùng',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
          isGuest: false,
        });
        loadSupabaseTickets(session.user.id);
      }
    });

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Người dùng',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
          isGuest: false,
        });
        loadSupabaseTickets(session.user.id);
      } else {
        // Only set null if user was not a guest
        setUser((prev) => (prev?.isGuest ? prev : null));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadSupabaseTickets]);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      return { error: 'Chưa cấu hình Supabase URL và Anon Key trong .env.local' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error: error?.message };
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isSupabaseConfigured()) {
      setUser({ name: email.split('@')[0], email, isGuest: true });
      return {};
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) return { error: error.message };
    if (data.user) {
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Người dùng',
        email: data.user.email || email,
        avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '',
        isGuest: false,
      });
    }
    return {};
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!isSupabaseConfigured()) {
      setUser({ name, email, isGuest: true });
      return {};
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: name },
      },
    });
    if (error) return { error: error.message };
    if (data.user) {
      setUser({
        id: data.user.id,
        name,
        email,
        isGuest: false,
      });
    }
    return {};
  };

  const toggleFav = (id: string) => {
    setFavs((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const login = (name: string, email: string) => {
    setUser({ name, email, isGuest: true });
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setTickets([]);
  };

  const book = async ({
    eventId,
    sessionId,
    qty,
    name,
    phone,
    combo = 0,
  }: {
    eventId: string;
    sessionId: string;
    qty: number;
    name: string;
    phone: string;
    combo?: number;
  }): Promise<{ ok: boolean; code?: string; error?: string }> => {
    const event = getEvent(eventId);
    if (!event) return { ok: false, error: 'Không tìm thấy sự kiện' };

    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone)) {
      return { ok: false, error: 'Số điện thoại VN không hợp lệ' };
    }

    if (name.trim().length < 2) {
      return { ok: false, error: 'Vui lòng nhập họ tên' };
    }

    const currentBookedInSession = tickets
      .filter((t) => t.sessionId === sessionId && t.status === 'active')
      .reduce((acc, curr) => acc + curr.qty, 0);

    if (qty < 1 || currentBookedInSession + qty > 10) {
      return { ok: false, error: 'Tối đa 10 vé/suất/tài khoản' };
    }

    const availableSeats = left[sessionId] ?? 0;
    if (availableSeats < qty) {
      return { ok: false, error: 'Không đủ vé còn lại' };
    }

    const code = generateTicketCode();
    const unitPrice = calculateDiscountedPrice(event.price, plan, combo);
    const totalPrice = unitPrice * qty;
    const session = event.sessions.find((s) => s.id === sessionId);

    // Deduct remaining seats in local state
    setLeft((prev) => ({
      ...prev,
      [sessionId]: (prev[sessionId] ?? 0) - qty,
    }));

    // Add ticket to local state
    const newTicket: BookingTicket = {
      code,
      eventId,
      sessionId,
      qty,
      name,
      phone,
      total: totalPrice,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);

    // If Supabase is connected, persist to Supabase Database
    if (isSupabaseConfigured()) {
      try {
        const { data: sessionUser } = await supabase.auth.getSession();
        await supabase.from('tickets').insert([
          {
            ticket_code: code,
            user_id: sessionUser?.session?.user?.id || null,
            event_id: eventId,
            session_id: sessionId,
            session_time: session?.start || new Date().toISOString(),
            qty,
            total_price: totalPrice,
            status: 'active',
            buyer_name: name,
            buyer_phone: phone,
            hmac_signature: `HMAC_${code}_${Date.now()}`,
          },
        ]);
      } catch (e) {
        console.warn('Không thể đồng bộ vé lên Supabase:', e);
      }
    }

    return { ok: true, code };
  };

  const cancel = async (code: string): Promise<string | null> => {
    const ticket = tickets.find((t) => t.code === code);
    if (!ticket) return 'Không tìm thấy vé';

    const event = getEvent(ticket.eventId);
    const session = event?.sessions.find((s) => s.id === ticket.sessionId);
    if (!event || !session) return 'Không tìm thấy thông tin suất diễn';

    if (!canCancelTicket(session.start)) {
      return 'Chỉ được hủy trước giờ diễn ít nhất 24 giờ';
    }

    // Cancel ticket and restore seat in local state
    setTickets((prev) =>
      prev.map((t) => (t.code === code ? { ...t, status: 'cancelled' } : t))
    );
    setLeft((prev) => ({
      ...prev,
      [ticket.sessionId]: (prev[ticket.sessionId] ?? 0) + ticket.qty,
    }));

    // If Supabase is connected, update database
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('tickets')
          .update({ status: 'cancelled' })
          .eq('ticket_code', code);
      } catch (e) {
        console.warn('Không thể cập nhật hủy vé trên Supabase:', e);
      }
    }

    return null; // success
  };

  const checkInTicket = async (
    rawCode: string
  ): Promise<{ ok: boolean; message: string; ticket?: BookingTicket }> => {
    let cleanCode = rawCode.trim();
    if (cleanCode.includes('|')) {
      const parts = cleanCode.split('|');
      cleanCode = parts[1] || cleanCode;
    }

    const trimmedUpper = cleanCode.toUpperCase();
    const normalizedNoDash = trimmedUpper.replace(/[\s-]+/g, '');

    // 1. Match by ticket code (CL-88A2F1, 88A2F1, CL 88A2F1, etc.)
    let target = tickets.find((t) => {
      const tNorm = t.code.toUpperCase().replace(/[\s-]+/g, '');
      const tRawNoPrefix = tNorm.replace(/^CL/, '');
      const queryNoPrefix = normalizedNoDash.replace(/^CL/, '');

      return (
        t.code.toUpperCase() === trimmedUpper ||
        tNorm === normalizedNoDash ||
        (queryNoPrefix.length >= 4 && tRawNoPrefix === queryNoPrefix)
      );
    });

    // 2. Fallback match by phone number
    if (!target) {
      const cleanPhoneQuery = cleanCode.replace(/[\s.-]+/g, '');
      if (cleanPhoneQuery.length >= 8) {
        target = tickets.find(
          (t) => t.phone.replace(/[\s.-]+/g, '') === cleanPhoneQuery
        );
      }
    }

    // 3. Fallback match by exact customer name
    if (!target) {
      target = tickets.find(
        (t) => t.name.trim().toLowerCase() === cleanCode.toLowerCase()
      );
    }

    if (!target) {
      return {
        ok: false,
        message: `Không tìm thấy mã vé "${cleanCode}" trong hệ thống vé hiện tại. Vui lòng kiểm tra lại.`,
      };
    }

    if (target.status === 'cancelled') {
      return {
        ok: false,
        message: `Vé ${target.code} đã bị HỦY trước đó, không được phép vào cổng!`,
        ticket: target,
      };
    }

    if (target.status === 'used') {
      return {
        ok: false,
        message: `Vé ${target.code} ĐÃ ĐƯỢC CHECK-IN vào cửa trước đó!`,
        ticket: target,
      };
    }

    // Mark as used in local state
    const updatedTicket: BookingTicket = { ...target, status: 'used' };
    setTickets((prev) =>
      prev.map((t) => (t.code === target.code ? updatedTicket : t))
    );

    // Sync to Supabase if connected
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('tickets')
          .update({
            status: 'used',
            checked_in_at: new Date().toISOString(),
          })
          .eq('ticket_code', target.code);
      } catch (e) {
        console.warn('Lỗi cập nhật check-in Supabase:', e);
      }
    }

    return {
      ok: true,
      message: `Check-in thành công cho khách hàng ${target.name} (${target.qty} vé)!`,
      ticket: updatedTicket,
    };
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        login,
        logout,
        plan,
        setPlan,
        favs,
        toggleFav,
        tickets,
        left,
        book,
        cancel,
        checkInTicket,
        selectedEventId,
        setSelectedEventId,
        highlightedTicketCode,
        setHighlightedTicketCode,
        isSupabaseConnected,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

