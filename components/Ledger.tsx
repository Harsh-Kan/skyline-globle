
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, BankConfig } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Download, Plus, Trash2, Edit2, X, Filter } from 'lucide-react';

interface LedgerProps {
  accountId: string;
  bankConfigs: BankConfig[];
  transactions: Transaction[];
  onAdd: (tx: Omit<Transaction, 'id' | 'runningBalance' | 'createdAt'>) => void;
  onEdit: (id: string, updated: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onAccountChange: (id: string) => void;
}

export const Ledger: React.FC<LedgerProps> = ({ 
  accountId, 
  bankConfigs, 
  transactions, 
  onAdd, 
  onEdit,
  onDelete,
  onAccountChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Filtering State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    particulars: '',
    type: TransactionType.NON_GST,
    paymentIn: 0,
    paymentOut: 0,
    accountId: accountId === 'all' ? (bankConfigs[0]?.id || 'bank1') : accountId
  });

  const accountName = useMemo(() => {
    if (accountId === 'all') return 'Consolidated Daybook';
    return bankConfigs.find(b => b.id === accountId)?.name || 'Account';
  }, [accountId, bankConfigs]);

  const filteredAndSorted = useMemo(() => {
    let list = accountId === 'all' 
      ? [...transactions] 
      : transactions.filter(t => t.accountId === accountId);
    
    // Apply Date Filter
    if (startDate) {
      list = list.filter(t => t.date >= startDate);
    }
    if (endDate) {
      list = list.filter(t => t.date <= endDate);
    }

    // Apply GST/Non-GST Filter
    if (typeFilter !== 'all') {
      list = list.filter(t => t.type === typeFilter);
    }

    const sorted = list.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.createdAt - b.createdAt;
    });

    let currentBalance = 0;
    return sorted.map(tx => {
      currentBalance += tx.paymentIn - tx.paymentOut;
      return { ...tx, runningBalance: currentBalance };
    });
  }, [transactions, accountId, startDate, endDate, typeFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      onEdit(editId, {
        ...formData,
        paymentIn: Number(formData.paymentIn),
        paymentOut: Number(formData.paymentOut),
      });
      setEditId(null);
    } else {
      onAdd({
        ...formData,
        accountId: accountId === 'all' ? formData.accountId : accountId,
        paymentIn: Number(formData.paymentIn),
        paymentOut: Number(formData.paymentOut),
      });
    }
    setFormData({
      ...formData,
      particulars: '',
      paymentIn: 0,
      paymentOut: 0
    });
    setShowAddForm(false);
  };

  const handleEdit = (tx: Transaction) => {
    setFormData({
      date: tx.date,
      particulars: tx.particulars,
      type: tx.type,
      paymentIn: tx.paymentIn,
      paymentOut: tx.paymentOut,
      accountId: tx.accountId
    });
    setEditId(tx.id);
    setShowAddForm(true);
  };

  const handleExport = () => {
    const data = filteredAndSorted.map(t => ({
      Date: formatDate(t.date),
      Source: bankConfigs.find(b => b.id === t.accountId)?.name || 'Unknown',
      Particulars: t.particulars,
      Type: t.type,
      'Payment In': t.paymentIn,
      'Payment Out': t.paymentOut,
      'Running Balance': t.runningBalance
    }));

    const ws = (window as any).XLSX.utils.json_to_sheet(data);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "Daybook");
    (window as any).XLSX.writeFile(wb, `${accountName.replace(/\s+/g, '_')}_Ledger.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{accountName}</h2>
          <p className="text-gray-500">Manage your transactions and view history</p>
        </div>
        <div className="flex items-center gap-2">
          {accountId !== 'all' && (
             <select 
                value={accountId}
                onChange={(e) => onAccountChange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              >
                {bankConfigs.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
          )}
          <button 
            onClick={handleExport}
            className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            title="Export to Excel"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={() => {
              setEditId(null);
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center space-x-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors font-medium"
          >
            <Plus size={20} />
            <span>{editId ? 'Edit Transaction' : 'New Transaction'}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-6 items-center">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">From:</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border p-1 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500"
                />
            </div>
            <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">To:</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border p-1 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500"
                />
            </div>
         </div>
         
         <div className="h-6 w-px bg-gray-200" />

         <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <label className="text-xs font-bold text-gray-500 uppercase">Transaction Type:</label>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="border p-1 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500 bg-white"
            >
              <option value="all">All Transactions</option>
              <option value={TransactionType.GST}>GST Only</option>
              <option value={TransactionType.NON_GST}>Non-GST Only</option>
            </select>
         </div>

         <button 
           onClick={() => { setStartDate(''); setEndDate(''); setTypeFilter('all'); }}
           className="text-xs text-violet-600 font-bold hover:underline ml-auto"
         >
           Reset All Filters
         </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border-2 border-violet-100 shadow-lg">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-gray-900">{editId ? 'Edit Entry' : 'Add Entry'}</h3>
             <button onClick={() => { setShowAddForm(false); setEditId(null); }}><X size={20}/></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            {accountId === 'all' && (
               <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Account</label>
                <select 
                  value={formData.accountId}
                  onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                  className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {bankConfigs.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Particulars</label>
              <input 
                type="text" 
                required
                placeholder="Description"
                value={formData.particulars}
                onChange={(e) => setFormData({...formData, particulars: e.target.value})}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as TransactionType})}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value={TransactionType.GST}>GST</option>
                <option value={TransactionType.NON_GST}>Non-GST</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Payment In</label>
              <input 
                type="number" 
                placeholder="0"
                value={formData.paymentIn || ''}
                disabled={formData.paymentOut > 0}
                onChange={(e) => setFormData({...formData, paymentIn: Number(e.target.value)})}
                className={`w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 ${formData.paymentOut > 0 ? 'bg-gray-100' : ''}`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Payment Out</label>
              <input 
                type="number" 
                placeholder="0"
                value={formData.paymentOut || ''}
                disabled={formData.paymentIn > 0}
                onChange={(e) => setFormData({...formData, paymentOut: Number(e.target.value)})}
                className={`w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 ${formData.paymentIn > 0 ? 'bg-gray-100' : ''}`}
              />
            </div>
            <div className="lg:col-span-6 flex justify-end space-x-3 mt-2">
              <button 
                type="button" 
                onClick={() => { setShowAddForm(false); setEditId(null); }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold"
              >
                {editId ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                {accountId === 'all' && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Source</th>}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Particulars</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Payment In</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Payment Out</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={accountId === 'all' ? 8 : 7} className="px-6 py-12 text-center text-gray-400 italic">
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((t) => (
                  <tr key={t.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600 font-medium">
                      {formatDate(t.date)}
                    </td>
                    {accountId === 'all' && (
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-violet-700 font-semibold uppercase">
                        {bankConfigs.find(b => b.id === t.accountId)?.name}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {t.particulars}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        t.type === TransactionType.GST ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap font-semibold text-green-600">
                      {t.paymentIn > 0 ? formatCurrency(t.paymentIn) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap font-semibold text-red-600">
                      {t.paymentOut > 0 ? formatCurrency(t.paymentOut) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap font-bold text-gray-900">
                      {formatCurrency(t.runningBalance)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button 
                          onClick={() => handleEdit(t)}
                          className="text-violet-600 hover:text-violet-900"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(t.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredAndSorted.length > 0 && (
              <tfoot className="bg-gray-50 border-t font-bold">
                <tr>
                  <td colSpan={accountId === 'all' ? 4 : 3} className="px-6 py-4 text-right text-gray-500 uppercase text-xs">Total for Selection</td>
                  <td className="px-6 py-4 text-right text-green-700">
                    {formatCurrency(filteredAndSorted.reduce((sum, t) => sum + t.paymentIn, 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-red-700">
                    {formatCurrency(filteredAndSorted.reduce((sum, t) => sum + t.paymentOut, 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900 bg-gray-100">
                    {formatCurrency(filteredAndSorted[filteredAndSorted.length - 1].runningBalance)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
