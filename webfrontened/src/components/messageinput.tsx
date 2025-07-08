// src/components/MessageInput.tsx

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

type MessageInputProps = {
  onSend: (text: string) => void;
}

export const MessageInput = ({ onSend }: MessageInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  return (
    <footer className="sticky bottom-0 p-2 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <motion.div layout className="flex items-end gap-2">
        <motion.div layout className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 max-h-40 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
          />
        </motion.div>
        <motion.button
          onClick={handleSend}
          whileHover={{ scale: 1.05, backgroundColor: '#2563eb' }}
          whileTap={{ scale: 0.95, backgroundColor: '#1d4ed8' }}
          className="p-3 bg-blue-500 text-white rounded-full shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <Send size={20} />
        </motion.button>
      </motion.div>
    </footer>
  );
};