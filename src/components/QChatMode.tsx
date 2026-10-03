import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TermItem } from '../types';
import { sounds } from '../utils/audio';

interface QChatModeProps {
  terms: TermItem[];
  onExit: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-0',
    sender: 'assistant',
    text: "Hello! I'm your Bio 101 AI Study Tutor. What concept in Cell Biology or Cellular Respiration would you like to explore or be quizzed on today?",
    timestamp: 'Just now',
    suggestedQuestions: [
      'Explain Chemiosmosis step-by-step',
      'What is the net ATP yield of Glycolysis?',
      'How does the ETC create a proton gradient?',
      'Quiz me on cell organelles',
    ],
  },
];

export const QChatMode: React.FC<QChatModeProps> = ({ terms, onExit }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || "Let's review this concept together.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Offline / fallback response
      const fallbackTerm = terms.find((t) =>
        t.term.toLowerCase().includes(userMsg.text.toLowerCase())
      );

      let fallbackText =
        "Let's focus on the essentials: Cellular respiration breaks down glucose via glycolysis, pyruvate oxidation, citric acid cycle, and oxidative phosphorylation to generate ATP.";

      if (fallbackTerm) {
        fallbackText = `**${fallbackTerm.term}**: ${fallbackTerm.definition}\n\n*Key Fact*: ${fallbackTerm.keyFact || 'Central to cellular metabolism.'}`;
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-surface-card rounded-2xl border border-border-tactile shadow-[0_4px_16px_-2px_rgba(46,56,86,0.08)] flex flex-col h-[580px] overflow-hidden">
      {/* Chat Top Bar */}
      <div className="p-3.5 border-b border-border-tactile bg-surface-container-low flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-secondary to-tertiary-fixed text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-lg">smart_toy</span>
          </div>
          <div>
            <div className="font-display font-bold text-xs text-text-primary flex items-center gap-1">
              Q-Chat AI Tutor
              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                Bio 101
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">Dr. Vance's curriculum assistant</p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="text-xs font-bold text-secondary hover:underline flex items-center gap-0.5"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Overview
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-secondary text-white rounded-br-xs'
                    : 'bg-surface-container text-text-primary rounded-bl-xs border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {!isUser && (
                  <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-text-secondary">
                    <span>{msg.timestamp}</span>
                    <button
                      aria-label="Listen to answer"
                      onClick={() => sounds.speak(msg.text)}
                      className="p-1 hover:text-secondary flex items-center gap-1 transition-colors"
                      title="Read aloud"
                    >
                      <span className="material-symbols-outlined text-sm">volume_up</span>
                      Listen
                    </button>
                  </div>
                )}
              </div>

              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 max-w-[95%]">
                  {msg.suggestedQuestions.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="text-[11px] font-medium bg-white hover:bg-surface-container text-secondary border border-secondary-fixed rounded-full px-2.5 py-1 transition-colors text-left"
                    >
                      💡 {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface-container p-3 rounded-2xl w-fit">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse delay-75" />
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse delay-150" />
            <span>Dr. Vance's AI is formulating an answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 border-t border-border-tactile bg-white flex items-center gap-2"
      >
        <input
          id="qchat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask anything about cell biology..."
          disabled={isLoading}
          className="flex-1 bg-surface-container/60 border border-border-tactile rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        <button
          id="qchat-send-btn"
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center disabled:opacity-40 hover:bg-secondary/90 transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </form>
    </section>
  );
};
