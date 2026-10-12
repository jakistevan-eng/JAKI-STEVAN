import React, { useState } from 'react';
import { Quote, Sparkles, Send, PlusCircle, X, Check, RefreshCw, Copy } from 'lucide-react';
import { QuoteData } from '../types';
import { CURATED_QUOTES, THEME_GRADIENTS, CuratedQuote, getRandomQuote } from '../utils/quotes';

interface QuotesHubModalProps {
  onClose: () => void;
  onSendQuoteToChat: (quote: QuoteData) => void;
  onPostQuoteToStatus: (quote: QuoteData) => void;
}

export const QuotesHubModal: React.FC<QuotesHubModalProps> = ({
  onClose,
  onSendQuoteToChat,
  onPostQuoteToStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'curated'>('write');
  const [quoteText, setQuoteText] = useState(
    'Connection is the quiet magic of understanding another soul without saying a word.'
  );
  const [quoteAuthor, setQuoteAuthor] = useState('Jaki Stevan');
  const [selectedTheme, setSelectedTheme] = useState<
    'amber' | 'emerald' | 'violet' | 'rose' | 'ocean' | 'dark'
  >('emerald');
  const [copied, setCopied] = useState(false);

  const themeConfig = THEME_GRADIENTS[selectedTheme];

  const handleUseCurated = (q: CuratedQuote) => {
    setQuoteText(q.text);
    setQuoteAuthor(q.author);
    setSelectedTheme(q.theme);
    setActiveTab('write');
  };

  const handleRandomize = () => {
    const q = getRandomQuote();
    setQuoteText(q.text);
    setQuoteAuthor(q.author);
    setSelectedTheme(q.theme);
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${quoteText}" — ${quoteAuthor}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentQuoteData: QuoteData = {
    text: quoteText.trim() || 'Every day is a fresh canvas.',
    author: quoteAuthor.trim() || 'Anonymous',
    theme: selectedTheme,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Quote className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">Quotes & Status Studio</h3>
              <p className="text-xs text-slate-500">Compose quote cards to share in chats or post to your status</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`pb-2 text-xs font-semibold tracking-wide transition-colors relative ${
              activeTab === 'write'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Write Custom Quote
            {activeTab === 'write' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curated')}
            className={`pb-2 text-xs font-semibold tracking-wide transition-colors relative ${
              activeTab === 'curated'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Inspirational Library
            {activeTab === 'curated' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {activeTab === 'write' ? (
            <>
              {/* Live Preview Card */}
              <div className="relative">
                <div
                  className={`rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden transition-all duration-300 ${themeConfig.bg}`}
                >
                  {/* Decorative quote mark */}
                  <div className="absolute -top-3 -right-2 text-white/10 select-none pointer-events-none text-8xl font-serif leading-none">
                    “
                  </div>
                  <p className={`text-base sm:text-lg font-serif italic leading-relaxed relative z-10 ${themeConfig.text}`}>
                    “{quoteText.trim() || 'Write something inspiring here...' }”
                  </p>
                  <div className="mt-4 flex items-center justify-between relative z-10 pt-2 border-t border-white/15">
                    <span className={`text-xs font-medium tracking-wide ${themeConfig.authorText}`}>
                      — {quoteAuthor.trim() || 'You'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyQuote}
                      className="text-xs text-white/80 hover:text-white flex items-center gap-1 transition-opacity active:scale-95"
                      title="Copy quote text"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Randomizer quick button */}
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="absolute bottom-3 right-3 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 z-20"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Inspire me</span>
                </button>
              </div>

              {/* Quote Editor Form */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Quote Thought / Message
                  </label>
                  <textarea
                    rows={3}
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    placeholder="Write an uplifting quote or philosophical thought..."
                    className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Author Attribution
                    </label>
                    <input
                      type="text"
                      value={quoteAuthor}
                      onChange={(e) => setQuoteAuthor(e.target.value)}
                      placeholder="e.g. Maya Angelou, Anonymous, or You"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Gradient Card Style */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Card Theme Palette
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {(['emerald', 'amber', 'violet', 'rose', 'ocean', 'dark'] as const).map(
                        (t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTheme(t)}
                            className={`w-7 h-7 rounded-full transition-transform ${
                              THEME_GRADIENTS[t].bg
                            } ${
                              selectedTheme === t
                                ? 'scale-115 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900'
                                : 'opacity-80 hover:opacity-100 hover:scale-105'
                            }`}
                            title={`Select ${t} theme`}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Curated Quotes List */
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Click any quote to load it into the studio editor:
              </div>
              <div className="grid grid-cols-1 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {CURATED_QUOTES.map((q) => {
                  const cfg = THEME_GRADIENTS[q.theme];
                  return (
                    <div
                      key={q.id}
                      onClick={() => handleUseCurated(q)}
                      className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01] ${cfg.bg} text-white shadow-sm flex flex-col justify-between`}
                    >
                      <p className="text-xs sm:text-sm font-serif italic leading-relaxed">
                        “{q.text}”
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs opacity-90">
                        <span>— {q.author}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20">
                          {q.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onPostQuoteToStatus(currentQuoteData);
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Post to Status</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSendQuoteToChat(currentQuoteData);
              onClose();
            }}
            className="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
