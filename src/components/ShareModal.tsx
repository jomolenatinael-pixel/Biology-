import React, { useState } from 'react';
import { TermItem } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: TermItem[];
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, terms }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(terms, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'cell_biology_respiration_terms.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-border-tactile p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">ios_share</span>
            <h3 className="font-headline-sm text-base font-bold text-text-primary">
              Share Study Set
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-text-secondary">
            Share this Harvard Bio 101 deck on <strong>Cell Biology & Cellular Respiration</strong> with classmates or export for offline study.
          </p>

          <div className="flex items-center gap-2 bg-surface-container p-2 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? window.location.href : 'https://biology101.study'}
              className="flex-1 bg-transparent text-xs text-text-primary font-mono outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/90 shrink-0 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 bg-surface-container text-text-primary text-xs font-bold rounded-xl hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export Deck as JSON ({terms.length} terms)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
