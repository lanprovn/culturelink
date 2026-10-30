'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MEMBERSHIP_PLANS, formatPrice, getMemberLevel } from '@/data/mockData';
import StaffTicketScannerModal from '@/components/ui/StaffTicketScannerModal';
import UserGuideModal from '@/components/ui/UserGuideModal';
import { Scan, HelpCircle } from 'lucide-react';

export default function ProfileAdminTab() {
  const {
    user,
    login,
    logout,
    tickets,
    favs,
    plan,
    setPlan,
    setActiveTab,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useApp();

  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [privacy, setPrivacy] = useState({
    connect: false,
    location: false,
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    if (isRegisterMode) {
      const res = await signUpWithEmail(inputEmail, inputPassword, inputName || inputEmail.split('@')[0]);
      if (res.error) setAuthError(res.error);
    } else {
      const res = await signInWithEmail(inputEmail, inputPassword);
      if (res.error) setAuthError(res.error);
    }

    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        if (res.error.toLowerCase().includes('not enabled') || res.error.toLowerCase().includes('unsupported provider')) {
          setAuthError('Supabase chưa bật Google Provider. Hãy vào Supabase Dashboard > Authentication > Providers > Google để kích hoạt.');
        } else {
          setAuthError(res.error);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi gọi Google OAuth';
      setAuthError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-4 pb-8 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Đăng nhập tài khoản</h1>
        </div>

        {/* Google OAuth Login Button */}
        <button
          type="button"
          disabled={isGoogleLoading}
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-card border border-border/80 p-3.5 text-sm font-semibold text-foreground shadow-soft hover:bg-muted/50 transition-all cursor-pointer disabled:opacity-50"
        >
          {isGoogleLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Đang chuyển sang Google...
            </span>
          ) : (
            <>
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
              <span>Đăng nhập nhanh với Google</span>
            </>
          )}
        </button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-border/60" />
          <span className="bg-background px-3 text-xs text-muted-foreground uppercase font-medium">
            Hoặc bằng email
          </span>
        </div>

        {/* Email Auth Form */}
        <form
          onSubmit={handleEmailAuth}
          className="space-y-3 rounded-[26px] bg-card p-5 shadow-soft border border-border/40"
        >
          {authError && (
            <p className="rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
              {authError}
            </p>
          )}

          {isRegisterMode && (
            <input
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Họ và tên của bạn"
              aria-label="Họ tên"
              required={isRegisterMode}
              className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 transition-all"
            />
          )}

          <input
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            type="email"
            placeholder="Địa chỉ Email"
            aria-label="Email"
            required
            className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 transition-all"
          />

          <input
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            type="password"
            placeholder="Mật khẩu"
            aria-label="Mật khẩu"
            required
            className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 transition-all"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-brand py-3 font-semibold text-primary-foreground shadow-soft hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isSubmitting
              ? 'Đang xử lý…'
              : isRegisterMode
              ? 'Tạo tài khoản mới'
              : 'Đăng nhập'}
          </button>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-primary hover:underline font-medium"
            >
              {isRegisterMode
                ? 'Đã có tài khoản? Đăng nhập ngay'
                : 'Chưa có tài khoản? Đăng ký'}
            </button>

            <button
              type="button"
              onClick={() => login('Minh Anh', 'minhanh@gmail.com')}
              className="text-muted-foreground hover:text-foreground"
            >
              Đăng nhập thử (Khách)
            </button>
          </div>
        </form>
      </div>
    );
  }

  const activeTickets = tickets.filter((t) => t.status === 'active');
  const totalTicketsCount = activeTickets.reduce((sum, t) => sum + t.qty, 0);
  const memberLevel = getMemberLevel(totalTicketsCount);

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cá nhân</h1>
      </div>

      {/* User Info Card */}
      <div className="flex items-center gap-4 rounded-[26px] bg-card p-5 shadow-soft border border-border/40">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shadow-xs shrink-0"
          />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-2xl font-bold text-primary-foreground shadow-xs shrink-0">
            {user.name?.[0] ?? 'M'}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-foreground truncate">{user.name}</p>
            {user.avatar && (
              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold">
                Google
              </span>
            )}
            {user.isGuest && (
              <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold">
                Khách
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="text-sm font-semibold text-destructive hover:underline shrink-0 cursor-pointer"
        >
          Đăng xuất
        </button>
      </div>

      {/* Membership Level Card */}
      <div className="rounded-[26px] bg-brand p-5 text-primary-foreground shadow-soft">
        <p className="text-sm opacity-80">Hạng thành viên</p>
        <p className="font-script text-3xl font-bold mt-0.5">{memberLevel.name}</p>

        <div className="mt-2 h-2 rounded-full bg-primary-foreground/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-foreground transition-all duration-500"
            style={{
              width: memberLevel.next
                ? `${Math.min(100, (totalTicketsCount / memberLevel.next) * 100)}%`
                : '100%',
            }}
          />
        </div>

        <p className="mt-1 text-xs opacity-80">
          {memberLevel.next
            ? `${totalTicketsCount}/${memberLevel.next} vé để lên hạng`
            : 'Hạng cao nhất'}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className="rounded-2xl bg-primary-foreground/15 p-2 backdrop-blur-xs hover:bg-primary-foreground/25 transition-colors cursor-pointer"
          >
            <p className="text-xl font-bold">{totalTicketsCount}</p>
            <p className="text-[11px] opacity-80">Vé đã đặt</p>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className="rounded-2xl bg-primary-foreground/15 p-2 backdrop-blur-xs hover:bg-primary-foreground/25 transition-colors cursor-pointer"
          >
            <p className="text-xl font-bold">{activeTickets.length}</p>
            <p className="text-[11px] opacity-80">Đơn vé</p>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="rounded-2xl bg-primary-foreground/15 p-2 backdrop-blur-xs hover:bg-primary-foreground/25 transition-colors cursor-pointer"
          >
            <p className="text-xl font-bold">{favs.length}</p>
            <p className="text-[11px] opacity-80">Đã lưu</p>
          </button>
        </div>
      </div>

      {/* Membership Plans Section */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Gói thành viên</h2>

        <div className="grid gap-3 sm:grid-cols-3">
          {MEMBERSHIP_PLANS.map((p) => {
            const isSelected = plan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={`rounded-[22px] bg-card p-4 text-left shadow-soft border transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-primary border-transparent'
                    : 'border-border/40 hover:bg-muted/30'
                }`}
              >
                <p className="font-bold text-foreground">{p.name}</p>
                <p className="text-sm text-primary font-semibold mt-0.5">
                  {p.price ? `${formatPrice(p.price)}/tháng` : '0đ'}
                </p>

                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-1">
                      <span className="text-primary">✓</span> {perk}
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <p className="mt-3 text-xs font-semibold text-primary">
                    Đang kích hoạt
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Quyền riêng tư</h2>
        <div className="space-y-2 rounded-[22px] bg-card p-4 shadow-soft border border-border/40 text-sm">
          {(
            [
              { key: 'connect', label: 'Cho phép gợi ý kết nối cộng đồng' },
              { key: 'location', label: 'Chia sẻ vị trí' },
            ] as const
          ).map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between py-1 cursor-pointer select-none"
            >
              <span className="text-foreground">{label}</span>
              <input
                type="checkbox"
                checked={privacy[key]}
                onChange={(e) =>
                  setPrivacy((prev) => ({ ...prev, [key]: e.target.checked }))
                }
                className="h-5 w-5 rounded accent-[var(--primary)] cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Event Organizer / Staff Operations */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Dành cho Ban tổ chức</h2>
        <div className="rounded-[22px] bg-card p-5 shadow-soft border border-border/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-foreground text-sm">Công cụ Soát vé Quầy (Staff Scanner)</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quét mã QR và đối soát vé vào cổng của khán giả tại cửa nhà hát / bảo tàng
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Scan className="h-4 w-4" />
              <span>Mở quét vé vào cổng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help & Guide Center */}
      <div className="rounded-[22px] bg-card p-5 shadow-soft border border-border/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">Cẩm nang & Hướng dẫn sử dụng</p>
            <p className="text-xs text-muted-foreground mt-0.5">Quy trình đặt vé, quyền lợi hội viên và cách soát vé</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsGuideOpen(true)}
          className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground border border-border hover:bg-muted transition-colors cursor-pointer shrink-0"
        >
          Xem cẩm nang
        </button>
      </div>

      {/* Staff Ticket Scanner Modal */}
      <StaffTicketScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
