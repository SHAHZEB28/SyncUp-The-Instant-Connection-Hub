import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Make sure useNavigate is imported
import { motion } from 'framer-motion';
import { User, Lock, LogIn } from 'lucide-react';

const API_URL = 'http://localhost:8080';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); // 2. Initialize the navigate function

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
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
                    // 3. This is the crucial navigation call
                    navigate('/chat'); 
                } else {
                    // On successful registration, switch to login view
                    setIsLogin(true);
                    setError('Registration successful! Please log in.');
                }
            } else {
                // If the server responds with an error (e.g., 401, 500)
                const errorData = await response.json();
                setError(errorData.message || (isLogin ? 'Login failed. Check credentials.' : 'Registration failed.'));
            }
        } catch (err) {
            // This catches network errors (e.g., server is down)
            console.error('An error occurred:', err);
            setError('Cannot connect to the server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <div className="flex items-center justify-center h-full p-4">
            <motion.div 
                layout
                className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/50 dark:bg-slate-900/50 shadow-2xl rounded-2xl backdrop-blur-lg border border-slate-200/50 dark:border-slate-800/50"
            >
                <motion.div
                    key={isLogin ? 'login' : 'register'}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {isLogin ? 'Welcome Back!' : 'Create an Account'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {isLogin ? 'Sign in to continue' : 'Get started with our chat app'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        
                        {error && (
                            <motion.p 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-center text-red-500 dark:text-red-400"
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 font-semibold text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <motion.div 
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>{isLogin ? 'Login' : 'Register'}</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
