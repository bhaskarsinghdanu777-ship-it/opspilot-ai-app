import React, { useState, useMemo } from 'react';
import { ProductItem, InventoryStatus } from '@/src/types';
import {
  Search,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  PackagePlus,
  Filter,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';

interface InventoryTableProps {
  products: ProductItem[];
  onRestock: (productId: string, units: number) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onRestock,
  statusFilter: externalStatusFilter,
  onStatusFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalStatusFilter, setInternalStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [restockItem, setRestockItem] = useState<ProductItem | null>(null);
  const [restockUnits, setRestockUnits] = useState('25');

  const currentStatusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;

  const setStatus = (val: string) => {
    if (onStatusFilterChange) {
      onStatusFilterChange(val);
    } else {
      setInternalStatusFilter(val);
    }
  };

  const categories = ['All', 'Accessories', 'Audio', 'Electronics', 'Computing', 'Mobile Gear'];

  // Status counts
  const countTotal = products.length;
  const countOut = products.filter((p) => p.stock === 0 || p.status === 'Out of Stock').length;
  const countLow = products.filter((p) => p.stock > 0 && (p.stock <= p.threshold || p.status === 'Low Stock')).length;
  const countHealthy = products.filter((p) => p.stock > p.threshold && p.status !== 'Out of Stock').length;
  const countAttention = countOut + countLow;

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (currentStatusFilter === 'Out of Stock') {
        matchesStatus = item.stock === 0 || item.status === 'Out of Stock';
      } else if (currentStatusFilter === 'Low Stock') {
        matchesStatus = item.stock > 0 && (item.stock <= item.threshold || item.status === 'Low Stock');
      } else if (currentStatusFilter === 'Normal' || currentStatusFilter === 'Healthy') {
        matchesStatus = item.stock > item.threshold && item.status !== 'Out of Stock';
      } else if (currentStatusFilter === 'Needs Attention') {
        matchesStatus = item.stock === 0 || item.stock <= item.threshold;
      }

      const matchesCategory =
        categoryFilter === 'All' || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchTerm, currentStatusFilter, categoryFilter]);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;
    const units = parseInt(restockUnits, 10);
    if (!isNaN(units) && units > 0) {
      onRestock(restockItem.id, units);
    }
    setRestockItem(null);
  };

  return (
    <div id="inventory-management-table" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Quick Filter Status Strip */}
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Quick Filter:
          </span>

          <button
            type="button"
            onClick={() => setStatus('All')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentStatusFilter === 'All'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All SKUs ({countTotal})
          </button>

          <button
            type="button"
            onClick={() => setStatus('Needs Attention')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              currentStatusFilter === 'Needs Attention'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Needs Attention ({countAttention})
          </button>

          <button
            type="button"
            onClick={() => setStatus('Out of Stock')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              currentStatusFilter === 'Out of Stock'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertOctagon className="w-3 h-3" />
            Out of Stock ({countOut})
          </button>

          <button
            type="button"
            onClick={() => setStatus('Low Stock')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              currentStatusFilter === 'Low Stock'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Low Stock ({countLow})
          </button>

          <button
            type="button"
            onClick={() => setStatus('Normal')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              currentStatusFilter === 'Normal' || currentStatusFilter === 'Healthy'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Healthy Inventory ({countHealthy})
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Showing {filteredProducts.length} of {products.length} SKUs
        </div>
      </div>

      {/* Table Toolbar */}
      <div className="p-3.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="inventory-search-input"
              type="text"
              placeholder="Search by product name or SKU code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Category Filter */}
          <select
            id="inventory-category-filter"
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Product Name & SKU</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-center">Stock / Buffer</th>
              <th className="py-3 px-4">Velocity</th>
              <th className="py-3 px-4 text-center">Health Status</th>
              <th className="py-3 px-4 text-right">Operational Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  <p className="font-semibold text-slate-700 text-sm mb-1">No products match the filter</p>
                  <p className="text-xs">Adjust your search or filter options to view other items.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => {
                const isOut = prod.stock === 0 || prod.status === 'Out of Stock';
                const isLow = !isOut && (prod.stock <= prod.threshold || prod.status === 'Low Stock');

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{prod.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{prod.category}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span
                        className={`font-bold ${
                          isOut
                            ? 'text-rose-600'
                            : isLow
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {prod.stock} units
                      </span>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Threshold: {prod.threshold}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        prod.salesVelocity === 'High' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {prod.salesVelocity || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isOut
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isLow
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isOut ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : isLow ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setRestockItem(prod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          isOut
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                            : isLow
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <PackagePlus className="w-3 h-3" />
                        <span>{isOut ? 'Order Restock' : 'Adjust Stock'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Restock Modal */}
      {restockItem && (
        <Modal
          isOpen={Boolean(restockItem)}
          onClose={() => setRestockItem(null)}
          title={`Restock Product SKU: ${restockItem.name}`}
          subtitle={`Current stock: ${restockItem.stock} • Safety threshold: ${restockItem.threshold} • Supplier Lead: ${restockItem.supplierLeadTimeDays || 4} days`}
        >
          <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Units to Inbound / Receive into Inventory
              </label>
              <input
                type="number"
                min="1"
                required
                value={restockUnits}
                onChange={(e) => setRestockUnits(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Submitting updates Cloud Firestore in real time. Recommended reorder batch:{' '}
                <strong>{restockItem.threshold * 2} units</strong>.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
              >
                Confirm Restock
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
