import React, { useState, useEffect } from 'react';
import { TermItem } from '../types';
import { sounds } from '../utils/audio';

interface FlashcardsModeProps {
  terms: TermItem[];
  onUpdateTermStatus: (id: string, status: TermItem['status']) => void;
  onToggleStar: (id: string) => void;
  onExit: () => void;
}

export const FlashcardsMode: React.FC<FlashcardsModeProps> = ({
  terms,
  onUpdateTermStatus,
  onToggleStar,
  onExit,
}) => {
  const [deck, setDeck] = useState<TermItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ mastered: number; learning: number }>({
    mastered: 0,
    learning: 0,
  });

  useEffect(() => {
    setDeck([...terms]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, [terms]);

  const currentTerm = deck[currentIndex];

  const handleFlip = () => {
    sounds.playFlip();
    setIsFlipped((prev) => !prev);
  };

  const handleNext = (mastered: boolean) => {
    if (!currentTerm) return;

    if (mastered) {
      sounds.playCorrect();
      onUpdateTermStatus(currentTerm.id, 'mastered');
      setSessionResults((prev) => ({ ...prev, mastered: prev.mastered + 1 }));
    } else {
      sounds.playIncorrect();
      onUpdateTermStatus(currentTerm.id, 'learning');
      setSessionResults((prev) => ({ ...prev, learning: prev.learning + 1 }));
    }

    if (currentIndex + 1 < deck.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleNext(false);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext(true);
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isCompleted, currentTerm]);

  const handleShuffle = () => {
    sounds.playFlip();
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setSessionResults({ mastered: 0, learning: 0 });
  };

  if (!currentTerm && !isCompleted) {
    return (
      <div className="bg-surface-card rounded-2xl p-6 text-center space-y-4 border border-border-tactile">
        <p className="text-text-secondary">No cards available in this set.</p>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-primary text-white font-bold rounded-xl"
        >
          Return to Deck
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <section className="bg-surface-card rounded-2xl p-6 border border-border-tactile shadow-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-success-known mx-auto flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-4xl">military_tech</span>
        </div>
        <div className="space-y-1">
          <h2 className="font-headline-lg text-2xl font-bold text-text-primary">
            Session Complete!
          </h2>
          <p className="font-body-md text-sm text-text-secondary">
            You reviewed all {deck.length} terms in this flashcard session.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-xs text-emerald-800 font-bold block uppercase tracking-wider">
              Known
            </span>
            <span className="text-2xl font-tabular-stats font-bold text-emerald-900">
              {sessionResults.mastered}
            </span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-xs text-amber-800 font-bold block uppercase tracking-wider">
              Learning
            </span>
            <span className="text-2xl font-tabular-stats font-bold text-amber-900">
              {sessionResults.learning}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            id="flashcards-restart-btn"
            onClick={handleRestart}
            className="w-full py-3 bg-secondary text-white font-label-lg font-bold rounded-xl shadow-md hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">replay</span>
            Study Again
          </button>
          <button
            id="flashcards-exit-btn"
            onClick={onExit}
            className="w-full py-3 bg-surface-container text-text-primary font-label-lg font-bold rounded-xl hover:bg-surface-variant transition-all"
          >
            Back to Overview
          </button>
        </div>
      </section>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <section className="space-y-4">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between text-xs text-text-secondary font-label-md">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-secondary font-bold hover:underline"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Overview
        </button>
        <span className="font-tabular-stats font-bold text-text-primary">
          {currentIndex + 1} / {deck.length}
        </span>
        <button
          onClick={handleShuffle}
          className="p-1 hover:text-primary transition-colors flex items-center gap-1"
          title="Shuffle cards"
        >
          <span className="material-symbols-outlined text-base">shuffle</span>
          Shuffle
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Tactile Card */}
      <div
        id="flashcard-element"
        onClick={handleFlip}
        className="w-full h-80 cursor-pointer perspective-1000 select-none group"
      >
        <div
          className={`w-full h-full relative duration-500 transform-style-3d rounded-2xl shadow-[0_8px_24px_-4px_rgba(46,56,86,0.12)] border border-border-tactile transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 w-full h-full bg-surface-card rounded-2xl p-6 flex flex-col justify-between backface-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-surface-container text-secondary">
                {currentTerm.category}
              </span>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  aria-label="Speak pronunciation"
                  onClick={() => sounds.speak(currentTerm.term)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-secondary transition-colors"
                  title="Pronounce term"
                >
                  <span className="material-symbols-outlined text-lg">volume_up</span>
                </button>
                <button
                  aria-label="Star term"
                  onClick={() => onToggleStar(currentTerm.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    currentTerm.starred
                      ? 'text-warning-learning'
                      : 'text-text-secondary hover:text-warning-learning'
                  }`}
                  title={currentTerm.starred ? 'Unstar' : 'Star term'}
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: currentTerm.starred ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              </div>
            </div>

            <div className="text-center my-auto space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                {currentTerm.term}
              </h2>
              <p className="text-xs text-text-secondary font-medium flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">touch_app</span>
                Tap or press Space to flip
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-text-secondary border-t border-slate-100 pt-3">
              <span className="capitalize font-medium">Status: {currentTerm.status}</span>
              <span className="text-secondary font-bold flex items-center gap-0.5">
                Flip Definition
                <span className="material-symbols-outlined text-xs">sync</span>
              </span>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-white to-[#F8FAFF] rounded-2xl p-6 flex flex-col justify-between backface-hidden rotate-y-180 border-t-4 border-t-secondary">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-secondary">{currentTerm.term}</span>
              <button
                aria-label="Speak definition"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.speak(currentTerm.definition);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-secondary transition-colors"
                title="Read definition aloud"
              >
                <span className="material-symbols-outlined text-lg">volume_up</span>
              </button>
            </div>

            <div className="my-auto space-y-3 overflow-y-auto no-scrollbar max-h-48 pr-1">
              <p className="font-body-md text-sm sm:text-base text-text-primary leading-relaxed">
                {currentTerm.definition}
              </p>

              {currentTerm.keyFact && (
                <div className="p-2.5 rounded-xl bg-surface-container/60 border border-secondary-fixed text-xs text-primary font-medium">
                  <span className="font-bold block mb-0.5 text-secondary">Key Bio Fact:</span>
                  {currentTerm.keyFact}
                </div>
              )}

              {currentTerm.mnemonic && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Mnemonic: </span>
                  {currentTerm.mnemonic}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-text-secondary border-t border-slate-100 pt-3">
              <span>Tap to flip back</span>
              <span className="text-secondary font-bold">Tap front to review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tactile Response Controls */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          id="btn-still-learning"
          onClick={() => handleNext(false)}
          className="h-14 bg-surface-card hover:bg-orange-50/50 border-2 border-warning-learning/40 border-b-4 border-b-warning-learning text-warning-learning-variant font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm active:translate-y-0.5 active:border-b-2 transition-all"
        >
          <span className="material-symbols-outlined text-xl">close</span>
          <span>Still Learning</span>
          <span className="text-[10px] opacity-60 hidden sm:inline">(←)</span>
        </button>

        <button
          id="btn-know"
          onClick={() => handleNext(true)}
          className="h-14 bg-surface-card hover:bg-emerald-50/50 border-2 border-success-known/40 border-b-4 border-b-success-known text-success-known font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm active:translate-y-0.5 active:border-b-2 transition-all"
        >
          <span className="material-symbols-outlined text-xl">check</span>
          <span>Know</span>
          <span className="text-[10px] opacity-60 hidden sm:inline">(→)</span>
        </button>
      </div>

      <div className="text-center">
        <p className="text-[11px] text-text-secondary">
          Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-mono">Space</kbd> to flip, <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-mono">←</kbd> for Learning, <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 font-mono">→</kbd> for Know.
        </p>
      </div>
    </section>
  );
};
