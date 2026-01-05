'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ReactionButtonProps {
  reactions: Array<{
    emoji: string;
    label: string;
    color: string;
  }>;
  selectedReaction: string | null;
  onReaction: (emoji: string) => void;
  showReactions: boolean;
  onToggleReactions: () => void;
}

export function ReactionButton({
  reactions,
  selectedReaction,
  onReaction,
  showReactions,
  onToggleReactions,
}: ReactionButtonProps) {
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);

  const handleReaction = (emoji: string) => {
    setAnimatingEmoji(emoji);
    onReaction(emoji);
    setTimeout(() => setAnimatingEmoji(null), 600);
  };

  return (
    <div className="relative">
      {/* Reaction Selector */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
          >
            <div className="flex items-center justify-center gap-2">
              {reactions.map((reaction) => (
                <motion.button
                  key={reaction.emoji}
                  onClick={() => handleReaction(reaction.emoji)}
                  className={cn(
                    'text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors relative',
                    selectedReaction === reaction.emoji && 'bg-blue-50 ring-2 ring-blue-300'
                  )}
                  aria-label={`React with ${reaction.label}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {reaction.emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Emoji Overlay */}
      <AnimatePresence>
        {animatingEmoji && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 1],
              opacity: [0, 1, 0],
              y: [0, -50, -100]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="text-6xl">
              {animatingEmoji}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}