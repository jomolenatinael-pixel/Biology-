import React, { useState, useEffect, useRef } from 'react';
import { TermItem } from '../types';
import { sounds } from '../utils/audio';

interface MatchModeProps {
  terms: TermItem[];
  bestTime: number | null;
  onUpdateBestTime: (timeMs: number) => void;
  onExit: () => void;
}

interface Tile {
  id: string;
  termId: string;
  kind: 'term' | 'definition';
  text: string;
  isMatched: boolean;
}

export const MatchMode: React.FC<MatchModeProps> = ({
  terms,
  bestTime,
  onUpdateBestTime,
  onExit,
}) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mismatchedIds, setMismatchedIds] = useState<string[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startNewGame = () => {
    // Pick 6 random terms
    const selectedTerms = [...terms].sort(() => Math.random() - 0.5).slice(0, 6);

    const generated: Tile[] = [];
    selectedTerms.forEach((t) => {
      generated.push({
        id: `term-${t.id}`,
        termId: t.id,
        kind: 'term',
        text: t.term,
        isMatched: false,
      });
      generated.push({
        id: `def-${t.id}`,
        termId: t.id,
        kind: 'definition',
        text: t.definition,
        isMatched: false,
      });
    });

    // Shuffle tiles
    setTiles(generated.sort(() => Math.random() - 0.5));
    setSelectedId(null);
    setMismatchedIds([]);
    setElapsedMs(0);
    setIsWon(false);
    setIsPlaying(true);

    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
  };

  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [terms]);

  const handleTileClick = (clickedTile: Tile) => {
    if (!isPlaying || clickedTile.isMatched || mismatchedIds.length > 0) return;

    if (!selectedId) {
      sounds.playFlip();
      setSelectedId(clickedTile.id);
      return;
    }

    if (selectedId === clickedTile.id) {
      setSelectedId(null);
      return;
    }

    const firstTile = tiles.find((t) => t.id === selectedId);
    if (!firstTile) return;

    // Check if matching pair (same termId and different kind)
    if (firstTile.termId === clickedTile.termId && firstTile.kind !== clickedTile.kind) {
      // MATCH!
      sounds.playCorrect();
      setTiles((prev) =>
        prev.map((t) =>
          t.id === firstTile.id || t.id === clickedTile.id ? { ...t, isMatched: true } : t
        )
      );
      setSelectedId(null);

      // Check if won
      const remainingUnmatched = tiles.filter(
        (t) => !t.isMatched && t.id !== firstTile.id && t.id !== clickedTile.id
      ).length;

      if (remainingUnmatched === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        const finalTime = Date.now() - startTimeRef.current;
        setElapsedMs(finalTime);
        setIsPlaying(false);
        setIsWon(true);
        onUpdateBestTime(finalTime);
      }
    } else {
      // MISMATCH
      sounds.playIncorrect();
      setMismatchedIds([firstTile.id, clickedTile.id]);
      setTimeout(() => {
        setMismatchedIds([]);
        setSelectedId(null);
      }, 500);
    }
  };

  const formatTimer = (ms: number) => {
    const totalSeconds = (ms / 1000).toFixed(1);
    return `${totalSeconds}s`;
  };

  return (
    <section className="space-y-4">
      {/* Header with Timer and Best Record */}
      <div className="flex items-center justify-between text-xs text-text-secondary font-label-md">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-warning-learning font-bold hover:underline"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Overview
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-card px-3 py-1.5 rounded-xl border border-border-tactile shadow-sm">
            <span className="material-symbols-outlined text-warning-learning text-base">timer</span>
            <span className="font-tabular-stats font-extrabold text-text-primary text-sm">
              {formatTimer(elapsedMs)}
            </span>
          </div>
          {bestTime && (
            <span className="text-[11px] text-text-secondary">
              Record: <strong className="text-text-primary">{formatTimer(bestTime)}</strong>
            </span>
          )}
        </div>
      </div>

      {isWon ? (
        <div className="bg-surface-card rounded-2xl p-6 border border-border-tactile shadow-lg text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-warning-learning mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">emoji_events</span>
          </div>
          <div className="space-y-1">
            <h2 className="font-headline-lg text-2xl font-bold text-text-primary">
              All Matched!
            </h2>
            <p className="font-body-md text-sm text-text-secondary">
              You cleared all biological pairs in{' '}
              <strong className="text-warning-learning font-bold">{formatTimer(elapsedMs)}</strong>
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={startNewGame}
              className="w-full py-3.5 bg-warning-learning text-white font-bold rounded-xl shadow-md hover:bg-warning-learning/90 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">play_arrow</span>
              Play Again (New Terms)
            </button>
            <button
              onClick={onExit}
              className="w-full py-3 bg-surface-container text-text-primary font-bold rounded-xl hover:bg-surface-variant transition-all"
            >
              Back to Overview
            </button>
          </div>
        </div>
      ) : (
        /* Match Grid */
        <div className="grid grid-cols-2 gap-2.5">
          {tiles.map((tile) => {
            if (tile.isMatched) {
              return (
                <div
                  key={tile.id}
                  className="h-28 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 flex items-center justify-center opacity-40 select-none"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-2xl">
                    check
                  </span>
                </div>
              );
            }

            const isSelected = selectedId === tile.id;
            const isMismatched = mismatchedIds.includes(tile.id);

            let tileStyle =
              'bg-surface-card border-border-tactile text-text-primary shadow-sm hover:border-slate-400 hover:-translate-y-0.5 active:translate-y-0.5';

            if (isSelected) {
              tileStyle =
                'bg-blue-50 border-secondary ring-2 ring-secondary text-primary font-bold scale-[0.98]';
            } else if (isMismatched) {
              tileStyle =
                'bg-red-50 border-red-500 ring-2 ring-red-400 text-red-900 animate-shake';
            }

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`h-28 p-3 rounded-xl border-2 text-left flex flex-col justify-center overflow-hidden transition-all duration-150 select-none ${tileStyle}`}
              >
                {tile.kind === 'term' ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                      Term
                    </span>
                    <span className="font-display font-bold text-sm sm:text-base leading-snug line-clamp-3">
                      {tile.text}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Definition
                    </span>
                    <span className="font-body-sm text-xs leading-relaxed line-clamp-4 text-text-primary">
                      {tile.text}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
