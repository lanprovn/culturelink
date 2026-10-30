'use client';

import React, { useState } from 'react';
import { Star, MessageSquarePlus, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export interface ReviewItem {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
}

const DEFAULT_REVIEWS_MAP: Record<string, ReviewItem[]> = {
  e1: [
    {
      id: 'r1',
      author: 'Nguyễn Thanh Tùng',
      rating: 5,
      date: '2 ngày trước',
      comment: 'Âm thanh Nhà hát Thành phố tuyệt vời! Tiếng saxophone hòa cùng tà áo dài tạo cảm xúc rất lắng đọng.',
    },
    {
      id: 'r2',
      author: 'Lê Hoàng Yến',
      rating: 5,
      date: 'Tuần trước',
      comment: 'Rất đáng tiền, ca sĩ hát nhạc Trịnh truyền cảm, trang phục áo dài lụa tơ tằm rất chỉn chu.',
    },
  ],
  e2: [
    {
      id: 'r3',
      author: 'Trần Minh Quang',
      rating: 5,
      date: 'Hôm qua',
      comment: 'Bức Vườn xuân Bắc Trung Nam ngoài đời lộng lẫy hơn trên ảnh rất nhiều, ánh kim sơn mài kỳ diệu!',
    },
    {
      id: 'r4',
      author: 'Phạm Thu Trang',
      rating: 4,
      date: '3 ngày trước',
      comment: 'Bảo tàng Mỹ thuật mát mẻ, nhiều góc chụp ảnh đậm chất kiến trúc cổ điển.',
    },
  ],
  e4: [
    {
      id: 'r5',
      author: 'Vũ Quốc Bảo',
      rating: 5,
      date: '4 ngày trước',
      comment: 'Các bé nhà mình rất mê chú Tễu và màn rước rồng phun lửa. Dàn nhạc cụ dân tộc chơi sống 100%!',
    },
  ],
  e5: [
    {
      id: 'r6',
      author: 'Mai Ngọc Ánh',
      rating: 5,
      date: 'Hôm qua',
      comment: 'Sủi cảo Hà Tôn Quyền ngon đỉnh chóp, hướng dẫn viên dẫn vào mấy con hẻm cổ Chợ Lớn rất thú vị.',
    },
  ],
  e11: [
    {
      id: 'r7',
      author: 'Đặng Tuấn Anh',
      rating: 5,
      date: 'Tuần trước',
      comment: 'Lần đầu biết cách căn nhiệt độ nước để pha cà phê phin không bị khét. Cà phê trứng béo ngậy!',
    },
  ],
};

interface EventReviewsProps {
  eventId: string;
  rating: number;
}

export default function EventReviews({ eventId, rating }: EventReviewsProps) {
  const { user } = useApp();

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    return DEFAULT_REVIEWS_MAP[eventId] || [
      {
        id: 'default-1',
        author: 'Khán giả CultureLink',
        rating: Math.round(rating),
        date: '3 ngày trước',
        comment: 'Sự kiện tổ chức rất chu đáo, nhân sự hỗ trợ nhiệt tình, không gian văn hóa đậm nét.',
      },
      {
        id: 'default-2',
        author: 'Đoàn Thu Hà',
        rating: 5,
        date: 'Tuần trước',
        comment: 'Trải nghiệm đáng nhớ tại TP.HCM, sẽ giới thiệu thêm cho bạn bè và gia đình.',
      },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: user?.name || 'Khán giả ẩn danh',
      avatar: user?.avatar,
      rating: newRating,
      date: 'Vừa xong',
      comment: commentText.trim(),
    };

    setReviews([newRev, ...reviews]);
    setCommentText('');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 2000);
  };

  return (
    <div className="pt-2 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground text-sm">Đánh giá từ khán giả</h2>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span>{rating.toFixed(1)}</span>
            <span className="font-normal text-muted-foreground">({reviews.length} đánh giá)</span>
          </div>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="h-3.5 w-3.5 text-brand" />
            <span>Viết cảm nhận</span>
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-secondary/80 p-3.5 border border-border/60 space-y-3 animate-in fade-in-0 duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Bạn chấm sự kiện này mấy sao?</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewRating(s)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`h-4 w-4 ${
                      s <= newRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            placeholder="Chia sẻ cảm xúc của bạn về không gian, nghệ sĩ, âm thanh…"
            className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hủy
            </button>

            {submitted ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đã gửi đánh giá!
              </span>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Send className="h-3 w-3" />
                <span>Gửi cảm nhận</span>
              </button>
            )}
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-2.5">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl bg-muted/20 p-3 border border-border/30 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-brand/10 font-bold text-[11px] text-brand">
                  {rev.author[0]}
                </div>
                <span className="text-xs font-semibold text-foreground">{rev.author}</span>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground ml-1">{rev.date}</span>
              </div>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed pl-8">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

