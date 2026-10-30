import QRCode from 'qrcode';
import { BookingTicket, EventItem, Venue } from '@/types';
import { formatDate, formatPrice } from '@/data/mockData';

/**
 * Creates a Google Calendar direct template link for a cultural event ticket.
 */
export function generateGoogleCalendarUrl({
  ticket,
  event,
  venue,
  sessionStart,
}: {
  ticket: BookingTicket;
  event: EventItem;
  venue: Venue;
  sessionStart: string;
}): string {
  const startDate = new Date(sessionStart);
  // Default show duration: 2 hours
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatCalendarDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const dates = `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`;
  const title = `[CultureLink] ${event.title}`;
  const location = `${venue.name}, ${venue.district}, TP. Hồ Chí Minh`;
  const details = `Vé xem sự kiện văn hóa CultureLink\n- Mã vé: ${ticket.code}\n- Sự kiện: ${event.title}\n- Địa điểm: ${venue.name} (${venue.district})\n- Số lượng: ${ticket.qty} vé\n- Khách hàng: ${ticket.name}\n- Website: https://culturelink-vn.pages.dev`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(
    location
  )}`;
}

/**
 * Opens official Zalo Web Share dialog in a popup window.
 */
export function openZaloShare({
  url = 'https://culturelink-vn.pages.dev',
  title = 'CultureLink - Trải nghiệm Văn hóa & Nghệ thuật TP.HCM',
}: {
  url?: string;
  title?: string;
}): void {
  const zaloUrl = `https://sp.zalo.me/plugins/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
  if (typeof window !== 'undefined') {
    window.open(zaloUrl, '_blank', 'width=600,height=500,toolbar=0,status=0');
  }
}

/**
 * Share ticket info via Native Web Share API (Zalo, Messenger, etc.) or clipboard fallback.
 */
export async function shareTicketInfo({
  ticket,
  event,
  venue,
  sessionStart,
}: {
  ticket: BookingTicket;
  event: EventItem;
  venue: Venue;
  sessionStart: string;
}): Promise<'shared' | 'copied'> {
  const shareText = `🎟️ VÉ ĐIỆN TỬ CULTURELINK\n\nSự kiện: ${event.title}\nMã vé: ${ticket.code}\nSuất diễn: ${formatDate(sessionStart)}\nĐịa điểm: ${venue.name} (${venue.district})\nSố lượng: ${ticket.qty} vé\n\nXem vé online: https://culturelink-vn.pages.dev`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Vé CultureLink: ${event.title}`,
        text: shareText,
        url: 'https://culturelink-vn.pages.dev',
      });
      return 'shared';
    } catch {
      // User dismissed or share failed, fallback to copy
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(shareText);
  }
  return 'copied';
}

/**
 * Generates and downloads a stylish, high-resolution E-Ticket Pass image (PNG)
 * with the QR code and event information rendered on a canvas.
 */
export async function downloadTicketCardImage({
  ticket,
  event,
  venue,
  sessionStart,
}: {
  ticket: BookingTicket;
  event: EventItem;
  venue: Venue;
  sessionStart: string;
}): Promise<void> {
  const width = 800;
  const height = 1120;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#1E1035');
  bgGradient.addColorStop(0.5, '#2A1B6B');
  bgGradient.addColorStop(1, '#0F0826');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. White Card Container
  const cardX = 40;
  const cardY = 50;
  const cardW = width - 80;
  const cardH = height - 100;
  const radius = 28;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // 3. Card Header Banner
  const headerGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 140);
  headerGradient.addColorStop(0, '#2A1B6B');
  headerGradient.addColorStop(1, '#6D28D9');

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, 140, [radius, radius, 0, 0]);
  ctx.fillStyle = headerGradient;
  ctx.fill();
  ctx.restore();

  // Header Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px "Inter", sans-serif';
  ctx.fillText('CULTURELINK · VIỆT NAM', cardX + 36, cardY + 60);

  ctx.fillStyle = '#E9D5FF';
  ctx.font = '15px "Inter", sans-serif';
  ctx.fillText('THẺ VÉ ĐIỆN TỬ CHÍNH THỨC · E-TICKET PASS', cardX + 36, cardY + 95);

  // 4. Event Title & Details
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 32px "Inter", sans-serif';
  const displayTitle = event.title.length > 32 ? event.title.slice(0, 30) + '…' : event.title;
  ctx.fillText(displayTitle, cardX + 36, cardY + 205);

  // Divider Line
  ctx.strokeStyle = '#F3F4F6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 36, cardY + 230);
  ctx.lineTo(cardX + cardW - 36, cardY + 230);
  ctx.stroke();

  // Meta Rows
  const drawRow = (label: string, val: string, yPos: number) => {
    ctx.fillStyle = '#6B7280';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(label.toUpperCase(), cardX + 36, yPos);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText(val, cardX + 36, yPos + 24);
  };

  drawRow('Thời gian suất diễn', formatDate(sessionStart), cardY + 275);
  drawRow('Địa điểm tổ chức', `${venue.name} (${venue.district})`, cardY + 345);
  drawRow('Khách hàng', `${ticket.name} (${ticket.phone || 'Chính chủ'})`, cardY + 415);
  drawRow('Số lượng & Tổng tiền', `${ticket.qty} vé · ${formatPrice(ticket.total)}`, cardY + 485);

  // 5. Tear Notch Circles & Dashed Line
  const notchY = cardY + 540;
  const notchRadius = 20;

  // Left notch
  ctx.fillStyle = '#1E1035';
  ctx.beginPath();
  ctx.arc(cardX, notchY, notchRadius, 0, Math.PI * 2);
  ctx.fill();

  // Right notch
  ctx.beginPath();
  ctx.arc(cardX + cardW, notchY, notchRadius, 0, Math.PI * 2);
  ctx.fill();

  // Dashed line between notches
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(cardX + notchRadius + 10, notchY);
  ctx.lineTo(cardX + cardW - notchRadius - 10, notchY);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // 6. QR Code Generation & Drawing
  const qrDataUrl = await QRCode.toDataURL(
    `CULTURELINK-VERIFIED|${ticket.code}|${ticket.sessionId}`,
    {
      width: 320,
      margin: 1,
      color: {
        dark: '#1E1035',
        light: '#FFFFFF',
      },
    }
  );

  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  await new Promise((resolve) => {
    qrImg.onload = resolve;
  });

  const qrSize = 260;
  const qrX = cardX + (cardW - qrSize) / 2;
  const qrY = notchY + 35;

  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // 7. Ticket Code Display
  ctx.fillStyle = '#2A1B6B';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(ticket.code, cardX + cardW / 2, qrY + qrSize + 40);

  ctx.fillStyle = '#6B7280';
  ctx.font = '13px "Inter", sans-serif';
  ctx.fillText('Xuất trình mã QR tại quầy để nhân viên soát vé quét đối soát vào cổng', cardX + cardW / 2, qrY + qrSize + 70);

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '11px "Inter", sans-serif';
  ctx.fillText('Bản quyền © 2026 CultureLink Việt Nam · Nền tảng Trải nghiệm Văn hóa TP.HCM', cardX + cardW / 2, qrY + qrSize + 95);

  // 8. Trigger Download
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `CultureLink-Ve-${ticket.code}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

