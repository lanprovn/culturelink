import { CategoryItem, Venue, EventItem, MembershipPlan, BookingTicket } from '@/types';

export const CATEGORIES: CategoryItem[] = [
  { id: 'trien-lam', name: 'Triển lãm', emoji: '🖼️', color: 'oklch(0.9 0.06 290)' },
  { id: 'bieu-dien', name: 'Biểu diễn', emoji: '🎭', color: 'oklch(0.9 0.07 350)' },
  { id: 'workshop', name: 'Workshop', emoji: '🎨', color: 'oklch(0.92 0.07 80)' },
  { id: 'di-san', name: 'Di sản', emoji: '🏛️', color: 'oklch(0.9 0.06 200)' },
  { id: 'am-thuc', name: 'Ẩm thực', emoji: '🍜', color: 'oklch(0.92 0.08 50)' },
  { id: 'le-hoi', name: 'Lễ hội', emoji: '🏮', color: 'oklch(0.9 0.08 20)' },
  { id: 'dia-phuong', name: 'Văn hóa địa phương', emoji: '🛶', color: 'oklch(0.92 0.07 140)' },
  { id: 'cong-dong', name: 'Cộng đồng', emoji: '🤝', color: 'oklch(0.92 0.05 250)' },
];

export const VENUES: Venue[] = [
  { id: 'v1', name: 'Nhà hát Thành phố', district: 'Quận 1', lat: 10.7766, lng: 106.7033 },
  { id: 'v2', name: 'Bảo tàng Mỹ thuật TP.HCM', district: 'Quận 1', lat: 10.7722, lng: 106.6987 },
  { id: 'v3', name: 'Bảo tàng Lịch sử Việt Nam', district: 'Quận 1', lat: 10.7877, lng: 106.705 },
  { id: 'v4', name: 'Chợ Bến Thành', district: 'Quận 1', lat: 10.772, lng: 106.698 },
  { id: 'v5', name: 'Nhà hát Rồng Vàng', district: 'Quận 1', lat: 10.7766, lng: 106.7014 },
  { id: 'v6', name: 'The Factory Contemporary Arts', district: 'TP. Thủ Đức', lat: 10.7871, lng: 106.7427 },
  { id: 'v7', name: 'Chợ Lớn – Quận 5', district: 'Quận 5', lat: 10.7525, lng: 106.6565 },
  { id: 'v8', name: 'Hẻm Sáng Tạo Quận 3', district: 'Quận 3', lat: 10.782, lng: 106.686 },
  { id: 'v9', name: 'Công viên Tao Đàn', district: 'Quận 1', lat: 10.7756, lng: 106.6923 },
  { id: 'v10', name: 'Bến Nhà Rồng', district: 'Quận 4', lat: 10.7686, lng: 106.7065 },
  { id: 'v11', name: 'Đường sách Nguyễn Văn Bình', district: 'Quận 1', lat: 10.7786, lng: 106.7003 },
];

export const EVENT_IMAGES = [
  '/assets/banner.jpg',
  '/assets/events.jpg',
];

export const getEventImage = (img: string | number): string => {
  if (typeof img === 'string') return img;
  return EVENT_IMAGES[img] || EVENT_IMAGES[0] || '/assets/banner.jpg';
};

const createDateString = (dayOffset: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const makeSession = (id: string, dayOffset: number, hour: number, capacity: number, left: number) => ({
  id,
  start: createDateString(dayOffset, hour),
  capacity,
  left,
});

export const EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'Đêm nhạc Áo Dài & Nhạc Trịnh',
    category: 'bieu-dien',
    venueId: 'v1',
    price: 350000,
    popularity: 98,
    img: '/assets/events/e1.jpg',
    pos: '50% 30%',
    summary: 'Đêm diễn kết hợp trình diễn áo dài và những ca khúc Trịnh Công Sơn bất hủ.',
    program: ['19:00 Đón khách', '19:30 Trình diễn áo dài', '20:15 Nhạc Trịnh'],
    requirements: 'Trang phục lịch sự. Không quay phim.',
    tags: ['am-nhac', 'toi'],
    format: 'xem',
    slot: 'toi',
    group: 'ca-hai',
    sessions: [makeSession('e1a', 3, 19, 200, 34), makeSession('e1b', 10, 19, 200, 3)],
    rating: 4.8,
  },
  {
    id: 'e2',
    title: 'Triển lãm Sơn mài Đương đại',
    category: 'trien-lam',
    venueId: 'v2',
    price: 0,
    popularity: 85,
    img: '/assets/events/e2.jpg',
    pos: '50% 50%',
    summary: 'Hơn 60 tác phẩm sơn mài của các họa sĩ trẻ Việt Nam.',
    program: ['09:00–17:00 Mở cửa tự do', '15:00 Tour hướng dẫn'],
    requirements: 'Miễn phí, cần đăng ký vé.',
    tags: ['nghe-thuat'],
    format: 'xem',
    slot: 'ngay',
    group: 'mot-minh',
    sessions: [makeSession('e2a', 1, 9, 300, 180), makeSession('e2b', 6, 9, 300, 220)],
    rating: 4.6,
  },
  {
    id: 'e3',
    title: 'Workshop Vẽ Sơn mài Mini',
    category: 'workshop',
    venueId: 'v8',
    price: 450000,
    popularity: 76,
    img: '/assets/events/e3.jpg',
    pos: '50% 50%',
    summary: 'Tự tay hoàn thiện một đĩa sơn mài nhỏ mang về.',
    program: ['Giới thiệu chất liệu', 'Thực hành 2 giờ', 'Đóng gói sản phẩm'],
    requirements: 'Không cần kinh nghiệm. Tối đa 15 người.',
    tags: ['thu-cong'],
    format: 'tuong-tac',
    slot: 'cuoi-tuan',
    group: 'nhom',
    sessions: [makeSession('e3a', 4, 14, 15, 5), makeSession('e3b', 11, 14, 15, 15)],
    rating: 4.9,
  },
  {
    id: 'e4',
    title: 'Múa rối nước Thăng Long',
    category: 'bieu-dien',
    venueId: 'v5',
    price: 280000,
    popularity: 92,
    img: '/assets/events/e4.jpg',
    pos: '50% 40%',
    summary: 'Nghệ thuật múa rối nước truyền thống với dàn nhạc dân tộc.',
    program: ['Chú Tễu', 'Rước rồng', 'Đua thuyền'],
    requirements: 'Trẻ em dưới 4 tuổi miễn phí.',
    tags: ['truyen-thong'],
    format: 'xem',
    slot: 'toi',
    group: 'nhom',
    sessions: [makeSession('e4a', 0, 18, 120, 40), makeSession('e4b', 2, 18, 120, 60)],
    rating: 4.7,
  },
  {
    id: 'e5',
    title: 'Tour Ẩm thực Chợ Lớn về đêm',
    category: 'am-thuc',
    venueId: 'v7',
    price: 390000,
    popularity: 88,
    img: '/assets/events/e5.jpg',
    pos: '50% 50%',
    summary: 'Khám phá 7 món ăn người Hoa trong các con hẻm Chợ Lớn.',
    program: ['Gặp hướng dẫn viên', '7 điểm ăn uống', 'Chè kết thúc'],
    requirements: 'Mang giày thoải mái.',
    tags: ['am-thuc', 'toi'],
    format: 'tuong-tac',
    slot: 'toi',
    group: 'nhom',
    sessions: [makeSession('e5a', 2, 18, 12, 4), makeSession('e5b', 5, 18, 12, 12)],
    rating: 4.8,
  },
  {
    id: 'e6',
    title: 'Di sản Kiến trúc Pháp – Walking Tour',
    category: 'di-san',
    venueId: 'v1',
    price: 150000,
    popularity: 70,
    img: '/assets/events/e6.jpg',
    pos: '50% 50%',
    summary: 'Đi bộ qua Nhà hát, Bưu điện, Nhà thờ Đức Bà.',
    program: ['Nhà hát TP', 'Bưu điện TP', 'Nhà thờ Đức Bà'],
    requirements: 'Tour 2 giờ đi bộ.',
    tags: ['lich-su'],
    format: 'tuong-tac',
    slot: 'cuoi-tuan',
    group: 'ca-hai',
    sessions: [makeSession('e6a', 5, 8, 20, 9)],
    rating: 4.5,
  },
  {
    id: 'e7',
    title: 'Lễ hội Đèn lồng Phố Hội',
    category: 'le-hoi',
    venueId: 'v9',
    price: 0,
    popularity: 95,
    img: '/assets/events/e7.jpg',
    pos: '50% 50%',
    summary: 'Không gian đèn lồng, trò chơi dân gian và ẩm thực.',
    program: ['Thả đèn', 'Trò chơi dân gian', 'Biểu diễn lân'],
    requirements: 'Miễn phí, cần vé vào cổng.',
    tags: ['le-hoi'],
    format: 'xem',
    slot: 'cuoi-tuan',
    group: 'nhom',
    sessions: [makeSession('e7a', 6, 17, 1000, 640)],
    rating: 4.4,
  },
  {
    id: 'e8',
    title: 'Bảo tàng Lịch sử – Đêm huyền thoại',
    category: 'di-san',
    venueId: 'v3',
    price: 120000,
    popularity: 66,
    img: '/assets/events/e8.jpg',
    pos: '50% 40%',
    summary: 'Tham quan bảo tàng buổi tối với ánh sáng nghệ thuật.',
    program: ['Khu cổ vật', 'Trình chiếu 3D'],
    requirements: 'Không dùng đèn flash.',
    tags: ['lich-su', 'toi'],
    format: 'xem',
    slot: 'toi',
    group: 'mot-minh',
    sessions: [makeSession('e8a', 7, 19, 80, 30)],
    rating: 4.3,
  },
  {
    id: 'e9',
    title: 'Đờn ca tài tử trên sông',
    category: 'dia-phuong',
    venueId: 'v10',
    price: 220000,
    popularity: 72,
    img: '/assets/events/e9.jpg',
    pos: '50% 50%',
    summary: 'Thưởng thức đờn ca tài tử Nam Bộ trên du thuyền.',
    program: ['Lên thuyền', 'Đờn ca tài tử', 'Ngắm hoàng hôn'],
    requirements: 'Có áo phao.',
    tags: ['am-nhac'],
    format: 'xem',
    slot: 'toi',
    group: 'ca-hai',
    sessions: [makeSession('e9a', 8, 17, 40, 22)],
    rating: 4.6,
  },
  {
    id: 'e10',
    title: 'Phiên chợ Sách & Cộng đồng đọc',
    category: 'cong-dong',
    venueId: 'v11',
    price: 0,
    popularity: 60,
    img: '/assets/events/e10.jpg',
    pos: '50% 40%',
    summary: 'Đổi sách, trò chuyện cùng tác giả, góc đọc cho trẻ em.',
    program: ['Đổi sách', 'Giao lưu tác giả'],
    requirements: 'Mang theo sách cũ để đổi.',
    tags: ['cong-dong'],
    format: 'tuong-tac',
    slot: 'cuoi-tuan',
    group: 'ca-hai',
    sessions: [makeSession('e10a', 4, 9, 500, 410)],
    rating: 4.2,
  },
  {
    id: 'e11',
    title: 'Workshop Pha cà phê phin',
    category: 'workshop',
    venueId: 'v4',
    price: 180000,
    popularity: 81,
    img: '/assets/events/e11.jpg',
    pos: '50% 50%',
    summary: 'Học pha phin, bạc xỉu và cà phê trứng chuẩn vị.',
    program: ['Lịch sử cà phê VN', 'Thực hành 3 món'],
    requirements: 'Phù hợp mọi lứa tuổi.',
    tags: ['am-thuc', 'thu-cong'],
    format: 'tuong-tac',
    slot: 'ngay',
    group: 'mot-minh',
    sessions: [makeSession('e11a', 1, 10, 10, 2), makeSession('e11b', 3, 10, 10, 10)],
    rating: 4.9,
  },
  {
    id: 'e12',
    title: 'Nghệ thuật Đương đại: Sài Gòn Mới',
    category: 'trien-lam',
    venueId: 'v6',
    price: 100000,
    popularity: 74,
    img: '/assets/events/e12.jpg',
    pos: '50% 50%',
    summary: 'Sắp đặt và video art của nghệ sĩ trẻ thành phố.',
    program: ['Tự do tham quan', 'Artist talk 16:00'],
    requirements: 'Không chạm vào tác phẩm.',
    tags: ['nghe-thuat'],
    format: 'xem',
    slot: 'cuoi-tuan',
    group: 'mot-minh',
    sessions: [makeSession('e12a', 5, 10, 150, 90)],
    rating: 4.5,
  },
  {
    id: 'e13',
    title: 'Lớp May Áo Dài cơ bản',
    category: 'workshop',
    venueId: 'v8',
    price: 520000,
    popularity: 64,
    img: '/assets/events/e13.jpg',
    pos: '50% 50%',
    summary: 'Tìm hiểu cấu trúc áo dài và may một chi tiết nhỏ.',
    program: ['Lý thuyết', 'Thực hành'],
    requirements: 'Mang theo kéo nhỏ nếu có.',
    tags: ['thu-cong'],
    format: 'tuong-tac',
    slot: 'cuoi-tuan',
    group: 'mot-minh',
    sessions: [makeSession('e13a', 9, 9, 12, 7)],
    rating: 4.7,
  },
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    discount: 0,
    combo: 0,
    hold: 15,
    perks: ['Đặt vé cơ bản', 'Culture Match'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 49000,
    discount: 0.1,
    combo: 0.05,
    hold: 30,
    perks: ['Giảm 10% vé', '+5% combo', 'Giữ chỗ 30 phút'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 129000,
    discount: 0.2,
    combo: 0.1,
    hold: 60,
    perks: ['Giảm 20% vé', '+10% combo', 'Giữ chỗ 60 phút', 'Phân tích đầy đủ'],
  },
];

export const getVenue = (id: string) => VENUES.find((v) => v.id === id) || VENUES[0];
export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
export const getEvent = (id: string) => EVENTS.find((e) => e.id === id);

export const formatPrice = (price: number) => {
  return price === 0 ? 'Miễn phí' : price.toLocaleString('vi-VN') + 'đ';
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const removeDiacritics = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

export const haversineDistanceKm = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
};

export const calculateDiscountedPrice = (
  basePrice: number,
  planId: 'free' | 'plus' | 'pro',
  comboDiscount: number = 0
) => {
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId) || MEMBERSHIP_PLANS[0];
  const rate = comboDiscount > 0 ? comboDiscount + plan.combo : plan.discount;
  return Math.round(basePrice * (1 - rate));
};

export const canCancelTicket = (eventStartTime: string, now: Date = new Date()) => {
  return new Date(eventStartTime).getTime() - now.getTime() >= 86400000;
};

export const getMemberLevel = (ticketsCount: number) => {
  if (ticketsCount >= 20) return { name: 'Kim cương', next: null };
  if (ticketsCount >= 10) return { name: 'Vàng', next: 20 };
  if (ticketsCount >= 3) return { name: 'Bạc', next: 10 };
  return { name: 'Đồng', next: 3 };
};

export const calculateMatchScore = (
  event: EventItem,
  answers: {
    interests: string[];
    format: string;
    budget: number;
    slot: string;
    group: string;
  }
) => {
  const reasons: string[] = [];
  let score = 0;

  if (answers.interests.includes(event.category)) {
    score += 40;
    reasons.push('Đúng sở thích của bạn');
  }

  if (answers.format === event.format) {
    score += 20;
    reasons.push('Hợp hình thức bạn thích');
  }

  if (answers.budget >= 0 && event.price <= answers.budget) {
    score += 15;
    reasons.push(event.price === 0 ? 'Miễn phí' : 'Trong ngân sách');
  }

  if (answers.slot === event.slot) {
    score += 15;
    reasons.push('Khớp thời gian rảnh');
  }

  if (event.group === 'ca-hai' || event.group === answers.group) {
    score += 10;
    reasons.push(answers.group === 'nhom' ? 'Phù hợp đi nhóm' : 'Phù hợp đi một mình');
  }

  const finalScore = Math.min(100, Math.round(score));
  return {
    score: finalScore,
    label: finalScore >= 75 ? 'Rất hợp' : finalScore >= 50 ? 'Khá hợp' : 'Có thể thử',
    reasons,
  };
};

export const INITIAL_DEMO_TICKETS: BookingTicket[] = [
  {
    code: 'CL-88A2F1',
    eventId: 'e1',
    sessionId: 'e1a',
    qty: 2,
    name: 'Nguyễn Văn An',
    phone: '0903123456',
    total: 560000,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    code: 'CL-77B9C4',
    eventId: 'e2',
    sessionId: 'e2a',
    qty: 1,
    name: 'Trần Thị Mai',
    phone: '0918765432',
    total: 150000,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    code: 'CL-66D4E8',
    eventId: 'e3',
    sessionId: 'e3a',
    qty: 3,
    name: 'Lê Hoàng Tiến',
    phone: '0982345773',
    total: 360000,
    status: 'used',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
