import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

// THE FIX: Add the missing props to the interface definition.
interface MessageInputProps {
    onSend: (text: string) => void;
    onStartTyping: () => void;
    onStopTyping: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, onStartTyping, onStopTyping }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    const handleSend = () => {
        if (input.trim()) {
            onSend(input.trim());
            setInput('');
            onStopTyping(); // Ensure stop typing is called on send
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        if (input) {
            onStartTyping();
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = window.setTimeout(() => {
                onStopTyping();
            }, 2000);
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [input, onStartTyping, onStopTyping]);
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, [input]);
    
    return (
        <footer className="px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all max-h-28 overflow-y-auto"
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-3 bg-blue-500 text-white rounded-full shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                    <Send size={20} />
                </button>
            </div>
        </footer>
    );
};
