import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { getExpenses, addExpense } from '@/src/services/expenses';
import { mockExpensesData, expenseSummary, expenseCategoryBreakdown } from '@/src/lib/mock-data/expenses';
import { ExpenseItem } from '@/src/types';
import { ExpensesTable } from '@/src/components/tables/ExpensesTable';
import {
  TrendingUp,
  Landmark,
  Database,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { seedBusinessData } from '@/src/services/seedData';

export const ExpensesPage: React.FC = () => {
  const { user, business } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const loadExpenses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getExpenses(user.uid, business?.id);
      if (data && data.length > 0) {
        setExpenses(data);
        setStatusNotice('Loaded active expenses from Cloud Firestore.');
      } else {
        setExpenses(mockExpensesData);
        setStatusNotice('Showing starter operating expenses. Firestore collection empty.');
      }
    } catch (err) {
      console.error('Failed to load expenses from Firestore:', err);
      setExpenses(mockExpensesData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [user, business]);

  const handleAddExpense = async (newExp: ExpenseItem) => {
    if (!user) return;
    try {
      const created = await addExpense(
        {
          date: newExp.date,
          category: newExp.category,
          description: newExp.description,
          amount: newExp.amount,
          vendor: newExp.vendor,
          status: newExp.status,
        },
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );

      setExpenses((prev) => [created, ...prev]);
      setStatusNotice(`Expense "${newExp.description}" committed to Cloud Firestore.`);
    } catch (err) {
      console.error('Failed to commit expense to Firestore:', err);
      setExpenses((prev) => [newExp, ...prev]);
    }
  };

  const handleSeedDemoExpenses = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await seedBusinessData(
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );
      await loadExpenses();
      setStatusNotice('Expense ledger successfully seeded to Cloud Firestore!');
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div id="page-expenses" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Expense Operations & Overhead</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud Firestore backed operating costs, showroom lease, and supplier disbursements
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-800 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firestore: /expenses</span>
          </div>

          <button
            onClick={loadExpenses}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Firestore Status Bar */}
      {statusNotice && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{statusNotice}</span>
          </div>

          <button
            onClick={handleSeedDemoExpenses}
            disabled={isSyncing}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? 'Writing expenses to Firestore...' : 'Seed Sample Expenses to Firestore'}
          </button>
        </div>
      )}

      {/* 3 Core Expense Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Total Expenses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Operating Expenses (Logged)</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            ₹{totalExpenseAmount.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {expenses.length} records in Cloud Firestore
          </div>
        </div>

        {/* 2. Monthly Expenses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Monthly Expenses (September)</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {expenseSummary.monthlyExpenses}
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{expenseSummary.monthOverMonthChange} vs August</span>
          </div>
        </div>

        {/* 3. Largest Expense Category */}
        <div className="bg-white border border-blue-200 bg-blue-50/20 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-900 font-medium mb-1">
            <span>Largest Expense Category</span>
            <Landmark className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-950 font-mono tracking-tight">
            {expenseSummary.largestCategory}
          </div>
          <div className="mt-2 text-xs text-blue-800">
            Commercial showroom lease in Indiranagar
          </div>
        </div>
      </div>

      {/* Category Breakdown Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Expense Category Distribution (September)
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Total Month: ₹1,48,000
          </span>
        </div>

        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-4">
          {expenseCategoryBreakdown.map((item) => (
            <div
              key={item.category}
              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              title={`${item.category}: ${item.percentage}%`}
              className="h-full transition-all duration-300"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {expenseCategoryBreakdown.map((item) => (
            <div key={item.category} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-800">{item.category}</span>
              </div>
              <div className="font-mono text-slate-900 font-bold">
                ₹{item.amount.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <ExpensesTable expenses={expenses} onAddExpense={handleAddExpense} />
    </div>
  );
};
