import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from './chatheader';
import { MessageList } from './messagelist';
import { MessageInput } from './messageinput';
import { Message, User } from '../data/chatdata';

// THE FIX: Get the WebSocket URL from environment variables.
// This allows you to configure the URL for production without changing the code.
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';

const getCurrentUserFromToken = (): User | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const decoded: { userId: string; username: string } = jwtDecode(token);
        return { id: decoded.userId, name: decoded.username, avatar: `https://i.pravatar.cc/40?u=${decoded.userId}` };
    } catch (error) {
        return null;
    }
};

const chatPartner = {
    id: 'room-general',
    name: 'General Chat',
    avatar: 'https://placehold.co/40x40/6366f1/ffffff?text=G'
};

const welcomeMessage: Message = {
    id: 'system-welcome-message',
    text: 'Welcome to the General Chat room!',
    sender: { id: 'system', name: 'System', avatar: '' },
    timestamp: '',
    type: 'system'
};

export const ChatRoom = () => {
    const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
    const [currentUser] = useState<User | null>(getCurrentUserFromToken());
    const [isTyping, setIsTyping] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // THE FIX: Use the WEBSOCKET_URL constant to establish the connection.
        const socket = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);
        ws.current = socket;

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'join', payload: { roomId: 'general' } }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'history':
                    setMessages([welcomeMessage, ...data.payload]);
                    break;
                case 'message':
                    setIsTyping(false);
                    setMessages(prev => [...prev, data.payload]);
                    break;
                case 'chat_cleared':
                    setMessages([welcomeMessage]);
                    break;
                case 'user_typing':
                    if (data.senderId !== currentUser?.id) setIsTyping(true);
                    break;
                case 'user_stopped_typing':
                    if (data.senderId !== currentUser?.id) setIsTyping(false);
                    break;
            }
        };

        return () => socket.close();
    }, [navigate, currentUser?.id]);

    const handleSend = (text: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'chat', payload: { message: text } }));
            ws.current.send(JSON.stringify({ type: 'stop_typing', payload: { roomId: 'general' } }));
        }
    };

    const handleClearChat = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'clear_chat', payload: { roomId: 'general' } }));
        }
    };

    const handleStartTyping = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'start_typing', payload: { roomId: 'general' } }));
        }
    };

    const handleStopTyping = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'stop_typing', payload: { roomId: 'general' } }));
        }
    };

    if (!currentUser) return <div>Loading...</div>;

    // THE FIX: The layout has been updated to give the chat window a fixed height,
    // making it independent of the parent component's styling.
    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-4xl h-[90vh] max-h-[800px] flex flex-col bg-white/60 dark:bg-slate-800/60 shadow-2xl rounded-2xl backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <ChatHeader partner={chatPartner} onClearChat={handleClearChat} />
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
                    <MessageList messages={messages} currentUser={currentUser} isTyping={isTyping} />
                    <div ref={messagesEndRef} />
                </div>
                <MessageInput onSend={handleSend} onStartTyping={handleStartTyping} onStopTyping={handleStopTyping} />
            </div>
        </div>
    );
};
