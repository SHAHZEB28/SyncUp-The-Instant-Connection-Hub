import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, LogOut, Trash2 } from 'lucide-react'; // Import Trash2 icon
import { ThemeContext } from '../context/themecontext';

type User = { id: string; name: string; avatar: string; };

interface ChatHeaderProps {
    partner: User;
    onClearChat: () => void; // Add a prop for the clear chat action
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ partner, onClearChat }) => {
    const themeContext = useContext(ThemeContext);
    if (!themeContext) return null;
    const { theme, toggleTheme } = themeContext;

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Simple redirect
    };

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <img src={partner.avatar} alt={partner.name} className="w-10 h-10 rounded-full" />
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">{partner.name}</h1>
                    <p className="text-xs text-green-500 dark:text-green-400">Online</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <motion.button
                    onClick={onClearChat}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full text-slate-500 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Clear chat"
                >
                    <Trash2 size={20} />
                </motion.button>
                <motion.button
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9, rotate: -15 }}
                    className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </motion.button>
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 bg-red-100 dark:bg-red-500/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                </motion.button>
            </div>
        </header>
    );
};
