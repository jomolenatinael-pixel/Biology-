import React, { useState, useEffect } from 'react';
import { TermItem } from '../types';
import { sounds } from '../utils/audio';

interface LearnModeProps {
  terms: TermItem[];
  onUpdateTermStatus: (id: string, status: TermItem['status']) => void;
  onExit: () => void;
}

interface Question {
  targetTerm: TermItem;
  options: string[];
  correctAnswer: string;
}

export const LearnMode: React.FC<LearnModeProps> = ({
  terms,
  onUpdateTermStatus,
  onExit,
}) => {
  const [queue, setQueue] = useState<TermItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [stageProgress, setStageProgress] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize queue prioritising learning/unseen first, then mastered
  useEffect(() => {
    const sorted = [...terms].sort((a, b) => {
      const rank = { learning: 0, unseen: 1, mastered: 2 };
      return rank[a.status] - rank[b.status];
    });
    setQueue(sorted);
    setStageProgress(1);
    setStreak(0);
    setCorrectCount(0);
    setIsFinished(false);
  }, [terms]);

  // Generate question whenever queue advances
  useEffect(() => {
    if (queue.length === 0) {
      if (terms.length > 0) setIsFinished(true);
      return;
    }

    const current = queue[0];
    // Pick 3 distractors from all terms
    const otherTerms = terms.filter((t) => t.id !== current.id);
    const shuffledOthers = [...otherTerms].sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, 3).map((t) => t.term);

    const allOptions = [...distractors, current.term].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      targetTerm: current,
      options: allOptions,
      correctAnswer: current.term,
    });
    setSelectedOption(null);
    setIsAnswered(false);
  }, [queue, terms]);

  const handleSelect = (option: string) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
      setStreak((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
      onUpdateTermStatus(currentQuestion.targetTerm.id, 'mastered');
    } else {
      sounds.playIncorrect();
      setStreak(0);
      onUpdateTermStatus(currentQuestion.targetTerm.id, 'learning');
    }
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    setQueue((prev) => {
      const rest = prev.slice(1);
      if (!isCorrect) {
        // Re-insert at position 3 for spaced repetition
        const insertIndex = Math.min(3, rest.length);
        const newQueue = [...rest];
        newQueue.splice(insertIndex, 0, currentQuestion.targetTerm);
        return newQueue;
      }
      return rest;
    });

    if (correctCount > 0 && correctCount % 5 === 0) {
      setStageProgress((prev) => Math.min(3, prev + 1));
    }
  };

  if (isFinished || !currentQuestion) {
    return (
      <section className="bg-surface-card rounded-2xl p-6 border border-border-tactile shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-primary-fixed text-primary mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl">psychology</span>
        </div>
        <div className="space-y-1">
          <h2 className="font-headline-lg text-2xl font-bold text-text-primary">
            Adaptive Learning Goal Reached!
          </h2>
          <p className="font-body-md text-sm text-text-secondary">
            You reinforced your understanding across your weakest bio terms.
          </p>
        </div>

        <div className="p-4 bg-surface-container rounded-xl flex justify-around">
          <div>
            <span className="text-xs text-text-secondary block font-bold">Total Correct</span>
            <span className="text-2xl font-tabular-stats font-bold text-primary">
              {correctCount}
            </span>
          </div>
          <div className="border-r border-slate-200" />
          <div>
            <span className="text-xs text-text-secondary block font-bold">Max Streak</span>
            <span className="text-2xl font-tabular-stats font-bold text-emerald-600">
              {streak}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              setQueue([...terms].sort(() => Math.random() - 0.5));
              setIsFinished(false);
            }}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
            Start New Round
          </button>
          <button
            onClick={onExit}
            className="w-full py-3 bg-surface-container text-text-primary font-bold rounded-xl hover:bg-surface-variant transition-all"
          >
            Back to Overview
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Header with Adaptive Stage & Streak */}
      <div className="flex items-center justify-between text-xs text-text-secondary font-label-md">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-primary font-bold hover:underline"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Overview
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold">
            Stage {stageProgress}
          </span>
          {streak > 1 && (
            <span className="flex items-center gap-0.5 text-warning-learning font-bold px-2 py-0.5 bg-orange-50 rounded-full border border-orange-200">
              <span className="material-symbols-outlined text-sm">local_fire_department</span>
              {streak} streak
            </span>
          )}
        </div>

        <span className="font-tabular-stats font-bold text-text-primary">
          {queue.length} remaining
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-surface-card rounded-2xl p-6 border border-border-tactile shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-surface-container text-primary">
            {currentQuestion.targetTerm.category}
          </span>
          <span className="text-xs text-text-secondary font-medium">Choose the matching term</span>
        </div>

        <div className="space-y-2">
          <p className="font-body-lg text-base sm:text-lg text-text-primary font-medium leading-relaxed">
            "{currentQuestion.targetTerm.definition}"
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isChosen = selectedOption === option;
            const isCorrectAnswer = option === currentQuestion.correctAnswer;

            let btnStyle =
              'border-border-tactile bg-white text-text-primary hover:bg-slate-50 hover:border-slate-400';

            if (isAnswered) {
              if (isCorrectAnswer) {
                btnStyle =
                  'border-success-known bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-300';
              } else if (isChosen && !isCorrectAnswer) {
                btnStyle =
                  'border-red-400 bg-red-50 text-red-900 font-bold ring-2 ring-red-300';
              } else {
                btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(option)}
                className={`w-full p-3.5 rounded-xl border text-left font-display text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{option}</span>
                {isAnswered && isCorrectAnswer && (
                  <span className="material-symbols-outlined text-success-known text-lg">
                    check_circle
                  </span>
                )}
                {isAnswered && isChosen && !isCorrectAnswer && (
                  <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Continue */}
        {isAnswered && (
          <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                selectedOption === currentQuestion.correctAnswer
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-sm">
                  {selectedOption === currentQuestion.correctAnswer ? 'check_circle' : 'info'}
                </span>
                {selectedOption === currentQuestion.correctAnswer
                  ? 'Nicely done!'
                  : `Correct term: ${currentQuestion.correctAnswer}`}
              </div>
              {currentQuestion.targetTerm.keyFact && (
                <p className="opacity-90">{currentQuestion.targetTerm.keyFact}</p>
              )}
            </div>

            <button
              id="learn-continue-btn"
              onClick={handleNext}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Continue</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
