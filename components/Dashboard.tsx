
import React, { useState, useMemo } from 'react';
import { Transaction, BankConfig } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CreditCard, Wallet, TrendingUp, TrendingDown, Calendar, Calculator } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  bankConfigs: BankConfig[];
  onNavigateLedger: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, bankConfigs, onNavigateLedger }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const metrics = useMemo(() => {
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate Opening Balance (everything before startDate)
    const openingTxs = startDate 
      ? sortedTxs.filter(t => t.date < startDate)
      : [];
    const openingBalance = openingTxs.reduce((acc, t) => acc + t.paymentIn - t.paymentOut, 0);

    // Filter transactions for the selected range
    let rangeTxs = sortedTxs;
    if (startDate) rangeTxs = rangeTxs.filter(t => t.date >= startDate);
    if (endDate) rangeTxs = rangeTxs.filter(t => t.date <= endDate);

    const totalInflow = rangeTxs.reduce((acc, t) => acc + t.paymentIn, 0);
    const totalOutflow = rangeTxs.reduce((acc, t) => acc + t.paymentOut, 0);
    const closingBalance = openingBalance + totalInflow - totalOutflow;

    return {
      openingBalance,
      totalInflow,
      totalOutflow,
      closingBalance,
      rangeTxs
    };
  }, [transactions, startDate, endDate]);

  const getAccountBalance = (accountId: string) => {
    const txs = transactions.filter(t => t.accountId === accountId);
    if (endDate) {
      return txs.filter(t => t.date <= endDate).reduce((acc, curr) => acc + curr.paymentIn - curr.paymentOut, 0);
    }
    return txs.reduce((acc, curr) => acc + curr.paymentIn - curr.paymentOut, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Skyline Globle Summary</h2>
          <p className="text-xs text-gray-500 italic">Real-time overview of connected accounts</p>
        </div>
        
        {/* Compact Date Filter */}
        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center no-print">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-violet-500" />
            <label className="text-[10px] font-bold text-gray-400 uppercase">From:</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-1 rounded text-xs outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">To:</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-1 rounded text-xs outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-[10px] text-violet-600 font-bold hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Financial Performance Summary Box - Occupies Full Horizontal Width */}
        <div className="w-full bg-white p-4 md:p-6 rounded-2xl border border-violet-100 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="text-violet-500" size={18} />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">Financial Performance Summary</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">1. Opening Balance</span>
              <span className="font-bold text-gray-800 text-base">{formatCurrency(metrics.openingBalance)}</span>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp size={12} className="text-green-500" />
                <span className="text-[10px] text-green-700 font-bold uppercase">2. Total Inflow</span>
              </div>
              <span className="font-bold text-green-700 text-base">+{formatCurrency(metrics.totalInflow)}</span>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown size={12} className="text-red-500" />
                <span className="text-[10px] text-red-700 font-bold uppercase">3. Total Outflow</span>
              </div>
              <span className="font-bold text-red-700 text-base">-{formatCurrency(metrics.totalOutflow)}</span>
            </div>
            <div className="p-4 bg-violet-600 text-white rounded-xl shadow-lg flex flex-col justify-center ring-4 ring-violet-50">
              <span className="text-[10px] font-bold uppercase mb-1 opacity-80">4. Closing Balance</span>
              <span className="text-lg font-black tracking-tight">{formatCurrency(metrics.closingBalance)}</span>
            </div>
          </div>
        </div>

        {/* Account Breakdown - Restricted to 3 accounts per row */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 px-1 uppercase tracking-wider">
            <CreditCard className="text-violet-500" size={16} /> Account Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankConfigs.map((bank) => {
              const balance = getAccountBalance(bank.id);
              return (
                <div 
                  key={bank.id}
                  onClick={() => onNavigateLedger(bank.id)}
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bank.id === 'cash' ? 'bg-amber-100 text-amber-600' : 'bg-violet-100 text-violet-600'}`}>
                      {bank.id === 'cash' ? <Wallet size={18} /> : <CreditCard size={18} />}
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-xs font-bold uppercase truncate max-w-[150px]">{bank.name}</h3>
                      <div className="text-base font-black text-gray-800 truncate">
                        {formatCurrency(balance)}
                      </div>
                    </div>
                  </div>
                  <div className="text-violet-300 group-hover:text-violet-500 transition-colors">
                    <TrendingUp size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
