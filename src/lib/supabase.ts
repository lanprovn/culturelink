import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseUrl.startsWith('https://')
  );
};

// Create Supabase client (fallback to dummy URL if not yet configured)
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key'
);

/**
 * Đăng nhập bằng Google OAuth qua Supabase
 */
export async function signInWithGoogleOAuth() {
  if (!isSupabaseConfigured()) {
    throw new Error('Chưa cấu hình Supabase URL và Anon Key trong .env.local');
  }

  const redirectUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Lỗi Supabase signInWithOAuth:', error);
    throw error;
  }

  return data;
}

/**
 * Đăng xuất người dùng hiện tại
 */
export async function signOutUser() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Lỗi Supabase signOut:', error);
    throw error;
  }
}
