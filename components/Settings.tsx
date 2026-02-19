
import React, { useState, useEffect } from 'react';
import { User, BankConfig } from '../types';
import { ShieldAlert, Save, RefreshCw, Lock, Plus, Trash2, ArrowUp, ArrowDown, MoveVertical, Users, UserMinus, UserCheck, Eye, EyeOff, Hash } from 'lucide-react';

interface SettingsProps {
  user: User;
  bankConfigs: BankConfig[];
  onSave: (configs: BankConfig[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, bankConfigs, onSave }) => {
  const [configs, setConfigs] = useState<BankConfig[]>(bankConfigs);
  const [isSaved, setIsSaved] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  // User Management State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isSignupEnabled, setIsSignupEnabled] = useState<boolean>(true);
  const [maxUsers, setMaxUsers] = useState<number>(4);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('skyline_all_users') || '[]');
    setAllUsers(savedUsers);
    
    const signupStatus = localStorage.getItem('skyline_signup_enabled') !== 'false';
    setIsSignupEnabled(signupStatus);

    const savedLimit = localStorage.getItem('skyline_max_users');
    if (savedLimit) setMaxUsers(Number(savedLimit));
  }, []);

  if (user.username !== 'Harsh') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-red-100 text-red-600 rounded-full mb-4">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Permission Denied</h2>
        <p className="text-gray-500">Only Harsh has option to access this option.</p>
      </div>
    );
  }

  const handleNameChange = (id: string, newName: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const addBankAccount = () => {
    const newId = `bank_${Date.now()}`;
    setConfigs(prev => [...prev, { id: newId, name: 'New Bank Account' }]);
  };

  const removeBankAccount = (id: string) => {
    if (id === 'cash') return;
    setConfigs(prev => prev.filter(c => c.id !== id));
  };

  const moveAccount = (index: number, direction: 'up' | 'down') => {
    const newConfigs = [...configs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newConfigs.length) return;
    
    const [movedItem] = newConfigs.splice(index, 1);
    newConfigs.splice(targetIndex, 0, movedItem);
    setConfigs(newConfigs);
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    if (usernameToDelete === 'Harsh') return;
    const updatedUsers = allUsers.filter(u => u.username !== usernameToDelete);
    setAllUsers(updatedUsers);
    localStorage.setItem('skyline_all_users', JSON.stringify(updatedUsers));
  };

  const toggleSignupAuthority = () => {
    const newState = !isSignupEnabled;
    setIsSignupEnabled(newState);
    localStorage.setItem('skyline_signup_enabled', String(newState));
  };

  const handleLimitChange = (val: string) => {
    const num = parseInt(val) || 1;
    setMaxUsers(num);
    localStorage.setItem('skyline_max_users', String(num));
  };

  const togglePasswordVisibility = (username: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(configs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-500 text-sm">Manage bank accounts, ordering, and user access (Admin: Harsh)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-violet-50 px-3 py-2 rounded-lg border border-violet-100">
            <span className="text-[10px] font-bold text-violet-700 uppercase tracking-tighter">Enable Repositioning</span>
            <button 
              onClick={() => setIsReorderMode(!isReorderMode)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${isReorderMode ? 'bg-violet-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isReorderMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          <button 
            onClick={addBankAccount}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors font-bold text-xs uppercase"
          >
            <Plus size={16} /> Add New Bank
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bank Management Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-2 font-bold text-gray-700 uppercase text-xs tracking-widest">
                 <RefreshCw size={14} /> Manage Bank Accounts
               </div>
               {isReorderMode && <span className="text-[10px] text-violet-600 font-bold bg-violet-50 px-2 py-1 rounded">Reorder Mode Active</span>}
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configs.map((config, index) => (
                  <div key={config.id} className="group relative bg-white border border-gray-100 p-3 rounded-xl hover:border-violet-200 transition-all shadow-sm flex items-center gap-3">
                    {isReorderMode && (
                      <div className="flex flex-col gap-1 pr-2 border-r border-gray-100">
                        <button 
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveAccount(index, 'up')}
                          className={`p-1 rounded hover:bg-violet-100 text-gray-400 hover:text-violet-600 transition-colors ${index === 0 ? 'opacity-20 cursor-not-allowed' : ''}`}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          type="button"
                          disabled={index === configs.length - 1}
                          onClick={() => moveAccount(index, 'down')}
                          className={`p-1 rounded hover:bg-violet-100 text-gray-400 hover:text-violet-600 transition-colors ${index === configs.length - 1 ? 'opacity-20 cursor-not-allowed' : ''}`}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-tighter">
                        {config.id === 'cash' ? <Lock size={10} /> : <MoveVertical size={10} className="opacity-40" />}
                        Ref: {config.id}
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={config.name}
                          disabled={config.id === 'cash'}
                          onChange={(e) => handleNameChange(config.id, e.target.value)}
                          className={`flex-1 p-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-violet-500 transition-all ${
                            config.id === 'cash' ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-200'
                          }`}
                        />
                        {config.id !== 'cash' && (
                          <button 
                            type="button"
                            onClick={() => removeBankAccount(config.id)}
                            className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <p className="text-[10px] text-gray-400 italic font-medium">
                   * Repositioning affects Dashboard display order.
                 </p>
                 <button 
                   type="submit"
                   className={`flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-bold transition-all shadow-md text-xs uppercase ${
                     isSaved ? 'bg-green-600 text-white' : 'bg-violet-600 text-white hover:bg-violet-700'
                   }`}
                 >
                   <Save size={16} />
                   <span>{isSaved ? 'Saved' : 'Apply Layout'}</span>
                 </button>
              </div>
            </form>
          </div>
        </div>

        {/* User Management Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-700 uppercase text-xs tracking-widest">
                <Users size={14} /> User Control
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Signup Authority Toggle */}
              <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl border border-violet-100">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-violet-900 uppercase">Sign-up Authority</span>
                  <span className="text-[10px] text-violet-600 italic">Toggle registration ability</span>
                </div>
                <button 
                  onClick={toggleSignupAuthority}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isSignupEnabled ? 'bg-green-500' : 'bg-red-400'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSignupEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Registration Limit */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-2">
                    <Hash size={12} /> Max Registrations
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={maxUsers}
                    onChange={(e) => handleLimitChange(e.target.value)}
                    className="w-16 p-1 text-sm font-bold text-center border rounded-lg focus:ring-1 focus:ring-violet-500 outline-none"
                  />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${allUsers.length >= maxUsers ? 'bg-red-500' : 'bg-violet-500'}`} 
                    style={{ width: `${Math.min(100, (allUsers.length / maxUsers) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">{allUsers.length} of {maxUsers} slots used</p>
              </div>

              {/* Registered Users List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Registered Users</h4>
                <div className="space-y-2">
                  {allUsers.map((u) => (
                    <div key={u.username} className="flex flex-col p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${u.username === 'Harsh' ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-600'}`}>
                            {u.username === 'Harsh' ? <ShieldAlert size={14} /> : <Users size={14} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800">{u.username}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                              {u.username === 'Harsh' ? 'Master Admin' : 'Standard User'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => togglePasswordVisibility(u.username)}
                            className="p-1.5 text-gray-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
                            title="View Password"
                          >
                            {visiblePasswords[u.username] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          {u.username !== 'Harsh' && (
                            <button 
                              onClick={() => handleDeleteUser(u.username)}
                              className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove User"
                            >
                              <UserMinus size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {visiblePasswords[u.username] && (
                        <div className="mt-2 p-2 bg-violet-50 rounded-lg border border-violet-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-violet-700 uppercase">Access Key:</span>
                          <span className="text-xs font-mono font-bold text-violet-900">{u.password || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isSignupEnabled && allUsers.length < maxUsers ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 text-[10px] font-bold uppercase justify-center">
                  <UserCheck size={14} /> New Users Can Join
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-[10px] font-bold uppercase justify-center">
                  <UserMinus size={14} /> Sign-ups are Blocked
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
