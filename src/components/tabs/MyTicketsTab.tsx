'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getEvent, getVenue, formatDate, formatPrice, canCancelTicket } from '@/data/mockData';
import Chip from '@/components/ui/Chip';
import QRCodeView from '@/components/ui/QRCodeView';
import {
  generateGoogleCalendarUrl,
  downloadTicketCardImage,
  shareTicketInfo,
  openZaloShare,
} from '@/lib/ticketExport';
import ZaloIcon from '@/components/ui/ZaloIcon';
import { Calendar, Download, Check, Loader2 } from 'lucide-react';

export default function MyTicketsTab() {
  const {
    tickets,
    cancel,
    setActiveTab,
    highlightedTicketCode,
    setHighlightedTicketCode,
  } = useApp();

  const [filterTab, setFilterTab] = useState<'up' | 'done' | 'cancel'>('up');
  const [expandedCode, setExpandedCode] = useState<string | null>(highlightedTicketCode);
  const [cancelError, setCancelError] = useState<string>('');
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);
  const [sharedCode, setSharedCode] = useState<string | null>(null);

  const nowIso = new Date().toISOString();

  const getSessionStart = (eventId: string, sessionId: string) => {
    const event = getEvent(eventId);
    const session = event?.sessions.find((s) => s.id === sessionId);
    return session?.start || nowIso;
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterTab === 'cancel') return t.status === 'cancelled';
    if (filterTab === 'done') {
      const start = getSessionStart(t.eventId, t.sessionId);
      return t.status === 'used' || (t.status === 'active' && start < nowIso);
    }
    // filterTab === 'up' (Sắp diễn ra)
    const start = getSessionStart(t.eventId, t.sessionId);
    return t.status === 'active' && start >= nowIso;
  });

  const handleCancelTicket = async (code: string) => {
    const err = await cancel(code);
    if (err) {
      setCancelError(err);
    } else {
      setCancelError('');
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ví vé của tôi</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý vé điện tử, lưu lịch diễn và xuất trình mã QR vào cổng
          </p>
        </div>
      </div>

      {/* Usage Guide Tip */}
      <div className="flex items-center gap-2 rounded-2xl bg-brand/5 border border-brand/20 p-3 text-xs text-muted-foreground">
        <span className="text-sm shrink-0">🎟️</span>
        <span>
          <strong>Cách vào cổng:</strong> Bấm vào vé để mở mã QR, hoặc bấm <strong>Tải thẻ vé PNG</strong> để lưu ảnh về điện thoại dùng khi không có mạng. Xuất trình mã này cho nhân viên tại cửa.
        </span>
      </div>

      {/* Success Notification if just booked */}
      {highlightedTicketCode && (
        <div className="flex items-center justify-between rounded-2xl bg-secondary p-3.5 text-sm text-foreground shadow-xs animate-in fade-in-0 duration-300">
          <p>
            🎉 Đặt vé thành công! Mã: <b>{highlightedTicketCode}</b>
          </p>
          <button
            onClick={() => setHighlightedTicketCode(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <Chip on={filterTab === 'up'} onClick={() => setFilterTab('up')}>
          Sắp diễn ra
        </Chip>
        <Chip on={filterTab === 'done'} onClick={() => setFilterTab('done')}>
          Đã hoàn thành
        </Chip>
        <Chip on={filterTab === 'cancel'} onClick={() => setFilterTab('cancel')}>
          Đã hủy
        </Chip>
      </div>

      {cancelError && (
        <p role="alert" className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
          {cancelError}
        </p>
      )}

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="rounded-[22px] bg-card p-8 text-center shadow-soft border border-border/40">
          <p className="text-4xl">🎟️</p>
          <p className="mt-2 text-sm text-muted-foreground">Chưa có vé nào ở mục này.</p>
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="mt-4 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 transition-opacity"
          >
            Khám phá sự kiện
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const event = getEvent(ticket.eventId);
            if (!event) return null;
            const venue = getVenue(event.venueId);
            const sessionStart = getSessionStart(ticket.eventId, ticket.sessionId);
            const isExpanded = expandedCode === ticket.code;
            const canCancel = canCancelTicket(sessionStart);

            return (
              <div
                key={ticket.code}
                className="overflow-hidden rounded-[22px] bg-card shadow-soft border border-border/40 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedCode(isExpanded ? null : ticket.code)}
                  className="w-full p-4 text-left focus:outline-none hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1 pr-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {ticket.status === 'used' ? (
                        <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                          ✓ Đã vào cổng
                        </span>
                      ) : ticket.status === 'cancelled' ? (
                        <span className="rounded-full bg-rose-500/15 text-rose-600 px-2 py-0.5 text-[10px] font-bold">
                          ✕ Đã hủy
                        </span>
                      ) : (
                        <span className="rounded-full bg-brand/10 text-brand px-2 py-0.5 text-[10px] font-bold">
                          ● Sẵn sàng
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-primary">
                        {ticket.code}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(sessionStart)} · {venue.name}
                  </p>

                  <p className="mt-2 text-sm text-foreground">
                    {ticket.qty} vé · <b>{formatPrice(ticket.total)}</b>
                  </p>
                </button>

                {/* Expanded Details: QR Code & Utilities */}
                {isExpanded && ticket.status === 'active' && (
                  <div className="flex flex-col items-center gap-3 border-t border-dashed border-border p-5 bg-muted/10 animate-in fade-in-0 duration-200">
                    <div className="rounded-2xl bg-card p-3 ring-1 ring-border shadow-xs">
                      <QRCodeView
                        value={`CULTURELINK-VERIFIED|${ticket.code}|${ticket.sessionId}`}
                        size={160}
                      />
                    </div>

                    <p className="text-center text-[11px] text-muted-foreground max-w-xs">
                      Mã vé điện tử <b className="font-mono text-foreground">{ticket.code}</b>. Xuất trình mã QR tại cửa soát vé để đối soát vào cổng.
                    </p>

                    {/* Ticket Action Utilities: Calendar, Download, Share */}
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
                      {/* Google Calendar Link */}
                      <a
                        href={generateGoogleCalendarUrl({
                          ticket,
                          event,
                          venue,
                          sessionStart,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground border border-border/80 shadow-xs hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Calendar className="h-3.5 w-3.5 text-brand" />
                        <span>Lưu lịch Google</span>
                      </a>

                      {/* Download Ticket Card PNG */}
                      <button
                        type="button"
                        disabled={downloadingCode === ticket.code}
                        onClick={async () => {
                          setDownloadingCode(ticket.code);
                          try {
                            await downloadTicketCardImage({
                              ticket,
                              event,
                              venue,
                              sessionStart,
                            });
                          } finally {
                            setDownloadingCode(null);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground border border-border/80 shadow-xs hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {downloadingCode === ticket.code ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                        ) : (
                          <Download className="h-3.5 w-3.5 text-brand" />
                        )}
                        <span>{downloadingCode === ticket.code ? 'Đang tạo ảnh…' : 'Tải thẻ vé PNG'}</span>
                      </button>

                      {/* Direct Zalo Share Button */}
                      <button
                        type="button"
                        onClick={async () => {
                          await shareTicketInfo({
                            ticket,
                            event,
                            venue,
                            sessionStart,
                          });
                          openZaloShare({
                            title: `Vé CultureLink: ${event.title} (${ticket.code})`,
                            url: 'https://culturelink-vn.pages.dev',
                          });
                          setSharedCode(ticket.code);
                          setTimeout(() => setSharedCode(null), 3000);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground border border-border/80 shadow-xs hover:bg-muted transition-colors cursor-pointer"
                      >
                        {sharedCode === ticket.code ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <ZaloIcon size={16} />
                        )}
                        <span>{sharedCode === ticket.code ? 'Đã mở Zalo & chép vé!' : 'Chia sẻ Zalo'}</span>
                      </button>
                    </div>

                    {/* Cancellation Button */}
                    <div className="pt-2 w-full flex justify-center">
                      <button
                        type="button"
                        disabled={!canCancel}
                        onClick={() => handleCancelTicket(ticket.code)}
                        className="rounded-full border border-destructive/60 px-4 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        {canCancel ? 'Hủy vé này (hoàn tiền)' : 'Không thể hủy (<24h trước giờ diễn)'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded Details for Used Ticket */}
                {isExpanded && ticket.status === 'used' && (
                  <div className="flex flex-col items-center gap-2 border-t border-dashed border-border p-4 bg-emerald-500/5 text-center text-xs animate-in fade-in-0 duration-200">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">
                      ✓ Vé đã được đối soát vào cổng thành công
                    </p>
                    <p className="text-muted-foreground text-[11px] max-w-sm">
                      Mã vé {ticket.code} ({ticket.qty} vé) đã check-in tại địa điểm. Cảm ơn bạn đã tham gia sự kiện!
                    </p>
                  </div>
                )}

                {/* Expanded Details for Cancelled Ticket */}
                {isExpanded && ticket.status === 'cancelled' && (
                  <div className="flex flex-col items-center gap-2 border-t border-dashed border-border p-4 bg-rose-500/5 text-center text-xs animate-in fade-in-0 duration-200">
                    <p className="font-bold text-rose-600">
                      Vé đã được hủy thành công
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Chỗ ngồi đã được hoàn trả lại cho hệ thống ban tổ chức.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
