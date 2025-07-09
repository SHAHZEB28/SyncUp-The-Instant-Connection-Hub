import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './components/login'; 
import { ChatRoom } from './components/chatroom';
import { ThemeProvider } from './context/themecontext'; 

const AnimatedBackground = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
    <div className="absolute w-96 h-96 bg-blue-300 rounded-full -top-32 -left-32 opacity-20 dark:opacity-10 animate-pulse" />
    <div className="absolute w-96 h-96 bg-purple-300 rounded-full -bottom-32 -right-32 opacity-20 dark:opacity-10 animate-pulse" style={{ animationDelay: '4s' }} />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      {/* THE FIX, PART 1: Change `min-h-screen` to `h-screen`.
        This gives the main container a fixed height equal to the browser window's height,
        preventing the entire page from growing and scrolling.
      */}
      <main className="font-sans h-screen flex flex-col antialiased bg-slate-100 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
        <AnimatedBackground />
        <Toaster position="top-right" />
        
        {/* THE FIX, PART 2: Change `flex-grow` to `flex-1`.
          This makes the container for your routes (and thus the ChatRoom) expand to fill the 
          available space within the fixed-height `h-screen` parent.
        */}
        <div className="relative z-10 flex-1 flex flex-col p-0 sm:p-4 md:p-8 min-h-0">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  {/* Because its parent now has a fixed size, the ChatRoom's `h-full` property will work correctly. */}
                  <ChatRoom />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </main>
    </ThemeProvider>
  );
}
