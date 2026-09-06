import React, { useState, useMemo } from 'react';
import { ProductItem, InventoryStatus } from '@/src/types';
import { Search, AlertTriangle, AlertCircle, CheckCircle2, ArrowUpDown, PackagePlus } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';

interface InventoryTableProps {
  products: ProductItem[];
  onRestock: (productId: string, units: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ products, onRestock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [restockItem, setRestockItem] = useState<ProductItem | null>(null);
  const [restockUnits, setRestockUnits] = useState('25');

  const categories = ['All', 'Accessories', 'Audio', 'Electronics', 'Computing', 'Mobile Gear'];
  const statuses = ['All', 'Normal', 'Low Stock', 'Out of Stock'];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'All' || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchTerm, statusFilter, categoryFilter]);

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
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="inventory-search-input"
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Status Filter */}
          <select
            id="inventory-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

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

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredProducts.length} of {products.length} SKUs
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
              <th className="py-3 px-4 text-center">Available Stock</th>
              <th className="py-3 px-4">Sales Velocity</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No inventory products match your filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{prod.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{prod.sku}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{prod.category}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                    ₹{prod.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    <span
                      className={`${
                        prod.stock === 0
                          ? 'text-rose-600'
                          : prod.stock <= prod.threshold
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {prod.stock} units
                    </span>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Safety: {prod.threshold}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {prod.salesVelocity}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        prod.status === 'Normal'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : prod.status === 'Low Stock'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {prod.status === 'Normal' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : prod.status === 'Low Stock' ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {prod.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setRestockItem(prod)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                        prod.status === 'Out of Stock'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          : prod.status === 'Low Stock'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <PackagePlus className="w-3 h-3" />
                      <span>{prod.stock === 0 ? 'Restock Urgent' : 'Adjust'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Restock Modal */}
      {restockItem && (
        <Modal
          isOpen={Boolean(restockItem)}
          onClose={() => setRestockItem(null)}
          title={`Restock ${restockItem.name}`}
          subtitle={`Current stock: ${restockItem.stock} • Safety threshold: ${restockItem.threshold}`}
        >
          <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Units Received / Added to Inventory
              </label>
              <input
                type="number"
                min="1"
                required
                value={restockUnits}
                onChange={(e) => setRestockUnits(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Supplier Lead Time:</span>
                <span className="font-semibold text-slate-800">
                  {restockItem.supplierLeadTimeDays || 3} days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Inventory Value Addition:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  ₹{(parseInt(restockUnits || '0', 10) * restockItem.price).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
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
