-- ==============================================================================
-- CULTURELINK DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Copy and run this script in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'plus', 'pro')),
  tickets_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. VENUES TABLE
CREATE TABLE IF NOT EXISTS public.venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  venue_id TEXT REFERENCES public.venues(id) ON DELETE SET NULL,
  price INTEGER DEFAULT 0 NOT NULL,
  popularity INTEGER DEFAULT 80,
  img INTEGER DEFAULT 0,
  pos TEXT DEFAULT '50% 50%',
  summary TEXT NOT NULL,
  program TEXT[] DEFAULT '{}',
  requirements TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  format TEXT DEFAULT 'xem',
  slot TEXT DEFAULT 'ngay',
  group_type TEXT DEFAULT 'ca-hai',
  rating NUMERIC(2,1) DEFAULT 4.8,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  left_count INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TICKETS TABLE (With Anti-fraud HMAC signature & Status)
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ticket_code TEXT UNIQUE NOT NULL,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES public.sessions(id) ON DELETE CASCADE,
  session_time TIMESTAMPTZ NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  total_price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  hmac_signature TEXT DEFAULT '',
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Venues, Events, Sessions: Public Read
CREATE POLICY "Public read venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public read sessions" ON public.sessions FOR SELECT USING (true);

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tickets: Users can read and insert their own tickets
CREATE POLICY "Users can read own tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'anon');
CREATE POLICY "Anyone can insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own tickets" ON public.tickets FOR UPDATE USING (auth.uid() = user_id);

-- Auto create profile on auth signup trigger (supports Google OAuth metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- INITIAL SEED DATA (VENUES & KEY EVENTS)
-- ==============================================================================

INSERT INTO public.venues (id, name, district, lat, lng) VALUES
  ('v1', 'Nhà hát Thành phố', 'Quận 1', 10.7766, 106.7033),
  ('v2', 'Bảo tàng Mỹ thuật TP.HCM', 'Quận 1', 10.7722, 106.6987),
  ('v3', 'Bảo tàng Lịch sử Việt Nam', 'Quận 1', 10.7877, 106.7050),
  ('v4', 'Chợ Bến Thành', 'Quận 1', 10.7720, 106.6980),
  ('v5', 'Nhà hát Rồng Vàng', 'Quận 1', 10.7766, 106.7014),
  ('v6', 'The Factory Contemporary Arts', 'TP. Thủ Đức', 10.7871, 106.7427),
  ('v7', 'Chợ Lớn – Quận 5', 'Quận 5', 10.7525, 106.6565),
  ('v8', 'Hẻm Sáng Tạo Quận 3', 'Quận 3', 10.7820, 106.6860),
  ('v9', 'Công viên Tao Đàn', 'Quận 1', 10.7756, 106.6923),
  ('v10', 'Bến Nhà Rồng', 'Quận 4', 10.7686, 106.7065),
  ('v11', 'Đường sách Nguyễn Văn Bình', 'Quận 1', 10.7786, 106.7003)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, title, category, venue_id, price, popularity, img, summary, program, requirements, rating) VALUES
  ('e4', 'Múa rối nước Thăng Long', 'bieu-dien', 'v5', 280000, 92, 1, 'Nghệ thuật múa rối nước truyền thống với dàn nhạc dân tộc.', ARRAY['Chú Tễu', 'Rước rồng', 'Đua thuyền'], 'Trẻ em dưới 4 tuổi miễn phí.', 4.7),
  ('e1', 'Đêm nhạc Áo Dài & Nhạc Trịnh', 'bieu-dien', 'v1', 350000, 98, 0, 'Đêm diễn kết hợp trình diễn áo dài và những ca khúc Trịnh Công Sơn bất hủ.', ARRAY['19:00 Đón khách', '19:30 Trình diễn áo dài', '20:15 Nhạc Trịnh'], 'Trang phục lịch sự. Không quay phim.', 4.8),
  ('e2', 'Triển lãm Sơn mài Đương đại', 'trien-lam', 'v2', 0, 85, 1, 'Hơn 60 tác phẩm sơn mài của các họa sĩ trẻ Việt Nam.', ARRAY['09:00–17:00 Mở cửa tự do', '15:00 Tour hướng dẫn'], 'Miễn phí, cần đăng ký vé.', 4.6),
  ('e3', 'Workshop Vẽ Sơn mài Mini', 'workshop', 'v8', 450000, 76, 1, 'Tự tay hoàn thiện một đĩa sơn mài nhỏ mang về.', ARRAY['Giới thiệu chất liệu', 'Thực hành 2 giờ', 'Đóng gói sản phẩm'], 'Không cần kinh nghiệm. Tối đa 15 người.', 4.9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sessions (id, event_id, start_time, capacity, left_count) VALUES
  ('e4a', 'e4', NOW() + INTERVAL '1 day' + INTERVAL '18 hours', 120, 40),
  ('e4b', 'e4', NOW() + INTERVAL '3 days' + INTERVAL '18 hours', 120, 60),
  ('e1a', 'e1', NOW() + INTERVAL '3 days' + INTERVAL '19 hours', 200, 34),
  ('e1b', 'e1', NOW() + INTERVAL '10 days' + INTERVAL '19 hours', 200, 3),
  ('e2a', 'e2', NOW() + INTERVAL '1 day' + INTERVAL '9 hours', 300, 180),
  ('e2b', 'e2', NOW() + INTERVAL '6 days' + INTERVAL '9 hours', 300, 220),
  ('e3a', 'e3', NOW() + INTERVAL '4 days' + INTERVAL '14 hours', 15, 6)
ON CONFLICT (id) DO NOTHING;
