'use client';

import React, { useState } from 'react';
import {
  X,
  Compass,
  ShieldCheck,
  Calendar,
  Sparkles,
  HelpCircle,
  Smartphone,
  CreditCard,
  Scan,
} from 'lucide-react';
import ZaloIcon from '@/components/ui/ZaloIcon';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'audience' | 'membership' | 'organizer';
}

export default function UserGuideModal({
  isOpen,
  onClose,
  defaultTab = 'audience',
}: UserGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'audience' | 'membership' | 'organizer'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-card rounded-[26px] shadow-2xl border border-border/60 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-primary-foreground shadow-xs">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Hướng dẫn sử dụng CultureLink</h3>
              <p className="text-[11px] text-muted-foreground">
                Cẩm nang trải nghiệm văn hóa, đặt vé và vận hành sự kiện
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 border-b border-border/50 bg-secondary/40">
          <div className="flex rounded-2xl bg-card p-1 border border-border/60 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('audience')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'audience'
                  ? 'bg-brand text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Dành cho Khán giả</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('membership')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'membership'
                  ? 'bg-brand text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Gói Hội viên</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('organizer')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'organizer'
                  ? 'bg-brand text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Scan className="h-3.5 w-3.5" />
              <span>Ban tổ chức</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* TAB 1: AUDIENCE GUIDE */}
          {activeTab === 'audience' && (
            <div className="space-y-4 text-xs text-foreground/90 leading-relaxed">
              <div className="flex gap-3 items-start p-3.5 rounded-2xl bg-brand/5 border border-brand/20">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand font-bold text-xs text-primary-foreground">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Khám phá & Chọn sự kiện yêu thích</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Duyệt các sự kiện qua <strong>Trang chủ</strong> theo danh mục (Triển lãm, Âm nhạc, Workshop, Ẩm thực…), xem trên <strong>Bản đồ Culture Map</strong> theo bán kính xung quanh bạn (1km, 2km, 5km) hoặc làm bài trắc nghiệm <strong>Ghép gu (Culture Match)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-2xl bg-brand/5 border border-brand/20">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand font-bold text-xs text-primary-foreground">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Đặt vé & Thanh toán VietQR tức thì</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Nhập họ tên, số điện thoại và chọn suất diễn. Hệ thống tạo mã <strong>VietQR Napas247</strong> chính xác số tiền và mã vé <code>CL-XXXXXX</code>. Mở bất kỳ ứng dụng ngân hàng nào (Vietcombank, MB, Techcombank, ACB…) quét mã là giữ chỗ thành công 100%.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-2xl bg-brand/5 border border-brand/20">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand font-bold text-xs text-primary-foreground">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Lưu vé & Chia sẻ Zalo cho bạn bè</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Vào tab <strong>Vé của tôi</strong> để:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground pl-1">
                    <li><Calendar className="inline h-3 w-3 text-brand mr-1" /><strong>Lưu lịch Google</strong>: Nhắc bạn trước giờ diễn.</li>
                    <li><Smartphone className="inline h-3 w-3 text-brand mr-1" /><strong>Tải thẻ vé PNG</strong>: Thẻ vé Boarding Pass có QR dùng ngay cả khi không có 4G.</li>
                    <li><ZaloIcon className="inline h-3 w-3 mr-1" /><strong>Chia sẻ Zalo</strong>: Gửi nhanh mã vé và địa chỉ sự kiện cho người đi cùng.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-2xl bg-brand/5 border border-brand/20">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand font-bold text-xs text-primary-foreground">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Xuất trình vé tại cổng soát vé</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Đến địa điểm trước giờ diễn 15 phút. Xuất trình mã QR trên điện thoại hoặc ảnh vé đã tải để nhân viên quét đối soát vào cổng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERSHIP GUIDE */}
          {activeTab === 'membership' && (
            <div className="space-y-4 text-xs text-foreground/90">
              <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-xs space-y-2">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Các Hạng Hội viên CultureLink</span>
                </h4>
                <div className="grid gap-2 sm:grid-cols-3 pt-1">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                    <p className="font-bold text-foreground">Gói FREE</p>
                    <p className="text-primary font-bold mt-0.5">0đ / tháng</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Duyệt sự kiện, đặt vé tiêu chuẩn, lưu ảnh vé.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand/10 border border-brand/30">
                    <p className="font-bold text-brand">Gói PLUS</p>
                    <p className="text-brand font-bold mt-0.5">49.000đ / tháng</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Giảm 10% toàn bộ vé, ưu tiên giữ chỗ trước 24 giờ.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="font-bold text-amber-700 dark:text-amber-400">Gói PRO</p>
                    <p className="text-amber-700 dark:text-amber-400 font-bold mt-0.5">99.000đ / tháng</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Giảm 20% giá vé, hủy vé linh hoạt trước 6h, vé mời đặc quyền.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40 space-y-1.5">
                <h4 className="font-bold text-sm text-foreground">Chính sách hủy vé & hoàn tiền</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Vé có thể hủy tự động ngay trong ứng dụng nếu thời gian diễn còn cách hiện tại tối thiểu 24 giờ. Suất vé sẽ tự động được hoàn lại cho cộng đồng.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ORGANIZER GUIDE */}
          {activeTab === 'organizer' && (
            <div className="space-y-4 text-xs text-foreground/90">
              <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  <span>Quy trình Soát vé tại cửa nhà hát</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground pl-1">
                  <li>
                    Vào tab <strong>Cá nhân</strong>, cuộn xuống mục <strong>Dành cho Ban tổ chức</strong> và nhấn <strong>Mở quét vé vào cổng</strong>.
                  </li>
                  <li>
                    Chọn chế độ <strong>Camera thật</strong>: Hướng ống kính máy ảnh về mã QR trên điện thoại khách.
                  </li>
                  <li>
                    Hệ thống tự động phát âm thanh <i>BEEP</i> và đối soát cơ sở dữ liệu:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                      <li><span className="text-emerald-600 font-bold">Màu xanh</span>: Vé hợp lệ. Khách được vào cổng, trạng thái tự chuyển sang Đã tham gia.</li>
                      <li><span className="text-amber-600 font-bold">Màu vàng</span>: Cảnh báo vé ĐÃ ĐƯỢC QUÉT trước đó (ngăn chặn chia sẻ mã cho người thứ 2).</li>
                      <li><span className="text-rose-600 font-bold">Màu đỏ</span>: Vé đã bị hủy hoặc mã giả mạo.</li>
                    </ul>
                  </li>
                  <li>
                    Nếu camera bị chói hoặc máy ảnh khách bị nứt vỡ, nhân viên có thể chuyển sang tab <strong>Nhập mã</strong> để gõ 8 ký tự mã vé <code>CL-XXXXXX</code>.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/30 border-t border-border/40 p-3.5 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Cần hỗ trợ trực tiếp? Hotline CultureLink: 1900-CULTURE
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
