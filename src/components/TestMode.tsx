import React, { useState, useEffect } from 'react';
import { TermItem } from '../types';
import { sounds } from '../utils/audio';

interface TestModeProps {
  terms: TermItem[];
  onExit: () => void;
}

interface TestItem {
  id: string;
  type: 'multiple-choice' | 'true-false';
  prompt: string;
  correctAnswer: string;
  options?: string[];
  explanation: string;
  userAnswer?: string;
}

export const TestMode: React.FC<TestModeProps> = ({ terms, onExit }) => {
  const [questionCount, setQuestionCount] = useState(10);
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<TestItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generate test questions
  const generateTest = (count: number) => {
    const pool = [...terms].sort(() => Math.random() - 0.5).slice(0, count);

    const generated: TestItem[] = pool.map((item, index) => {
      // 70% multiple choice, 30% true/false
      const isTrueFalse = index % 3 === 2;

      if (isTrueFalse) {
        const isTrueStatement = Math.random() > 0.4;
        let statement = '';
        let correctAns = '';

        if (isTrueStatement) {
          statement = `True or False: "${item.term}" is defined as: ${item.definition}`;
          correctAns = 'True';
        } else {
          // False statement: swap definition with a different term
          const other = terms.find((t) => t.id !== item.id) || terms[0];
          statement = `True or False: "${item.term}" is defined as: ${other.definition}`;
          correctAns = 'False';
        }

        return {
          id: `q-${index}`,
          type: 'true-false',
          prompt: statement,
          options: ['True', 'False'],
          correctAnswer: correctAns,
          explanation: `"${item.term}": ${item.definition}`,
        };
      } else {
        const others = terms.filter((t) => t.id !== item.id).sort(() => Math.random() - 0.5);
        const distractors = others.slice(0, 3).map((t) => t.term);
        const options = [...distractors, item.term].sort(() => Math.random() - 0.5);

        return {
          id: `q-${index}`,
          type: 'multiple-choice',
          prompt: `Which term corresponds to: "${item.definition}"?`,
          options,
          correctAnswer: item.term,
          explanation: `The correct term is ${item.term}. ${item.keyFact || ''}`,
        };
      }
    });

    setQuestions(generated);
    setAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setTestStarted(true);
  };

  const handleSelectAnswer = (ans: string) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: ans }));
  };

  const handleSubmit = () => {
    sounds.playCorrect();
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    return correct;
  };

  if (!testStarted) {
    return (
      <section className="bg-surface-card rounded-2xl p-6 border border-border-tactile shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] space-y-6">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined text-2xl">quiz</span>
          <h2 className="font-headline-sm text-lg font-bold text-text-primary">
            Cell Biology Practice Exam
          </h2>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          Test your diagnostic knowledge with randomized multiple-choice and conceptual true/false questions generated from this study set.
        </p>

        <div className="space-y-3">
          <label className="text-xs font-bold text-text-primary block">
            Select Number of Questions:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 20].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                  questionCount === num
                    ? 'bg-secondary text-white border-secondary shadow-sm'
                    : 'bg-surface-container/60 text-text-primary border-border-tactile hover:bg-surface-container'
                }`}
              >
                {num} Questions
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            id="start-test-btn"
            onClick={() => generateTest(Math.min(questionCount, terms.length))}
            className="flex-1 py-3.5 bg-secondary text-white font-bold rounded-xl shadow-md hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            Start Assessment
          </button>
          <button
            onClick={onExit}
            className="px-5 py-3.5 bg-surface-container text-text-primary font-bold rounded-xl hover:bg-surface-variant transition-all"
          >
            Cancel
          </button>
        </div>
      </section>
    );
  }

  if (isSubmitted) {
    const score = calculateScore();
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;

    return (
      <section className="bg-surface-card rounded-2xl p-6 border border-border-tactile shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              passed ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
            }`}
          >
            <span className="material-symbols-outlined text-4xl">
              {passed ? 'verified' : 'priority_high'}
            </span>
          </div>
          <h2 className="font-headline-lg text-2xl font-bold text-text-primary">
            Exam Complete!
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            <span className="text-3xl font-tabular-stats font-extrabold text-primary">{pct}%</span>
            <span className="text-text-secondary">
              ({score} of {questions.length} correct)
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-sm text-text-primary">Review Answers</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
            {questions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correctAnswer;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    isCorrect
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-red-50/60 border-red-200 text-red-950'
                  }`}
                >
                  <div className="flex items-start justify-between font-bold gap-2">
                    <span>
                      {idx + 1}. {q.prompt}
                    </span>
                    <span className="shrink-0 material-symbols-outlined text-base">
                      {isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Your answer: </span>
                    <span className={isCorrect ? 'font-bold' : 'line-through text-red-700'}>
                      {answers[idx] || 'Unanswered'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div>
                      <span className="font-semibold text-emerald-800">Correct: </span>
                      <span className="font-bold text-emerald-900">{q.correctAnswer}</span>
                    </div>
                  )}
                  <p className="opacity-80 text-[11px] pt-1 border-t border-slate-200/60">
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => generateTest(questionCount)}
            className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Retake Exam
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

  const currentQ = questions[currentIdx];
  const progressPct = Math.round(((currentIdx + 1) / questions.length) * 100);

  return (
    <section className="space-y-4">
      {/* Top Meta */}
      <div className="flex items-center justify-between text-xs text-text-secondary font-label-md">
        <button
          onClick={() => setTestStarted(false)}
          className="flex items-center gap-1 text-secondary font-bold hover:underline"
        >
          <span className="material-symbols-outlined text-sm">close</span>
          Exit Test
        </button>
        <span className="font-tabular-stats font-bold text-text-primary">
          Question {currentIdx + 1} of {questions.length}
        </span>
        <span className="text-secondary font-bold">
          {Object.keys(answers).length} answered
        </span>
      </div>

      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-surface-card rounded-2xl p-6 border border-border-tactile shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-surface-container text-secondary">
            {currentQ.type === 'true-false' ? 'True / False' : 'Multiple Choice'}
          </span>
        </div>

        <p className="font-headline-sm text-base sm:text-lg font-bold text-text-primary leading-relaxed">
          {currentQ.prompt}
        </p>

        <div className="space-y-2.5 pt-2">
          {currentQ.options?.map((option, idx) => {
            const isSelected = answers[currentIdx] === option;
            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(option)}
                className={`w-full p-3.5 rounded-xl border text-left font-display text-sm font-semibold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-secondary bg-surface-container text-secondary ring-2 ring-secondary/30'
                    : 'border-border-tactile bg-white text-text-primary hover:bg-slate-50'
                }`}
              >
                <span>{option}</span>
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                    isSelected
                      ? 'border-secondary bg-secondary text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {isSelected ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation & Submit */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
          className="px-4 py-2.5 bg-surface-container rounded-xl text-xs font-bold text-text-primary disabled:opacity-40"
        >
          Previous
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((p) => p + 1)}
            className="px-5 py-2.5 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary/90 shadow-sm"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">send</span>
            Submit Test
          </button>
        )}
      </div>
    </section>
  );
};
