'use client';

import React, { useState, useMemo } from 'react';
import { QuizAnswerState } from '@/types';
import { CATEGORIES, EVENTS, calculateMatchScore } from '@/data/mockData';
import Chip from '@/components/ui/Chip';
import EventCard from '@/components/events/EventCard';

const INITIAL_ANSWERS: QuizAnswerState = {
  interests: [],
  format: '',
  budget: -1,
  slot: '',
  group: '',
};

interface QuestionConfig {
  q: string;
  multi?: boolean;
  k?: keyof Omit<QuizAnswerState, 'interests'>;
  opts?: [string | number, string][];
}

const QUESTIONS: QuestionConfig[] = [
  { q: 'Bạn thích gì?', multi: true },
  {
    q: 'Hình thức yêu thích?',
    k: 'format',
    opts: [
      ['xem', 'Xem / thưởng thức'],
      ['tuong-tac', 'Trải nghiệm tương tác'],
    ],
  },
  {
    q: 'Ngân sách mỗi sự kiện?',
    k: 'budget',
    opts: [
      [0, 'Miễn phí'],
      [200000, 'Dưới 200k'],
      [500000, 'Dưới 500k'],
      [10000000, 'Không giới hạn'],
    ],
  },
  {
    q: 'Thời gian rảnh?',
    k: 'slot',
    opts: [
      ['ngay', 'Ban ngày'],
      ['toi', 'Buổi tối'],
      ['cuoi-tuan', 'Cuối tuần'],
    ],
  },
  {
    q: 'Đi một mình hay nhóm?',
    k: 'group',
    opts: [
      ['mot-minh', 'Một mình'],
      ['nhom', 'Đi nhóm'],
    ],
  },
];

export default function CultureMatchTab() {
  const [answers, setAnswers] = useState<QuizAnswerState>(INITIAL_ANSWERS);
  const [currentStep, setCurrentStep] = useState(0);

  const isCompleted = currentStep === 5;

  const currentQ = QUESTIONS[currentStep];

  // Calculate recommendation results
  const matches = useMemo(() => {
    return EVENTS.map((event) => ({
      event,
      ...calculateMatchScore(event, answers),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [answers]);

  const handleReset = () => {
    setAnswers(INITIAL_ANSWERS);
    setCurrentStep(0);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Culture Match</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trắc nghiệm 5 câu tìm sự kiện văn hóa chuẩn gu cá nhân của bạn
          </p>
        </div>
      </div>

      {isCompleted ? (
        <div className="space-y-4 animate-in fade-in-0 duration-300">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Gợi ý hợp với bạn nhất</p>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Làm lại
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map(({ event, score, label, reasons }) => (
              <div key={event.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand px-3 py-1 text-sm font-bold text-primary-foreground shadow-xs">
                    {score}%
                  </span>
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                </div>

                <EventCard event={event} />

                <p className="text-xs text-muted-foreground px-1">
                  Lý do:{' '}
                  {reasons.length > 0
                    ? reasons.join(' · ')
                    : 'Mở rộng trải nghiệm văn hóa mới'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[26px] bg-card p-5 shadow-soft border border-border/40">
          {/* Progress Bar */}
          <div className="mb-4 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground">Câu {currentStep + 1}/5</p>
          <h2 className="mb-4 mt-1 text-xl font-bold text-foreground">{currentQ.q}</h2>

          {/* Options */}
          <div className="flex flex-wrap gap-2">
            {currentStep === 0 ? (
              CATEGORIES.map((cat) => {
                const isSelected = answers.interests.includes(cat.id);
                return (
                  <Chip
                    key={cat.id}
                    on={isSelected}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        interests: isSelected
                          ? prev.interests.filter((id) => id !== cat.id)
                          : [...prev.interests, cat.id],
                      }))
                    }
                  >
                    {cat.emoji} {cat.name}
                  </Chip>
                );
              })
            ) : (
              currentQ.opts?.map(([val, label]) => {
                const key = currentQ.k!;
                const isSelected = answers[key] === val;
                return (
                  <Chip
                    key={String(val)}
                    on={isSelected}
                    onClick={() => {
                      setAnswers((prev) => ({
                        ...prev,
                        [key]: val,
                      }));
                      setCurrentStep((s) => s + 1);
                    }}
                  >
                    {label}
                  </Chip>
                );
              })
            )}
          </div>

          {/* Footer Navigation */}
          <div className="mt-6 flex justify-between items-center pt-2">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => s - 1)}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
            >
              ← Quay lại
            </button>

            {currentStep === 0 && (
              <button
                type="button"
                disabled={answers.interests.length === 0}
                onClick={() => setCurrentStep(1)}
                className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-40 transition-all"
              >
                Tiếp
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
