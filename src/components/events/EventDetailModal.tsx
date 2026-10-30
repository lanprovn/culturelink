'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  getEvent,
  getVenue,
  getCategory,
  getEventImage,
  EVENTS,
  formatDate,
  formatPrice,
  calculateDiscountedPrice,
} from '@/data/mockData';
import { EventItem } from '@/types';
import EventCard from '@/components/events/EventCard';
import EventReviews from '@/components/events/EventReviews';
import ZaloIcon from '@/components/ui/ZaloIcon';
import { openZaloShare } from '@/lib/ticketExport';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Star,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  QrCode,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EventDetailContentProps {
  event: EventItem;
  onClose: () => void;
}

const BANK_INFO = {
  bankId: 'ACB',
  bankName: 'ACB (Ngân hàng TMCP Á Châu)',
  accountNo: '23457737',
  accountName: 'HO DUY TIEN',
};

const generatePaymentCode = () => 'CL-' + Math.random().toString(36).slice(2, 8).toUpperCase();

function EventDetailContent({ event, onClose }: EventDetailContentProps) {
  const {
    favs,
    toggleFav,
    left,
    plan,
    book,
    user,
    setActiveTab,
    setHighlightedTicketCode,
  } = useApp();

  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    event.sessions[0]?.id ?? ''
  );
  const [qty, setQty] = useState(1);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Payment states
  const [pendingCode, setPendingCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes countdown

  const venue = getVenue(event.venueId);
  const category = getCategory(event.category);
  const isFav = favs.includes(event.id);
  const unitPrice = calculateDiscountedPrice(event.price, plan);
  const totalPrice = unitPrice * qty;

  // Countdown timer for VietQR hold
  useEffect(() => {
    if (step !== 'payment') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (name.trim().length < 2) {
      setBookingError('Vui lòng nhập họ và tên của bạn');
      return;
    }

    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone)) {
      setBookingError('Số điện thoại không hợp lệ (phải là số di động 10 số)');
      return;
    }

    const availableSeats = left[selectedSessionId] ?? 0;
    if (availableSeats < qty) {
      setBookingError('Suất diễn này không còn đủ số lượng vé yêu cầu');
      return;
    }

    // If free event (0đ), directly complete booking
    if (totalPrice === 0) {
      handleFinalizeBooking();
      return;
    }

    // Generate ticket memo code for VietQR
    const code = generatePaymentCode();
    setPendingCode(code);
    setTimeLeft(600);
    setStep('payment');
  };

  const handleFinalizeBooking = async () => {
    setIsVerifying(true);
    setBookingError('');

    try {
      const res = await book({
        eventId: event.id,
        sessionId: selectedSessionId,
        qty,
        name,
        phone,
      });

      if (!res.ok) {
        setBookingError(res.error || 'Đặt vé thất bại');
        setIsVerifying(false);
        return;
      }

      // Trigger Confetti fireworks!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8A2BE2', '#4B0082', '#FFD700', '#00CED1'],
        });
      } catch {
        // ignore if confetti fails
      }

      setHighlightedTicketCode(res.code || pendingCode || null);
      onClose();
      setActiveTab('tickets');
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Lỗi khi xử lý giao dịch');
      setIsVerifying(false);
    }
  };

  const relatedEvents = EVENTS.filter(
    (e) => e.category === event.category && e.id !== event.id
  )
    .concat(EVENTS.filter((e) => e.category !== event.category).slice(0, 2))
    .slice(0, 4);

  // VietQR Dynamic URL (Standard VietQR specification)
  const vietQrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact2.png?amount=${totalPrice}&addInfo=${pendingCode}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-0 md:py-6 md:px-4 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-card md:rounded-[26px] shadow-2xl overflow-hidden pb-12 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step 1: Event Details & Form */}
        {step === 'form' && (
          <>
            {/* Top Cover Image Banner */}
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src={getEventImage(event.img)}
                alt={event.title}
                className="h-full w-full object-cover"
                style={{ objectPosition: event.pos }}
              />

              <button
                type="button"
                aria-label="Quay lại"
                onClick={onClose}
                className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 backdrop-blur-sm shadow-md hover:bg-card transition-transform active:scale-90"
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </button>

              {/* Share to Zalo Button */}
              <button
                type="button"
                aria-label="Chia sẻ Zalo"
                title="Chia sẻ sự kiện lên Zalo"
                onClick={() => {
                  openZaloShare({
                    title: `Tham gia sự kiện cùng mình: ${event.title} tại ${venue.name}!`,
                    url: 'https://culturelink-vn.pages.dev',
                  });
                }}
                className="absolute right-16 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 backdrop-blur-sm shadow-md hover:bg-card hover:scale-105 transition-all active:scale-90 cursor-pointer"
              >
                <ZaloIcon size={22} />
              </button>

              <button
                type="button"
                aria-label={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                onClick={() => toggleFav(event.id)}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 backdrop-blur-sm shadow-md hover:bg-card transition-transform active:scale-90"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isFav ? 'fill-accent text-accent' : 'text-foreground'
                  }`}
                />
              </button>
            </div>

            {/* Content Body */}
            <div className="relative -mt-6 space-y-5 rounded-[26px] bg-card p-5 shadow-soft mx-2 md:mx-4 border border-border/40">
              <div>
                <span className="text-xs font-semibold text-primary">
                  {category.emoji} {category.name}
                </span>
                <h1 className="mt-1 text-2xl font-bold text-foreground">{event.title}</h1>

                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    {venue.name}, {venue.district}
                  </span>
                </p>

                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-warning text-warning shrink-0" />
                  <span className="font-semibold text-foreground">{event.rating}</span>
                  <span>· chỉ người đã đặt vé được đánh giá</span>
                </p>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed">{event.summary}</p>

              {/* Chương trình */}
              <div>
                <h2 className="mb-2 font-semibold text-foreground">Chương trình</h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {event.program.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Yêu cầu */}
              <div>
                <h2 className="mb-1 font-semibold text-foreground">Yêu cầu</h2>
                <p className="text-sm text-muted-foreground">{event.requirements}</p>
              </div>

              {/* Chính sách hủy */}
              <div>
                <h2 className="mb-1 font-semibold text-foreground">Chính sách hủy</h2>
                <p className="text-sm text-muted-foreground">
                  Hủy trước giờ diễn tối thiểu 24 giờ, hoàn lại suất vé tự động.
                </p>
              </div>

              {/* Booking Form */}
              <form
                onSubmit={handleProceedToPayment}
                className="space-y-3 rounded-[22px] bg-secondary p-4 border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground text-sm">Chọn suất & số lượng vé</h2>
                  <span className="text-xs font-semibold text-primary">Bước 1/2</span>
                </div>

                {/* Sessions Radio List */}
                <div className="space-y-2">
                  {event.sessions.map((sess) => {
                    const isSelected = selectedSessionId === sess.id;
                    const remaining = left[sess.id] ?? sess.left;
                    return (
                      <label
                        key={sess.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl bg-card p-3 text-sm border transition-all ${
                          isSelected
                            ? 'ring-2 ring-primary border-transparent'
                            : 'border-border/30 hover:bg-muted/30'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-foreground">
                          <input
                            type="radio"
                            name="session"
                            className="sr-only"
                            checked={isSelected}
                            onChange={() => setSelectedSessionId(sess.id)}
                          />
                          <span>{formatDate(sess.start)}</span>
                        </span>

                        <span
                          className={`text-xs ${
                            remaining <= 5
                              ? 'font-semibold text-destructive'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {remaining === 0 ? 'Hết vé' : `Còn ${remaining} chỗ`}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-foreground">Số lượng vé (tối đa 10)</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Giảm"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="h-8 w-8 rounded-full bg-card grid place-items-center text-foreground font-bold shadow-xs hover:bg-muted active:scale-95 transition-all cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-semibold text-foreground">
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Tăng"
                      onClick={() => setQty(Math.min(10, qty + 1))}
                      className="h-8 w-8 rounded-full bg-card grid place-items-center text-foreground font-bold shadow-xs hover:bg-muted active:scale-95 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Customer Inputs */}
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên người nhận vé"
                  aria-label="Họ tên"
                  required
                  className="w-full rounded-2xl bg-card px-4 py-3 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 transition-all"
                />

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại di động (vd: 0901234567)"
                  aria-label="Số điện thoại"
                  inputMode="tel"
                  required
                  className="w-full rounded-2xl bg-card px-4 py-3 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 transition-all"
                />

                {bookingError && (
                  <p role="alert" className="text-sm text-destructive font-medium rounded-xl bg-destructive/10 p-2.5">
                    {bookingError}
                  </p>
                )}

                {/* Price & Submit Button */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Tổng tiền {plan !== 'free' && `(Gói ${plan.toUpperCase()} -${plan === 'plus' ? '10%' : '20%'})`}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {totalPrice === 0 ? 'Miễn phí' : formatPrice(totalPrice)}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-primary-foreground shadow-soft hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    {totalPrice === 0 ? (
                      <span>Nhận vé miễn phí</span>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4" />
                        <span>Thanh toán VietQR</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Audience Reviews & Rating Section */}
              <EventReviews eventId={event.id} rating={event.rating} />

              {/* Related Events Section */}
              <div className="pt-2">
                <h2 className="mb-3 font-semibold text-foreground">Sự kiện tương tự</h2>
                <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2">
                  {relatedEvents.map((rel) => (
                    <EventCard key={rel.id} event={rel} wide />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2: VietQR Dynamic Bank Payment Screen */}
        {step === 'payment' && (
          <div className="p-5 md:p-8 space-y-6 animate-in fade-in-50 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại sửa thông tin</span>
              </button>

              <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold border border-emerald-500/30">
                VietQR Napas 24/7
              </span>
            </div>

            {/* Title & Countdown */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-foreground">Thanh toán chuyển khoản VietQR</h2>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Thời gian giữ vé: {formatCountdown(timeLeft)}</span>
              </div>
            </div>

            {/* QR Card & Banking Info Grid */}
            <div className="grid gap-6 md:grid-cols-2 items-center">
              {/* Left: Dynamic VietQR Image */}
              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-[24px] border border-border/80 shadow-soft">
                <div className="relative group">
                  <img
                    src={vietQrUrl}
                    alt="Mã VietQR thanh toán"
                    className="w-64 h-auto rounded-xl shadow-xs"
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground text-center">
                  Mở ứng dụng Ngân hàng bất kỳ để quét mã QR chuyển khoản tự động
                </p>
              </div>

              {/* Right: Transfer Details Box */}
              <div className="space-y-3">
                <div className="rounded-2xl bg-secondary/80 p-4 space-y-2.5 border border-border/40 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Ngân hàng</span>
                    <span className="font-semibold text-foreground text-right">{BANK_INFO.bankName}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Chủ tài khoản</span>
                    <span className="font-bold text-foreground text-right">{BANK_INFO.accountName}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Số tài khoản</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-foreground text-sm">{BANK_INFO.accountNo}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(BANK_INFO.accountNo, 'acc')}
                        className="p-1 rounded hover:bg-muted text-primary cursor-pointer transition-colors"
                        title="Sao chép"
                      >
                        {copiedField === 'acc' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Số tiền thanh toán</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-base text-primary">{formatPrice(totalPrice)}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(totalPrice.toString(), 'amount')}
                        className="p-1 rounded hover:bg-muted text-primary cursor-pointer transition-colors"
                        title="Sao chép"
                      >
                        {copiedField === 'amount' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 bg-primary/10 rounded-xl px-2.5">
                    <span className="font-semibold text-primary">Nội dung chuyển khoản</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-primary text-sm">{pendingCode}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(pendingCode, 'memo')}
                        className="p-1 rounded hover:bg-primary/20 text-primary cursor-pointer transition-colors"
                        title="Sao chép mã"
                      >
                        {copiedField === 'memo' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Hệ thống đối soát tự động NAPAS247. Vé sẽ được xuất ngay sau khi nhận giao dịch.</span>
                </div>
              </div>
            </div>

            {bookingError && (
              <p role="alert" className="text-sm text-destructive font-medium rounded-xl bg-destructive/10 p-2.5 text-center">
                {bookingError}
              </p>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full sm:w-auto px-5 py-3 rounded-full border border-border/80 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Đổi suất diễn khác
              </button>

              <button
                type="button"
                disabled={isVerifying || timeLeft === 0}
                onClick={handleFinalizeBooking}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-full bg-brand py-3.5 px-6 font-bold text-sm text-primary-foreground shadow-soft hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang xác thực giao dịch ngân hàng...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Tôi đã chuyển khoản thành công</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventDetailModal() {
  const { selectedEventId, setSelectedEventId } = useApp();
  const event = selectedEventId ? getEvent(selectedEventId) : null;

  if (!event) return null;

  return (
    <EventDetailContent
      key={event.id}
      event={event}
      onClose={() => setSelectedEventId(null)}
    />
  );
}
