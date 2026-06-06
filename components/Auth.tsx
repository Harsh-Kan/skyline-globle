
import React, { useState } from 'react';
import { User } from '../types';
import { UserPlus, LogIn, Key, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabase'

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthView: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === 'login') {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password: password,
  });

  if (error) {
    setError(error.message);
    return;
  }

  if (data.user) {
    onLogin({
      username: data.user.email || '',
      password: '',
      isAdmin: data.user.email === 'harshkansara99@gmail.com'
    });
  }
}

else if (mode === 'signup') {
  const { error } = await supabase.auth.signUp({
    email: username,
    password: password,
  });

  if (error) {
    setError(error.message);
  } else {
    setMessage('Check your email to confirm your account.');
  }
}

else if (mode === 'forgot') {
  const { error } = await supabase.auth.resetPasswordForEmail(username);

  if (error) {
    setError(error.message);
  } else {
    setMessage('Password reset email sent.');
  }
}
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Skyline Globle</h1>
          <p className="text-violet-300 uppercase tracking-widest text-sm font-semibold mt-2">Daybook Manager</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 md:p-10">
          <div className="flex justify-between mb-8 border-b">
            <button 
              onClick={() => { setMode('login'); setError(null); }}
              className={`pb-4 px-2 text-sm font-bold transition-colors ${mode === 'login' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-400'}`}
            >
              LOGIN
            </button>
            <button 
  onClick={() => { setMode('signup'); setError(null); }}
  className={`pb-4 px-2 text-sm font-bold transition-colors ${
    mode === 'signup'
      ? 'text-violet-600 border-b-2 border-violet-600'
      : 'text-gray-400'
  }`}
>
  SIGN UP
</button>
            <button 
              onClick={() => { setMode('forgot'); setError(null); }}
              className={`pb-4 px-2 text-sm font-bold transition-colors ${mode === 'forgot' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-400'}`}
            >
              RECOVER
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
  Email
</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                placeholder="Email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {mode === 'forgot' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm animate-pulse">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-start gap-3 text-sm">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button 
  type="submit"
  className="w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200"
>
              {mode === 'login' ? <LogIn size={20} /> : mode === 'signup' ? <UserPlus size={20} /> : <Key size={20} />}
              <span>
  {mode === 'login'
    ? 'Secure Login'
    : mode === 'signup'
    ? 'Create Account'
    : 'Update Password'}
</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
