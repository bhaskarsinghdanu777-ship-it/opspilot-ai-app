import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { getProducts, updateProduct, addProduct } from '@/src/services/products';
import { mockInventoryData, inventorySummary } from '@/src/lib/mock-data/inventory';
import { ProductItem } from '@/src/types';
import { InventoryTable } from '@/src/components/tables/InventoryTable';
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  Database,
  RefreshCw,
  Plus,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { seedBusinessData } from '@/src/services/seedData';

export const InventoryPage: React.FC = () => {
  const { user, business } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newThreshold, setNewThreshold] = useState('15');
  const [newLeadTime, setNewLeadTime] = useState('4');

  const loadProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getProducts(user.uid, business?.id);
      if (data && data.length > 0) {
        setProducts(data);
        setStatusNotice('Loaded active inventory from Cloud Firestore.');
      } else {
        setProducts(mockInventoryData);
        setStatusNotice('Empty Firestore products collection. Displaying starter inventory.');
      }
    } catch (err) {
      console.error('Failed to load products from Firestore:', err);
      setProducts(mockInventoryData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user, business]);

  const handleRestock = async (productId: string, units: number) => {
    const item = products.find((p) => p.id === productId);
    if (!item) return;

    const newStock = item.stock + units;
    const newStatus =
      newStock === 0
        ? 'Out of Stock'
        : newStock <= item.threshold
        ? 'Low Stock'
        : 'Normal';

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: newStock, status: newStatus } : p
      )
    );

    try {
      await updateProduct(productId, {
        stock: newStock,
        status: newStatus,
      });
      setStatusNotice(`Updated SKU ${item.sku} stock (+${units}) in Firestore.`);
    } catch (err) {
      console.error('Failed to persist restock to Firestore:', err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName || !newPrice || !newStock) return;

    const price = parseFloat(newPrice) || 0;
    const stock = parseInt(newStock, 10) || 0;
    const threshold = parseInt(newThreshold, 10) || 15;
    const status = stock === 0 ? 'Out of Stock' : stock <= threshold ? 'Low Stock' : 'Normal';

    try {
      const created = await addProduct(
        {
          name: newName,
          sku: newSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          category: newCategory,
          price,
          stock,
          threshold,
          salesVelocity: stock > 30 ? 'High' : 'Medium',
          status,
          supplierLeadTimeDays: parseInt(newLeadTime, 10) || 4,
        },
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );

      setProducts((prev) => [created, ...prev]);
      setStatusNotice(`Product "${newName}" added to Firestore catalogue.`);
      setIsAddModalOpen(false);
      setNewName('');
      setNewSku('');
      setNewPrice('');
      setNewStock('');
    } catch (err) {
      console.error('Failed to add product to Firestore:', err);
    }
  };

  const handleSeedDemoInventory = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await seedBusinessData(
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );
      await loadProducts();
      setStatusNotice('Successfully synchronized catalogue to Cloud Firestore!');
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'Out of Stock').length;
  const totalValuation = products.reduce((acc, p) => acc + p.price * p.stock, 0);

  return (
    <div id="page-inventory" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory & Stock Operations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud Firestore backed SKU telemetry, safety thresholds, and restock actions
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add SKU</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-800 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firestore: /products</span>
          </div>

          <button
            onClick={loadProducts}
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
            onClick={handleSeedDemoInventory}
            disabled={isSyncing}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? 'Writing catalogue to Firestore...' : 'Seed Sample SKUs to Firestore'}
          </button>
        </div>
      )}

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Products */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Active SKUs</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {products.length} Products
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Stored in Cloud Firestore
          </div>
        </div>

        {/* 2. Inventory Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Inventory Valuation</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            ₹{totalValuation > 0 ? totalValuation.toLocaleString('en-IN') : inventorySummary.inventoryValue}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Turnover: {inventorySummary.turnoverRate}
          </div>
        </div>

        {/* 3. Low-Stock Count */}
        <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium mb-1">
            <span>Low-Stock Count</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tracking-tight">
            {lowStockCount} Items
          </div>
          <div className="mt-2 text-xs text-amber-700">
            Stock &le; safety threshold
          </div>
        </div>

        {/* 4. Out-of-Stock Count */}
        <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-800 font-medium mb-1">
            <span>Out-of-Stock Count</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono tracking-tight">
            {outOfStockCount} Items
          </div>
          <div className="mt-2 text-xs text-rose-700 font-medium">
            Requires supplier reorder
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable products={products} onRestock={handleRestock} />

      {/* Add SKU Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Product SKU to Firestore"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. 65W GaN Fast Charger"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU Code
              </label>
              <input
                type="text"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
                placeholder="e.g. ACC-GAN-001"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              >
                <option value="Accessories">Accessories</option>
                <option value="Audio">Audio</option>
                <option value="Electronics">Electronics</option>
                <option value="Computing">Computing</option>
                <option value="Mobile Gear">Mobile Gear</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="1499"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="40"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Threshold
              </label>
              <input
                type="number"
                min="1"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              Save Product to Firestore
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
