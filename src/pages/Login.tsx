import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (name.trim() && password.trim()) {
      if (isLogin) {
        const success = login(name.trim(), password.trim());
        if (success) {
          navigate('/');
        } else {
          setError('Invalid username or password.');
        }
      } else {
        const success = register(name.trim(), password.trim());
        if (success) {
          navigate('/');
        } else {
          setError('Username already exists.');
        }
      }
    } else {
      setError('Please fill in all fields.');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 via-white to-green-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-tr from-green-500 to-green-400 rounded-2xl shadow-lg flex items-center justify-center mb-4"
          >
            <Leaf className="text-white w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ecovoice</h1>
          <p className="text-slate-500 mt-1 text-center font-medium">
            {isLogin ? 'Welcome back to your community' : 'Join the movement today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Username"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all placeholder:text-slate-400"
              required
            />
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all placeholder:text-slate-400"
              required
            />
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="text-red-500 text-sm font-medium text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl text-lg shadow-lg shadow-slate-200 transition-colors mt-2"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-slate-500 hover:text-green-600 font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Log In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
