import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageBubble } from './messagebubble';
import { Message, User } from '../data/chatdata';

interface MessageListProps {
    messages: Message[];
    currentUser: User;
    isTyping: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUser, isTyping }) => {
    return (
        <div className="space-y-4">
            <AnimatePresence>
                {/* THE FIX: Add a filter to ensure we only try to render valid message objects.
                    This acts as a final safeguard against crashes. */}
                {messages.filter(msg => msg && msg.id).map((msg) => (
                    <MessageBubble key={msg.id} message={msg} currentUser={currentUser} />
                ))}
            </AnimatePresence>
            {isTyping && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    A user is typing...
                </div>
            )}
        </div>
    );
};
