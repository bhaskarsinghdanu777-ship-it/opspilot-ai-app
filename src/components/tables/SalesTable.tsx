import React, { useState, useMemo } from 'react';
import { SaleItem } from '@/src/types';
import { Search, Filter, Plus, Download, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';

interface SalesTableProps {
  sales: SaleItem[];
  onAddSale: (sale: SaleItem) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({ sales, onAddSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('All Time');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New sale form state
  const [newCustomer, setNewCustomer] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newAmount, setNewAmount] = useState('');
  const [newPayment, setNewPayment] = useState<'UPI' | 'Card' | 'Cash'>('UPI');
  const [newChannel, setNewChannel] = useState<'In-Store' | 'Online Store'>('In-Store');

  const categories = ['All', 'Electronics', 'Audio & Acoustics', 'Accessories', 'Computing & Peripherals', 'Mobile Gear'];
  const dateFilters = ['All Time', 'Today', 'Last 7 Days', 'This Month'];

  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      const matchesSearch =
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.items.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const matchesDate =
        selectedDateFilter === 'All Time' ||
        (selectedDateFilter === 'Today' && item.date.includes('Today')) ||
        (selectedDateFilter === 'Last 7 Days' && (item.date.includes('Today') || item.date.includes('Yesterday') || item.date.includes('03 Sep'))) ||
        (selectedDateFilter === 'This Month' && !item.date.includes('Aug'));

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [sales, searchTerm, selectedCategory, selectedDateFilter]);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer || !newAmount || !newItem) return;

    const newSaleItem: SaleItem = {
      id: `s-${Date.now()}`,
      orderNumber: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Today, Just now',
      customerName: newCustomer,
      category: newCategory,
      items: newItem,
      channel: newChannel,
      paymentMethod: newPayment,
      amount: parseFloat(newAmount),
      status: 'Completed',
    };

    onAddSale(newSaleItem);
    setIsAddModalOpen(false);
    setNewCustomer('');
    setNewItem('');
    setNewAmount('');
  };

  return (
    <div id="sales-management-panel" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="sales-search-input"
              type="text"
              placeholder="Search by customer, order #, or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="sales-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <select
            id="sales-date-filter"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {dateFilters.map((d) => (
              <option key={d} value={d}>
                Date: {d}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedDateFilter('All Time');
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Reset filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-add-sale"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sale</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Items / Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No sales match your current search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-blue-600">
                    {sale.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{sale.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{sale.customerName}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={sale.items}>
                    {sale.items}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {sale.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{sale.channel}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{sale.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{sale.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        sale.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : sale.status === 'Processing'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {sale.status === 'Completed' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <span>
          Showing {filteredSales.length} of {sales.length} transactions
        </span>
        <span className="font-mono font-semibold text-slate-700">
          Filtered Gross: ₹
          {filteredSales
            .filter((s) => s.status !== 'Refunded')
            .reduce((acc, curr) => acc + curr.amount, 0)
            .toLocaleString('en-IN')}
        </span>
      </div>

      {/* Add Sale Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Retail Sale"
        subtitle="Simulate logging a counter or online transaction into OpsPilot AI"
      >
        <form onSubmit={handleCreateSale} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Customer Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rajesh Kumar"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Items / Products Sold</label>
            <input
              type="text"
              required
              placeholder="e.g. UltraSpeed USB-C Hub 7-in-1"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option>Electronics</option>
                <option>Audio & Acoustics</option>
                <option>Accessories</option>
                <option>Computing & Peripherals</option>
                <option>Mobile Gear</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="2499"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Sales Channel</label>
              <select
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value as 'In-Store' | 'Online Store')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="In-Store">In-Store Counter</option>
                <option value="Online Store">Online Store</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={newPayment}
                onChange={(e) => setNewPayment(e.target.value as 'UPI' | 'Card' | 'Cash')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                <option value="UPI">UPI (Google Pay / PhonePe)</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash at Counter</option>
              </select>
            </div>
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
              Save Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
