import React, { useState, useMemo } from 'react';
import { ExpenseItem, ExpenseCategory } from '@/src/types';
import { Search, Plus, ReceiptText, Tag } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';

interface ExpensesTableProps {
  expenses: ExpenseItem[];
  onAddExpense: (expense: ExpenseItem) => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({ expenses, onAddExpense }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New expense form
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Suppliers');
  const [newAmount, setNewAmount] = useState('');
  const [newVendor, setNewVendor] = useState('');

  const categories: ('All' | ExpenseCategory)[] = [
    'All',
    'Rent',
    'Marketing',
    'Shipping',
    'Suppliers',
    'Utilities',
    'Salary',
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'All' || exp.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount || !newVendor) return;

    const newExpItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      date: 'Today, 05 Sep',
      category: newCategory,
      description: newDesc,
      amount: parseFloat(newAmount),
      vendor: newVendor,
      status: 'Paid',
    };

    onAddExpense(newExpItem);
    setIsAddModalOpen(false);
    setNewDesc('');
    setNewAmount('');
    setNewVendor('');
  };

  const getCategoryBadgeClass = (category: ExpenseCategory) => {
    switch (category) {
      case 'Rent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Salary':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Suppliers':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Marketing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Shipping':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Utilities':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="expenses-management-table" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="expense-search-input"
              type="text"
              placeholder="Search by description or vendor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <select
            id="expense-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        <button
          id="btn-add-expense"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Vendor / Payee</th>
              <th className="py-3 px-4 text-right">Amount (₹)</th>
              <th className="py-3 px-4 text-center">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No expenses recorded matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{exp.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getCategoryBadgeClass(
                        exp.category
                      )}`}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{exp.description}</td>
                  <td className="py-3 px-4 text-slate-600">{exp.vendor}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <span>Showing {filteredExpenses.length} expense entries</span>
        <span className="font-mono font-bold text-slate-800">
          Filtered Subtotal: ₹
          {filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
        </span>
      </div>

      {/* Record Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Operating Expense"
        subtitle="Log operational overhead for NovaMart Electronics"
      >
        <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Expense Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Fiber broadband monthly bill"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="Rent">Rent</option>
                <option value="Marketing">Marketing</option>
                <option value="Shipping">Shipping</option>
                <option value="Suppliers">Suppliers</option>
                <option value="Utilities">Utilities</option>
                <option value="Salary">Salary</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="4500"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Vendor / Payee</label>
            <input
              type="text"
              required
              placeholder="e.g. Airtel Broadband India"
              value={newVendor}
              onChange={(e) => setNewVendor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              Record Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
