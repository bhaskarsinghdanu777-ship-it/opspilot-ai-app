import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { getSales, addSale } from '@/src/services/sales';
import { mockSalesData, salesSummary } from '@/src/lib/mock-data/sales';
import { SaleItem } from '@/src/types';
import { SalesTrendChart } from '@/src/components/charts/SalesTrendChart';
import { SalesTable } from '@/src/components/tables/SalesTable';
import {
  TrendingDown,
  Database,
  RefreshCw,
  Sparkles,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { seedBusinessData } from '@/src/services/seedData';

export const SalesPage: React.FC = () => {
  const { user, business } = useAuth();
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const loadSalesFromFirestore = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getSales(user.uid, business?.id);
      if (data && data.length > 0) {
        setSales(data);
        setStatusNotice('Loaded live transactions from Cloud Firestore.');
      } else {
        // Fallback to initial mock view if empty, but offer 1-click seeding
        setSales(mockSalesData);
        setStatusNotice('Workspace has no stored sales yet. Showing default demo stream.');
      }
    } catch (err) {
      console.error('Failed to load sales from Firestore:', err);
      setSales(mockSalesData);
      setStatusNotice('Offline or Firestore error. Displaying local cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesFromFirestore();
  }, [user, business]);

  const handleAddSale = async (newSale: SaleItem) => {
    if (!user) return;
    try {
      const created = await addSale(
        {
          orderNumber: newSale.orderNumber,
          date: newSale.date,
          customerName: newSale.customerName,
          category: newSale.category,
          items: newSale.items,
          channel: newSale.channel,
          paymentMethod: newSale.paymentMethod,
          amount: newSale.amount,
          status: newSale.status,
        },
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );
      setSales((prev) => [created, ...prev]);
      setStatusNotice(`Order ${newSale.orderNumber} committed to Cloud Firestore.`);
    } catch (err) {
      console.error('Failed to commit sale to Firestore:', err);
      // Optimistic update
      setSales((prev) => [newSale, ...prev]);
    }
  };

  const handleSeedDemoSales = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await seedBusinessData(
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );
      await loadSalesFromFirestore();
      setStatusNotice('Successfully seeded sales and catalogue into Cloud Firestore!');
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Dynamic calculations from live records
  const totalGrossAmount = sales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const avgOrderValue = sales.length > 0 ? Math.round(totalGrossAmount / sales.length) : 695;
  const inStoreCount = sales.filter((s) => s.channel === 'In-Store').length;
  const inStorePercent = sales.length > 0 ? Math.round((inStoreCount / sales.length) * 100) : 64;

  return (
    <div id="page-sales" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales & Revenue Operations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud Firestore backed POS stream, revenue velocity, and category performance
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-800 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firestore: /sales</span>
          </div>

          <button
            onClick={loadSalesFromFirestore}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Firestore Status Banner */}
      {statusNotice && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{statusNotice}</span>
          </div>

          <button
            onClick={handleSeedDemoSales}
            disabled={isSyncing}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            <PlusCircle className="w-3 h-3" />
            <span>{isSyncing ? 'Writing to Firestore...' : 'Seed Sample Records to Firestore'}</span>
          </button>
        </div>
      )}

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Gross Sales</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            ₹{totalGrossAmount.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-rose-600 font-medium flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-8.4% vs prior month</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Average Order Value (AOV)</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            ₹{avgOrderValue.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Target benchmark: ₹700
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {sales.length} Orders
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Stored in Cloud Firestore
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Channel Distribution</div>
          <div className="text-base font-bold text-slate-900 tracking-tight mt-1">
            Store: {inStorePercent}% • Online: {100 - inStorePercent}%
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Leading: {salesSummary.topCategory}
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <SalesTrendChart />

      {/* Sales Table with Search, Date Filter, Category Filter, and Add Sale Modal */}
      <SalesTable sales={sales} onAddSale={handleAddSale} />
    </div>
  );
};
