
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserPlus, LogIn, Key, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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
  const [userCount, setUserCount] = useState(0);
  const [isSignupBlocked, setIsSignupBlocked] = useState(false);
  const [maxUsers, setMaxUsers] = useState(4);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('skyline_all_users') || '[]');
    setUserCount(users.length);
    
    const signupEnabled = localStorage.getItem('skyline_signup_enabled') !== 'false';
    setIsSignupBlocked(!signupEnabled);

    const savedLimit = localStorage.getItem('skyline_max_users');
    if (savedLimit) setMaxUsers(Number(savedLimit));
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const users: User[] = JSON.parse(localStorage.getItem('skyline_all_users') || '[]');

    if (mode === 'login') {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password.');
      }
    } else if (mode === 'signup') {
      if (isSignupBlocked) {
        setError('New registrations are currently closed by the administrator.');
        return;
      }
      if (users.length >= maxUsers) {
        setError(`Limit of ${maxUsers} users reached. Already ${users.length} users have signed up.`);
        return;
      }
      if (users.find(u => u.username === username)) {
        setError('Username already taken.');
        return;
      }
      const newUser: User = { 
        username, 
        password, 
        isAdmin: username === 'Harsh' 
      };
      users.push(newUser);
      localStorage.setItem('skyline_all_users', JSON.stringify(users));
      setMessage('Registration successful! You can now log in.');
      setMode('login');
    } else if (mode === 'forgot') {
      const userIndex = users.findIndex(u => u.username === username);
      if (userIndex > -1) {
        users[userIndex].password = password; 
        localStorage.setItem('skyline_all_users', JSON.stringify(users));
        setMessage('Password reset successful!');
        setMode('login');
      } else {
        setError('User not found.');
      }
    }
  };

  const isSignupDisabled = userCount >= maxUsers || isSignupBlocked;

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
              onClick={() => { if(!isSignupDisabled) setMode('signup'); setError(null); }}
              disabled={isSignupDisabled}
              className={`pb-4 px-2 text-sm font-bold transition-colors ${
                mode === 'signup' ? 'text-violet-600 border-b-2 border-violet-600' : 
                (isSignupDisabled ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400')
              }`}
            >
              SIGN UP {isSignupBlocked ? '(BLOCKED)' : (userCount >= maxUsers ? '(FULL)' : '')}
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                placeholder="Username"
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
              disabled={mode === 'signup' && isSignupDisabled}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${
                mode === 'signup' && isSignupDisabled ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'
              }`}
            >
              {mode === 'login' ? <LogIn size={20} /> : mode === 'signup' ? <UserPlus size={20} /> : <Key size={20} />}
              <span>
                {mode === 'login' ? 'Secure Login' : mode === 'signup' ? (isSignupBlocked ? 'Sign-up Disabled' : 'Create Account') : 'Update Password'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
