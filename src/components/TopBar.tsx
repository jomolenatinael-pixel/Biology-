import React, { useState } from 'react';
import { StudyMode } from '../types';

interface TopBarProps {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenShare: () => void;
  onResetProgress: () => void;
  onShuffleTerms: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentMode,
  onSelectMode,
  isBookmarked,
  onToggleBookmark,
  onOpenShare,
  onResetProgress,
  onShuffleTerms,
  soundEnabled,
  onToggleSound,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-surface-bg/95 backdrop-blur-md border-b border-border-tactile flex justify-between items-center w-full px-4 h-14 max-w-md mx-auto transition-colors">
      <button
        id="topbar-back-btn"
        aria-label="Go Back"
        onClick={() => onSelectMode('overview')}
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-text-primary hover:bg-surface-container transition-all active:scale-95 ${
          currentMode !== 'overview' ? 'text-primary font-bold' : 'opacity-80'
        }`}
        title={currentMode !== 'overview' ? 'Back to Overview' : 'Deck Overview'}
      >
        <span className="material-symbols-outlined text-primary text-2xl" data-icon="arrow_back">
          {currentMode === 'overview' ? 'school' : 'arrow_back'}
        </span>
      </button>

      <div className="text-center font-display font-bold text-sm text-text-primary truncate max-w-[180px]">
        {currentMode === 'overview' && 'Cell Biology 101'}
        {currentMode === 'flashcards' && 'Flashcards'}
        {currentMode === 'learn' && 'Adaptive Learn'}
        {currentMode === 'test' && 'Practice Test'}
        {currentMode === 'match' && 'Match Game'}
        {currentMode === 'qchat' && 'AI Tutor (Q-Chat)'}
      </div>

      <div className="flex items-center gap-1 relative">
        <button
          id="topbar-bookmark-btn"
          aria-label="Bookmark Set"
          onClick={onToggleBookmark}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            isBookmarked
              ? 'text-secondary bg-surface-container'
              : 'text-text-secondary hover:bg-surface-container hover:text-secondary'
          }`}
          title={isBookmarked ? 'Bookmarked' : 'Bookmark set'}
        >
          <span
            className="material-symbols-outlined text-xl transition-transform"
            data-icon="bookmark"
            style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
          >
            bookmark
          </span>
        </button>

        <button
          id="topbar-share-btn"
          aria-label="Share"
          onClick={onOpenShare}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-secondary transition-colors active:scale-95"
          title="Share deck"
        >
          <span className="material-symbols-outlined text-xl" data-icon="ios_share">
            ios_share
          </span>
        </button>

        <div className="relative">
          <button
            id="topbar-more-btn"
            aria-label="More Options"
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-secondary transition-colors active:scale-95"
            title="More Options"
          >
            <span className="material-symbols-outlined text-xl" data-icon="more_vert">
              more_vert
            </span>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-border-tactile py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  id="menu-shuffle-btn"
                  onClick={() => {
                    onShuffleTerms();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface-container flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary text-lg">shuffle</span>
                  Shuffle Deck
                </button>
                <button
                  id="menu-sound-btn"
                  onClick={() => {
                    onToggleSound();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface-container flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary text-lg">
                    {soundEnabled ? 'volume_up' : 'volume_off'}
                  </span>
                  Sound Effects: {soundEnabled ? 'On' : 'Off'}
                </button>
                <button
                  id="menu-reset-btn"
                  onClick={() => {
                    onResetProgress();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-amber-700 hover:bg-orange-50 flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-warning-learning text-lg">restart_alt</span>
                  Reset Study Progress
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
