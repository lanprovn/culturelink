export type CategoryId =
  | 'trien-lam'
  | 'bieu-dien'
  | 'workshop'
  | 'di-san'
  | 'am-thuc'
  | 'le-hoi'
  | 'dia-phuong'
  | 'cong-dong';

export interface CategoryItem {
  id: CategoryId;
  name: string;
  emoji: string;
  color: string;
}

export interface Venue {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
}

export interface EventSession {
  id: string;
  start: string;
  capacity: number;
  left: number;
}

export interface EventItem {
  id: string;
  title: string;
  category: CategoryId;
  venueId: string;
  price: number;
  popularity: number;
  img: string | number; // Image path (e.g. "/assets/events/e1.jpg") or index
  pos: string; // CSS objectPosition, e.g. "50% 50%"
  summary: string;
  program: string[];
  requirements: string;
  tags: string[];
  format: 'xem' | 'tuong-tac';
  slot: 'ngay' | 'toi' | 'cuoi-tuan';
  group: 'mot-minh' | 'nhom' | 'ca-hai';
  sessions: EventSession[];
  rating: number;
}

export interface MembershipPlan {
  id: 'free' | 'plus' | 'pro';
  name: string;
  price: number;
  discount: number;
  combo: number;
  hold: number;
  perks: string[];
}

export interface BookingTicket {
  code: string;
  eventId: string;
  sessionId: string;
  qty: number;
  name: string;
  phone: string;
  total: number;
  status: 'active' | 'used' | 'cancelled';
  createdAt: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  isGuest?: boolean;
}

export interface QuizAnswerState {
  interests: CategoryId[];
  format: string;
  budget: number;
  slot: string;
  group: string;
}
