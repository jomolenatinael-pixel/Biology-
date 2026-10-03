import React from 'react';
import { MasteryStatus } from '../types';

interface MasteryOverviewProps {
  masteredCount: number;
  learningCount: number;
  unseenCount: number;
  totalCount: number;
  activeFilter: MasteryStatus | 'all' | 'starred';
  onSelectFilter: (filter: MasteryStatus | 'all' | 'starred') => void;
  onStudyWeakest: () => void;
}

export const MasteryOverview: React.FC<MasteryOverviewProps> = ({
  masteredCount,
  learningCount,
  unseenCount,
  totalCount,
  activeFilter,
  onSelectFilter,
  onStudyWeakest,
}) => {
  const masteredPct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
  const learningPct = totalCount > 0 ? Math.round((learningCount / totalCount) * 100) : 0;
  const unseenPct = Math.max(0, 100 - masteredPct - learningPct);

  // SVG dash calculation based on 100 circumference
  // Mastered starts at 0
  const masteredDash = `${masteredPct} ${100 - masteredPct}`;
  // Learning starts offset by mastered
  const learningDash = `${learningPct} ${100 - learningPct}`;
  const learningOffset = -masteredPct;
  // Unseen starts offset by mastered + learning
  const unseenDash = `${unseenPct} ${100 - unseenPct}`;
  const unseenOffset = -(masteredPct + learningPct);

  return (
    <section className="bg-surface-card rounded-2xl p-5 border border-border-tactile shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] space-y-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" data-icon="insights">
            insights
          </span>
          <h2 className="font-headline-sm text-[17px] font-bold text-text-primary">
            Mastery Overview
          </h2>
        </div>
        <span className="font-body-sm text-xs text-text-secondary flex items-center gap-1">
          <span className="material-symbols-outlined text-xs" data-icon="schedule">
            schedule
          </span>
          Live Sync
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Circular Progress Ring */}
        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background Circle */}
            <path
              className="text-surface-container stroke-current"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3.5"
            />
            {/* Unseen Segment */}
            {unseenPct > 0 && (
              <path
                className="text-outline-variant stroke-current transition-all duration-500"
                fill="none"
                strokeDasharray={unseenDash}
                strokeDashoffset={unseenOffset}
                strokeWidth="3.5"
              />
            )}
            {/* Learning Segment */}
            {learningPct > 0 && (
              <path
                className="text-warning-learning stroke-current transition-all duration-500"
                fill="none"
                strokeDasharray={learningDash}
                strokeDashoffset={learningOffset}
                strokeWidth="3.5"
              />
            )}
            {/* Mastered Segment */}
            {masteredPct > 0 && (
              <path
                className="text-success-known stroke-current transition-all duration-500"
                fill="none"
                strokeDasharray={masteredDash}
                strokeDashoffset="0"
                strokeLinecap={masteredPct < 100 ? 'round' : 'butt'}
                strokeWidth="3.5"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-tabular-stats text-lg text-text-primary font-extrabold tracking-tight">
              {masteredPct}%
            </span>
            <span className="font-label-md text-[10px] uppercase tracking-wider text-text-secondary font-bold">
              Mastered
            </span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="flex-1 space-y-2">
          {/* Mastered */}
          <button
            id="filter-mastered-btn"
            onClick={() => onSelectFilter(activeFilter === 'mastered' ? 'all' : 'mastered')}
            className={`w-full flex items-center justify-between text-xs font-label-md p-1.5 rounded-lg transition-all ${
              activeFilter === 'mastered'
                ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-300'
                : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success-known ring-2 ring-success-known/20" />
              <span className="text-text-primary font-medium">Mastered</span>
            </div>
            <span className="font-tabular-stats text-text-primary font-bold">{masteredCount}</span>
          </button>

          {/* Learning */}
          <button
            id="filter-learning-btn"
            onClick={() => onSelectFilter(activeFilter === 'learning' ? 'all' : 'learning')}
            className={`w-full flex items-center justify-between text-xs font-label-md p-1.5 rounded-lg transition-all ${
              activeFilter === 'learning'
                ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-300'
                : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-warning-learning ring-2 ring-warning-learning/20" />
              <span className="text-text-primary font-medium">Learning</span>
            </div>
            <span className="font-tabular-stats text-text-primary font-bold">{learningCount}</span>
          </button>

          {/* Unseen */}
          <button
            id="filter-unseen-btn"
            onClick={() => onSelectFilter(activeFilter === 'unseen' ? 'all' : 'unseen')}
            className={`w-full flex items-center justify-between text-xs font-label-md p-1.5 rounded-lg transition-all ${
              activeFilter === 'unseen'
                ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-300'
                : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-outline-variant ring-2 ring-outline-variant/20" />
              <span className="text-text-secondary font-medium">Unseen</span>
            </div>
            <span className="font-tabular-stats text-text-secondary font-bold">{unseenCount}</span>
          </button>
        </div>
      </div>

      {learningCount > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            {learningCount} terms need reinforcement
          </span>
          <button
            id="practice-weak-btn"
            onClick={onStudyWeakest}
            className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
          >
            Practice Weak Terms
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      )}
    </section>
  );
};
