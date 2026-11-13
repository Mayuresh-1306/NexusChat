import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Lock, Mail, User as UserIcon, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register, error, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !password || (!isLogin && !name)) {
      setFormError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@chat.com');
      setPassword('admin123');
      setIsLogin(true);
    } else {
      setEmail('user@chat.com');
      setPassword('user123');
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30 text-white mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NexusChat MERN</h1>
          <p className="text-sm text-indigo-200/70 mt-1">Real-Time Chat & Mini Project Evaluation Suite</p>
        </div>

        {/* Quick Test Credentials Box */}
        <div className="mb-6 p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl">
          <p className="text-xs font-medium text-indigo-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick Test Accounts (Click to Fill):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="text-xs bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 py-1.5 px-3 rounded-lg border border-indigo-600/40 transition flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-amber-400" />
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('user')}
              className="text-xs bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 py-1.5 px-3 rounded-lg border border-indigo-600/40 transition flex items-center justify-center gap-1.5"
            >
              <UserIcon className="w-3 h-3 text-emerald-400" />
              User Demo
            </button>
          </div>
        </div>

        {(formError || error) && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Account Role (RBAC)</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'user' | 'admin')}
                className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="user">Regular User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormError(null);
            }}
            className="text-xs text-indigo-300 hover:text-white transition"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
