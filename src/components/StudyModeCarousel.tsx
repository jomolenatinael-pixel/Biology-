import React from 'react';
import { StudyMode } from '../types';

interface StudyModeCarouselProps {
  onSelectMode: (mode: StudyMode) => void;
  bestMatchTime: number | null;
  totalTerms: number;
}

export const StudyModeCarousel: React.FC<StudyModeCarouselProps> = ({
  onSelectMode,
  bestMatchTime,
  totalTerms,
}) => {
  const formattedBestTime = bestMatchTime
    ? `${(bestMatchTime / 1000).toFixed(1)}s`
    : '0:24.2';

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-[17px] font-bold text-text-primary">
          Study Modes
        </h2>
        <span className="font-label-md text-xs text-secondary font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">tune</span>
          5 Modes
        </span>
      </div>

      {/* Horizontal Snap Carousel for tactile study cards */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 -mx-4 px-4 no-scrollbar snap-x snap-mandatory">
        {/* Flashcards (Primary Highlight) */}
        <div
          id="mode-card-flashcards"
          onClick={() => onSelectMode('flashcards')}
          className="snap-start flex-shrink-0 w-64 bg-surface-card rounded-2xl p-4 border border-secondary/30 border-b-4 border-b-secondary shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-2xl" data-icon="style">
                  style
                </span>
              </div>
              <span className="font-label-md text-xs px-2.5 py-0.5 rounded-full bg-surface-container-low text-secondary font-bold border border-secondary-fixed">
                Quick Study
              </span>
            </div>
            <h3 className="font-title-card text-[17px] text-text-primary font-bold">Flashcards</h3>
            <p className="font-body-sm text-xs text-text-secondary line-clamp-2">
              Swipe & flip active recall mechanism with instant spaced retention.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-secondary font-label-md text-xs font-bold">
            <span>Ready for Review</span>
            <span
              className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>
        </div>

        {/* Learn (Adaptive AI) */}
        <div
          id="mode-card-learn"
          onClick={() => onSelectMode('learn')}
          className="snap-start flex-shrink-0 w-64 bg-surface-card rounded-2xl p-4 border border-border-tactile border-b-4 border-b-border-tactile shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] flex flex-col justify-between relative group cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-2xl" data-icon="psychology">
                  psychology
                </span>
              </div>
              <span className="font-label-md text-xs px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-bold">
                Adaptive AI
              </span>
            </div>
            <h3 className="font-title-card text-[17px] text-text-primary font-bold">Learn</h3>
            <p className="font-body-sm text-xs text-text-secondary line-clamp-2">
              Personalized spaced repetition path optimized to your weakest terms.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-primary font-label-md text-xs font-bold">
            <span>Stage 2 in progress</span>
            <span
              className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>
        </div>

        {/* Test */}
        <div
          id="mode-card-test"
          onClick={() => onSelectMode('test')}
          className="snap-start flex-shrink-0 w-64 bg-surface-card rounded-2xl p-4 border border-border-tactile border-b-4 border-b-border-tactile shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container text-tertiary-fixed flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-2xl" data-icon="quiz">
                  quiz
                </span>
              </div>
              <span className="font-label-md text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-bold">
                Assessment
              </span>
            </div>
            <h3 className="font-title-card text-[17px] text-text-primary font-bold">Test</h3>
            <p className="font-body-sm text-xs text-text-secondary line-clamp-2">
              Custom mock exam with instant grading and detailed diagnostic feedback.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-text-secondary font-label-md text-xs font-bold">
            <span>{Math.min(20, totalTerms)} Questions</span>
            <span
              className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>
        </div>

        {/* Match (Game) */}
        <div
          id="mode-card-match"
          onClick={() => onSelectMode('match')}
          className="snap-start flex-shrink-0 w-64 bg-surface-card rounded-2xl p-4 border border-border-tactile border-b-4 border-b-border-tactile shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-warning-learning text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-2xl" data-icon="timer">
                  timer
                </span>
              </div>
              <span className="font-label-md text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-warning-learning-variant font-bold border border-orange-200">
                Game
              </span>
            </div>
            <h3 className="font-title-card text-[17px] text-text-primary font-bold">Match</h3>
            <p className="font-body-sm text-xs text-text-secondary line-clamp-2">
              Beat the clock: 0:24 record. Drag terms to matching biological definitions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-warning-learning font-label-md text-xs font-bold">
            <span>Best: {formattedBestTime}</span>
            <span
              className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>
        </div>

        {/* Q-Chat (AI Tutor) */}
        <div
          id="mode-card-qchat"
          onClick={() => onSelectMode('qchat')}
          className="snap-start flex-shrink-0 w-64 bg-surface-card rounded-2xl p-4 border border-border-tactile border-b-4 border-b-border-tactile shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-tertiary-fixed text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-2xl" data-icon="smart_toy">
                  smart_toy
                </span>
              </div>
              <span className="font-label-md text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
                v1.2 AI Tutor
              </span>
            </div>
            <h3 className="font-title-card text-[17px] text-text-primary font-bold">Q-Chat</h3>
            <p className="font-body-sm text-xs text-text-secondary line-clamp-2">
              Interactive Socratic dialogue, customized practice questions, and concept coaching.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-secondary font-label-md text-xs font-bold">
            <span>Ask Dr. Vance's AI</span>
            <span
              className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
