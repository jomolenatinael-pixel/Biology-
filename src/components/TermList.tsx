import React, { useState, useMemo } from 'react';
import { TermItem, MasteryStatus } from '../types';
import { sounds } from '../utils/audio';

interface TermListProps {
  terms: TermItem[];
  activeFilter: MasteryStatus | 'all' | 'starred';
  onSelectFilter: (filter: MasteryStatus | 'all' | 'starred') => void;
  onUpdateTermStatus: (id: string, status: MasteryStatus) => void;
  onToggleStar: (id: string) => void;
  onAddTerm: (newTerm: Omit<TermItem, 'id'>) => void;
}

export const TermList: React.FC<TermListProps> = ({
  terms,
  activeFilter,
  onSelectFilter,
  onUpdateTermStatus,
  onToggleStar,
  onAddTerm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTermName, setNewTermName] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCategory, setNewCategory] = useState<TermItem['category']>('Cellular Respiration');
  const [newKeyFact, setNewKeyFact] = useState('');
  const [newMnemonic, setNewMnemonic] = useState('');

  const filteredTerms = useMemo(() => {
    return terms.filter((item) => {
      // Filter status
      if (activeFilter === 'starred' && !item.starred) return false;
      if (activeFilter !== 'all' && activeFilter !== 'starred' && item.status !== activeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.term.toLowerCase().includes(query) ||
          item.definition.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [terms, activeFilter, searchQuery]);

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermName.trim() || !newDefinition.trim()) return;

    onAddTerm({
      term: newTermName.trim(),
      definition: newDefinition.trim(),
      category: newCategory,
      status: 'unseen',
      keyFact: newKeyFact.trim() || undefined,
      mnemonic: newMnemonic.trim() || undefined,
      starred: false,
    });

    setNewTermName('');
    setNewDefinition('');
    setNewKeyFact('');
    setNewMnemonic('');
    setShowAddModal(false);
  };

  const getStatusBadge = (status: MasteryStatus) => {
    switch (status) {
      case 'mastered':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          label: 'Mastered',
          icon: 'check_circle',
        };
      case 'learning':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          label: 'Learning',
          icon: 'timelapse',
        };
      case 'unseen':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          label: 'Unseen',
          icon: 'radio_button_unchecked',
        };
    }
  };

  const cycleStatus = (id: string, current: MasteryStatus) => {
    const nextStatus: Record<MasteryStatus, MasteryStatus> = {
      unseen: 'learning',
      learning: 'mastered',
      mastered: 'unseen',
    };
    onUpdateTermStatus(id, nextStatus[current]);
  };

  return (
    <section className="space-y-4 pt-2">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-headline-sm text-[17px] font-bold text-text-primary">
            Terms in this Set
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container text-text-secondary">
            {filteredTerms.length}
          </span>
        </div>

        <button
          id="add-term-btn"
          onClick={() => setShowAddModal(true)}
          className="text-xs font-bold text-secondary bg-surface-container-low border border-secondary-fixed px-3 py-1.5 rounded-xl hover:bg-surface-container transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Term
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-lg">
          search
        </span>
        <input
          id="terms-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by term, definition, or topic..."
          className="w-full bg-surface-card border border-border-tactile rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-text-secondary hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'mastered', label: 'Mastered' },
          { id: 'learning', label: 'Learning' },
          { id: 'unseen', label: 'Unseen' },
          { id: 'starred', label: 'Starred' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeFilter === tab.id
                ? 'bg-secondary text-white border-secondary shadow-sm'
                : 'bg-surface-card text-text-secondary border-border-tactile hover:bg-surface-container'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Term Cards List */}
      <div className="space-y-3">
        {filteredTerms.length === 0 ? (
          <div className="p-8 text-center bg-surface-card rounded-2xl border border-border-tactile text-text-secondary text-sm space-y-2">
            <span className="material-symbols-outlined text-3xl opacity-60">search_off</span>
            <p>No terms found matching your filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectFilter('all');
              }}
              className="text-xs font-bold text-secondary underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTerms.map((term) => {
            const badge = getStatusBadge(term.status);
            return (
              <div
                key={term.id}
                className="bg-surface-card rounded-2xl p-4 border border-border-tactile shadow-sm hover:shadow-md transition-all space-y-2.5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                      {term.category}
                    </span>
                    <h3 className="font-display text-base font-bold text-text-primary">
                      {term.term}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Status badge that cycles on click */}
                    <button
                      onClick={() => cycleStatus(term.id, term.status)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-transform active:scale-95 ${badge.bg}`}
                      title="Click to cycle status"
                    >
                      <span className="material-symbols-outlined text-xs">{badge.icon}</span>
                      {badge.label}
                    </button>

                    {/* Audio pronunciation */}
                    <button
                      aria-label="Speak pronunciation"
                      onClick={() => sounds.speak(term.term)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-secondary transition-colors"
                      title="Pronounce term"
                    >
                      <span className="material-symbols-outlined text-base">volume_up</span>
                    </button>

                    {/* Star */}
                    <button
                      aria-label="Star term"
                      onClick={() => onToggleStar(term.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        term.starred
                          ? 'text-warning-learning'
                          : 'text-text-secondary hover:text-warning-learning'
                      }`}
                      title={term.starred ? 'Starred' : 'Star term'}
                    >
                      <span
                        className="material-symbols-outlined text-base"
                        style={{ fontVariationSettings: term.starred ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    </button>
                  </div>
                </div>

                {/* Definition */}
                <p className="font-body-md text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {term.definition}
                </p>

                {/* Context or mnemonic */}
                {term.keyFact && (
                  <div className="p-2 bg-surface-container/50 rounded-lg text-[11px] text-text-primary border border-secondary-fixed/50">
                    <span className="font-bold text-secondary">Fact: </span>
                    {term.keyFact}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Term Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border-tactile p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-headline-sm text-base font-bold text-text-primary">
                Add New Term to Deck
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTerm} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-text-primary block mb-1">
                  Biological Term *
                </label>
                <input
                  type="text"
                  required
                  value={newTermName}
                  onChange={(e) => setNewTermName(e.target.value)}
                  placeholder="e.g. Cristae, Cytochrome c"
                  className="w-full bg-surface-container/40 border border-border-tactile rounded-xl px-3 py-2 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-primary block mb-1">
                  Definition *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  placeholder="Detailed functional and structural definition..."
                  className="w-full bg-surface-container/40 border border-border-tactile rounded-xl px-3 py-2 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-surface-container/40 border border-border-tactile rounded-xl px-2.5 py-2 text-xs text-text-primary focus:outline-none focus:border-secondary"
                  >
                    <option value="Cellular Respiration">Cellular Respiration</option>
                    <option value="Cell Structures">Cell Structures</option>
                    <option value="Membrane Transport">Membrane Transport</option>
                    <option value="Energy & Photosynthesis">Energy & Photosynthesis</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1">
                    Mnemonic (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMnemonic}
                    onChange={(e) => setNewMnemonic(e.target.value)}
                    placeholder="Memory trick"
                    className="w-full bg-surface-container/40 border border-border-tactile rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-primary block mb-1">
                  Key Bio Fact (Optional)
                </label>
                <input
                  type="text"
                  value={newKeyFact}
                  onChange={(e) => setNewKeyFact(e.target.value)}
                  placeholder="e.g. Yields ~2.5 ATP per NADH"
                  className="w-full bg-surface-container/40 border border-border-tactile rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 shadow-md text-xs"
                >
                  Save Term
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-surface-container text-text-primary font-bold rounded-xl text-xs hover:bg-surface-variant"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
