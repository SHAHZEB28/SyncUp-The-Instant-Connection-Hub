import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, LogIn } from 'lucide-react';

// THE FIX: Get the API URL from environment variables.
// This allows you to configure the URL for production without changing the code.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const endpoint = isLogin ? '/login' : '/register';
        
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                if (isLogin) {
                    const { token } = await response.json();
                    localStorage.setItem('token', token);
                    navigate('/chat');
                } else {
                    setIsLogin(true);
                    setSuccess('Registration successful! Please log in.');
                }
            } else {
                const errorData = await response.text();
                setError(errorData || (isLogin ? 'Login failed' : 'Registration failed'));
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setError('An error occurred. Please check the console.');
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {isLogin ? 'Welcome Back!' : 'Create Account'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isLogin ? 'Sign in to your account' : 'Join the conversation'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                    {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-500 dark:text-green-400 text-center">{success}</p>}
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition"
                    >
                        {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                        {isLogin ? 'Login' : 'Register'}
                    </motion.button>
                </form>

                <div className="text-center">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition">
                        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
