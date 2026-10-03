import React, { useState, useEffect } from 'react';
import { TermItem, StudyMode, MasteryStatus } from './types';
import { INITIAL_TERMS } from './data/terms';
import { TopBar } from './components/TopBar';
import { MasteryOverview } from './components/MasteryOverview';
import { StudyModeCarousel } from './components/StudyModeCarousel';
import { FlashcardsMode } from './components/FlashcardsMode';
import { LearnMode } from './components/LearnMode';
import { TestMode } from './components/TestMode';
import { MatchMode } from './components/MatchMode';
import { QChatMode } from './components/QChatMode';
import { TermList } from './components/TermList';
import { ShareModal } from './components/ShareModal';
import { sounds } from './utils/audio';

const STORAGE_KEY_TERMS = 'bio101_deck_terms_v1';
const STORAGE_KEY_BEST_TIME = 'bio101_match_best_time';
const STORAGE_KEY_BOOKMARKED = 'bio101_is_bookmarked';

export default function App() {
  const [terms, setTerms] = useState<TermItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_TERMS);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fall back to initial
      }
    }
    return INITIAL_TERMS;
  });

  const [currentMode, setCurrentMode] = useState<StudyMode>('overview');
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | 'all' | 'starred'>('all');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_BOOKMARKED) === 'true';
    }
    return false;
  });
  const [bestMatchTime, setBestMatchTime] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_BEST_TIME);
      if (saved) return parseInt(saved, 10);
    }
    return 24200; // 0:24.2 default from mockup
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync terms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TERMS, JSON.stringify(terms));
    } catch {
      // Ignore
    }
  }, [terms]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleBookmark = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    localStorage.setItem(STORAGE_KEY_BOOKMARKED, String(next));
    showToast(next ? 'Deck saved to your bookmarks' : 'Deck removed from bookmarks');
  };

  const handleUpdateTermStatus = (id: string, status: MasteryStatus) => {
    setTerms((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const handleToggleStar = (id: string) => {
    setTerms((prev) =>
      prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t))
    );
  };

  const handleAddTerm = (newTermData: Omit<TermItem, 'id'>) => {
    const newTerm: TermItem = {
      ...newTermData,
      id: `term-custom-${Date.now()}`,
    };
    setTerms((prev) => [newTerm, ...prev]);
    showToast(`Added "${newTerm.term}" to deck!`);
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all term masteries back to the default state?')) {
      setTerms(INITIAL_TERMS);
      showToast('Study progress reset to default.');
    }
  };

  const handleShuffleTerms = () => {
    setTerms((prev) => [...prev].sort(() => Math.random() - 0.5));
    showToast('Deck terms shuffled!');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    showToast(`Sound FX ${next ? 'enabled' : 'muted'}`);
  };

  const handleUpdateBestTime = (timeMs: number) => {
    if (!bestMatchTime || timeMs < bestMatchTime) {
      setBestMatchTime(timeMs);
      localStorage.setItem(STORAGE_KEY_BEST_TIME, String(timeMs));
      showToast(`New personal record: ${(timeMs / 1000).toFixed(1)}s!`);
    }
  };

  // Counts
  const masteredCount = terms.filter((t) => t.status === 'mastered').length;
  const learningCount = terms.filter((t) => t.status === 'learning').length;
  const unseenCount = terms.filter((t) => t.status === 'unseen').length;
  const totalCount = terms.length;

  return (
    <div className="bg-surface-bg text-text-primary antialiased font-body-md min-h-screen flex flex-col justify-between selection:bg-surface-variant">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="material-symbols-outlined text-sm text-emerald-400">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container constrained to Mobile Viewport */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-surface-bg flex flex-col pb-28 relative">
        {/* Top Navigation Bar */}
        <TopBar
          currentMode={currentMode}
          onSelectMode={setCurrentMode}
          isBookmarked={isBookmarked}
          onToggleBookmark={handleToggleBookmark}
          onOpenShare={() => setIsShareOpen(true)}
          onResetProgress={handleResetProgress}
          onShuffleTerms={handleShuffleTerms}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />

        {/* Content Area */}
        <main className="flex-1 px-4 pt-4 space-y-5">
          {currentMode === 'overview' && (
            <>
              {/* Header Section: Deck Meta & Attribution */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-surface-container-low text-secondary font-label-md text-xs px-2.5 py-0.5 rounded-full border border-secondary-fixed font-bold">
                    Biology 101
                  </span>
                  <span className="bg-surface-container text-text-secondary font-label-md text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {totalCount} Terms
                  </span>
                </div>

                <h1 className="text-2xl sm:text-[26px] font-headline-lg font-bold text-text-primary tracking-tight leading-tight">
                  Cell Biology & Cellular Respiration
                </h1>

                <div className="flex items-center justify-between pt-1">
                  {/* Creator Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm ring-2 ring-surface-card shadow-sm">
                      EV
                      <div className="absolute -bottom-0.5 -right-0.5 bg-secondary text-white rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                        <span
                          className="material-symbols-outlined text-[10px]"
                          data-icon="verified"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-label-md text-xs font-bold text-text-primary">
                        Dr. Elena Vance
                      </div>
                      <p className="text-xs text-text-secondary">Harvard Bio 101</p>
                    </div>
                  </div>

                  {/* Social Stats / Rating */}
                  <div className="flex items-center gap-2.5 bg-surface-card px-3 py-1.5 rounded-xl border border-border-tactile shadow-sm">
                    <div className="flex items-center gap-1 text-warning-learning font-tabular-stats text-xs font-bold">
                      <span
                        className="material-symbols-outlined text-sm"
                        data-icon="star"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-text-primary">4.9</span>
                    </div>
                    <span className="text-outline-variant font-light text-xs">|</span>
                    <div className="flex items-center gap-1 text-text-secondary font-label-md text-xs font-semibold">
                      <span className="material-symbols-outlined text-sm" data-icon="group">
                        group
                      </span>
                      <span>12.8k</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Mastery Overview Widget */}
              <MasteryOverview
                masteredCount={masteredCount}
                learningCount={learningCount}
                unseenCount={unseenCount}
                totalCount={totalCount}
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
                onStudyWeakest={() => {
                  setActiveFilter('learning');
                  setCurrentMode('flashcards');
                }}
              />

              {/* Study Modes Carousel */}
              <StudyModeCarousel
                onSelectMode={setCurrentMode}
                bestMatchTime={bestMatchTime}
                totalTerms={totalCount}
              />

              {/* Terms in this Set */}
              <TermList
                terms={terms}
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
                onUpdateTermStatus={handleUpdateTermStatus}
                onToggleStar={handleToggleStar}
                onAddTerm={handleAddTerm}
              />
            </>
          )}

          {currentMode === 'flashcards' && (
            <FlashcardsMode
              terms={
                activeFilter === 'starred'
                  ? terms.filter((t) => t.starred)
                  : activeFilter === 'learning'
                  ? terms.filter((t) => t.status === 'learning')
                  : terms
              }
              onUpdateTermStatus={handleUpdateTermStatus}
              onToggleStar={handleToggleStar}
              onExit={() => setCurrentMode('overview')}
            />
          )}

          {currentMode === 'learn' && (
            <LearnMode
              terms={terms}
              onUpdateTermStatus={handleUpdateTermStatus}
              onExit={() => setCurrentMode('overview')}
            />
          )}

          {currentMode === 'test' && (
            <TestMode
              terms={terms}
              onExit={() => setCurrentMode('overview')}
            />
          )}

          {currentMode === 'match' && (
            <MatchMode
              terms={terms}
              bestTime={bestMatchTime}
              onUpdateBestTime={handleUpdateBestTime}
              onExit={() => setCurrentMode('overview')}
            />
          )}

          {currentMode === 'qchat' && (
            <QChatMode
              terms={terms}
              onExit={() => setCurrentMode('overview')}
            />
          )}
        </main>

        {/* Floating Quick Study Action Bar (Sticky at bottom on mobile) */}
        {currentMode === 'overview' && (
          <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-surface-bg/95 backdrop-blur-md border-t border-border-tactile">
            <div className="max-w-md mx-auto flex items-center gap-2">
              <button
                id="floating-flashcards-btn"
                onClick={() => setCurrentMode('flashcards')}
                className="flex-1 h-12 bg-secondary text-white font-label-lg text-sm font-bold rounded-xl shadow-[0_4px_16px_rgba(31,52,230,0.3)] hover:bg-secondary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">style</span>
                <span>Study Flashcards</span>
              </button>

              <button
                id="floating-learn-btn"
                onClick={() => setCurrentMode('learn')}
                className="w-12 h-12 bg-surface-card border border-border-tactile text-primary rounded-xl flex items-center justify-center hover:bg-surface-container active:scale-95 shadow-sm transition-all"
                title="Adaptive Learn"
              >
                <span className="material-symbols-outlined text-xl">psychology</span>
              </button>

              <button
                id="floating-qchat-btn"
                onClick={() => setCurrentMode('qchat')}
                className="w-12 h-12 bg-gradient-to-tr from-secondary to-tertiary-fixed text-white rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 shadow-sm transition-all"
                title="Q-Chat AI Tutor"
              >
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        terms={terms}
      />
    </div>
  );
}
