
import React, { useState, useEffect } from 'react';
import { AuthView } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Ledger } from './components/Ledger';
import { Settings } from './components/Settings';
import { Transaction, User, BankConfig } from './types';

const INITIAL_BANKS: BankConfig[] = [
  { id: 'bank1', name: 'Bank 1' },
  { id: 'bank2', name: 'Bank 2' },
  { id: 'bank3', name: 'Bank 3' },
  { id: 'bank4', name: 'Bank 4' },
  { id: 'cash', name: 'Cash Account' }
];

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'ledger' | 'settings' | 'consolidated'>('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('skyline_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('skyline_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [bankConfigs, setBankConfigs] = useState<BankConfig[]>(() => {
    const saved = localStorage.getItem('skyline_banks');
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });

  useEffect(() => {
    localStorage.setItem('skyline_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('skyline_banks', JSON.stringify(bankConfigs));
  }, [bankConfigs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('skyline_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('skyline_user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'runningBalance' | 'createdAt'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      runningBalance: 0 
    };
    setTransactions(prev => [...prev, tx]);
  };

  const handleEditTransaction = (id: string, updatedData: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateBankNames = (configs: BankConfig[]) => {
    setBankConfigs(configs);
  };

  if (!currentUser) {
    return <AuthView onLogin={setCurrentUser} />;
  }

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      currentView={view} 
      onViewChange={(v) => {
        setView(v);
        if (v === 'consolidated') setSelectedAccountId('all');
      }}
      bankConfigs={bankConfigs}
    >
      {view === 'dashboard' && currentUser && (
  <Dashboard 
    user={currentUser}
    transactions={transactions} 
    bankConfigs={bankConfigs} 
    onNavigateLedger={(id) => {
      setSelectedAccountId(id);
      setView('ledger');
    }}
  />
)}
      {view === 'ledger' && (
        <Ledger 
          accountId={selectedAccountId}
          bankConfigs={bankConfigs}
          transactions={transactions}
          onAdd={handleAddTransaction}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onAccountChange={setSelectedAccountId}
        />
      )}
      {view === 'consolidated' && (
        <Ledger 
          accountId="all"
          bankConfigs={bankConfigs}
          transactions={transactions}
          onAdd={handleAddTransaction}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onAccountChange={() => {}}
        />
      )}
      {view === 'settings' && (
        <Settings 
          user={currentUser} 
          bankConfigs={bankConfigs} 
          onSave={updateBankNames} 
        />
      )}
    </Layout>
  );
};

export default App;
