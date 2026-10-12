import React, { useState } from 'react';
import { Search, X, Smile, Heart, Coffee, Globe, Compass, Activity, Flag } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: Smile,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗',
      '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶',
      '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯',
      '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
    ],
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: Activity,
    emojis: [
      '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
      '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '🙌', '👐', '🤲', '👏', '🙏',
      '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '👁', '👀',
    ],
  },
  {
    id: 'hearts',
    name: 'Hearts & Symbols',
    icon: Heart,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞',
      '💓', '💗', '💖', '💘', '💝', '💟', '✨', '🔥', '⭐️', '🌟', '💥', '💯', '💢',
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🎯', '🔮', '💡', '🔔', '📢',
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: Coffee,
    emojis: [
      '☕️', '🫖', '🍵', '🧃', '🥤', '🧋', '🍺', '🍻', '🥂', '🍷', '🍕', '🍔', '🍟',
      '🌭', '🍿', '🥓', '🍳', '🧇', '🥞', '🥐', '🥨', '🥯', '🥖', '🧀', '🥗', '🍝',
      '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍦', '🍧', '🍰', '🎂', '🍩',
      '🍪', '🍫', '🍬', '🍭', '🍎', '🍓', '🍒', '🥑', '🍌', '🍉', '🍇', '🍑', '🍍',
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Nature',
    icon: Compass,
    emojis: [
      '🚗', '🚕', '🚙', '🏎', '✈️', '🚀', '🛸', '⛵️', '🛳', '🚲', '🛵', '🏍', '🗺',
      '🗽', '🗼', '🏔', '🌋', '🏖', '🏝', '🏕', '🌅', '🌄', '🌉', '🏙', '🌆', '🌃',
      '🌲', '🌳', '🌴', '🌸', '🌹', '🌺', '🌻', '🐶', '🐱', '🦊', '🦁', '🐼', '🐨',
    ],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategoryData = EMOJI_CATEGORIES.find((c) => c.id === activeCategory);

  const filteredEmojis = searchQuery.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis)
    : currentCategoryData?.emojis || [];

  return (
    <div className="absolute bottom-16 left-2 sm:left-4 z-40 w-[320px] sm:w-[360px] max-h-[380px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header with Search */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emoji..."
            className="w-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 pl-8 pr-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close emoji picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Icons Bar */}
      {!searchQuery && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
          {EMOJI_CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title={cat.name}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-7 gap-1 scrollbar-thin">
        {filteredEmojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-transform active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
