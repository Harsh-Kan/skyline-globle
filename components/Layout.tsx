
import React from 'react';
import { User, BankConfig } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  Wallet
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: any) => void;
  bankConfigs: BankConfig[];
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  onLogout, 
  currentView, 
  onViewChange, 
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ledger', label: 'Daybook', icon: BookOpen },
    { id: 'consolidated', label: 'Consolidated Ledger', icon: Wallet },
    { id: 'settings', label: 'Account Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-violet-950 text-white transform transition-transform duration-200 ease-in-out z-30
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 flex flex-col
      `}>
        <div className="p-6 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap">Skyline Globle</h1>
          <p className="text-violet-300 text-[10px] mt-1 uppercase tracking-widest font-bold">Daybook Manager</p>
        </div>

        <nav className="mt-4 px-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors group
                ${currentView === item.id ? 'bg-violet-800 text-white shadow-lg' : 'text-violet-200 hover:bg-violet-900 hover:text-white'}
              `}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="font-medium text-sm whitespace-nowrap truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="shrink-0 p-4 border-t border-violet-900 bg-violet-950">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">{user.username}</span>
              <span className="text-[10px] text-violet-400 uppercase font-black tracking-tighter">
                {user.isAdmin ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-violet-900 hover:bg-red-900 transition-colors rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b h-14 flex items-center justify-between px-6 shrink-0">
          <button 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 flex items-center justify-end">
             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mr-4 hidden md:block">
                Region: <span className="text-gray-900 ml-1">India</span> | Currency: <span className="text-gray-900 ml-1">INR (₹)</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
