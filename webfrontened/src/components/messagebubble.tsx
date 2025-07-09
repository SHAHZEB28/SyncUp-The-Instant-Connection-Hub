import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Message, User } from '../data/chatdata';

interface MessageBubbleProps {
    message: Message;
    currentUser: User;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUser }) => {
    // THE FIX: Check if the message type is 'system'.
    if (message.type === 'system') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center my-2"
            >
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                    {message.text}
                </span>
            </motion.div>
        );
    }

    const isSentByCurrentUser = message.sender.id === currentUser.id;
  
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={clsx('flex items-end gap-2 mb-4', { 'justify-end': isSentByCurrentUser, 'justify-start': !isSentByCurrentUser })}
        >
            {!isSentByCurrentUser && (
                <img 
                    src={message.sender.avatar} 
                    alt={message.sender.name} 
                    className="w-8 h-8 rounded-full" 
                />
            )}
      
            <div className={clsx('max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm', {
                'bg-blue-500 text-white rounded-br-md': isSentByCurrentUser,
                'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md': !isSentByCurrentUser
            })}>
                <p className="text-sm break-words">{message.text}</p>
                <p className={clsx('text-xs mt-1 text-right', {
                    'text-blue-200': isSentByCurrentUser,
                    'text-slate-400 dark:text-slate-500': !isSentByCurrentUser
                })}>
                    {message.timestamp}
                </p>
            </div>
      
            {isSentByCurrentUser && (
                <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-8 h-8 rounded-full" 
                />
            )}
        </motion.div>
    );
};
