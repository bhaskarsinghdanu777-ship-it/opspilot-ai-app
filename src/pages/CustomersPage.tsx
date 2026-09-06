import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { getCustomers, addCustomer } from '@/src/services/customers';
import { mockCustomersData, customerSummary } from '@/src/lib/mock-data/customers';
import { CustomerItem } from '@/src/types';
import { CustomersTable } from '@/src/components/tables/CustomersTable';
import {
  Users,
  UserCheck,
  Repeat,
  AlertTriangle,
  Database,
  RefreshCw,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { seedBusinessData } from '@/src/services/seedData';

export const CustomersPage: React.FC = () => {
  const { user, business } = useAuth();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredCategory, setPreferredCategory] = useState('Audio & Acoustics');

  const loadCustomers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getCustomers(user.uid, business?.id);
      if (data && data.length > 0) {
        setCustomers(data);
        setStatusNotice('Loaded active clientele from Cloud Firestore.');
      } else {
        setCustomers(mockCustomersData);
        setStatusNotice('Showing starter customer cohort. Firestore collection empty.');
      }
    } catch (err) {
      console.error('Failed to load customers from Firestore:', err);
      setCustomers(mockCustomersData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [user, business]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !email) return;

    try {
      const created = await addCustomer(
        {
          name,
          email,
          phone: phone || '+91 98000 00000',
          orders: 1,
          totalSpend: 1500,
          lastPurchase: 'Today',
          status: 'Active',
          preferredCategory,
        },
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );

      setCustomers((prev) => [created, ...prev]);
      setStatusNotice(`Customer profile "${name}" committed to Cloud Firestore.`);
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
    } catch (err) {
      console.error('Failed to add customer to Firestore:', err);
    }
  };

  const handleSeedDemoCustomers = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await seedBusinessData(
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );
      await loadCustomers();
      setStatusNotice('Customer database successfully seeded to Cloud Firestore!');
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const activeCount = customers.filter((c) => c.status === 'Active' || c.status === 'VIP').length;
  const atRiskCount = customers.filter((c) => c.status === 'At Risk').length;
  const repeatCount = customers.filter((c) => c.orders > 1).length;

  return (
    <div id="page-customers" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Cohorts & Retention</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud Firestore backed clientele tracking, lifetime value, and retention signals
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-800 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firestore: /customers</span>
          </div>

          <button
            onClick={loadCustomers}
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
            onClick={handleSeedDemoCustomers}
            disabled={isSyncing}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? 'Writing customers to Firestore...' : 'Seed Sample Customers to Firestore'}
          </button>
        </div>
      )}

      {/* 4 Customer Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Customers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Registered Customers</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {customers.length} Accounts
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Stored in Cloud Firestore
          </div>
        </div>

        {/* 2. Active Customers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Active Customers</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight text-emerald-700">
            {activeCount}
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Active / VIP clientele
          </div>
        </div>

        {/* 3. Repeat Customers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Repeat Buyers Cohort</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {repeatCount}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Accounts with &gt; 1 order
          </div>
        </div>

        {/* 4. At-Risk Customers */}
        <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium mb-1">
            <span>At-Risk Customers</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tracking-tight">
            {atRiskCount} Accounts
          </div>
          <div className="mt-2 text-xs text-amber-700">
            Inactive &gt; 60 days
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <CustomersTable customers={customers} />

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Customer Profile to Firestore"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Radhika Sharma"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="radhika@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Product Category
            </label>
            <select
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            >
              <option value="Audio & Acoustics">Audio & Acoustics</option>
              <option value="Accessories">Accessories</option>
              <option value="Electronics">Electronics</option>
              <option value="Computing & Peripherals">Computing & Peripherals</option>
              <option value="Mobile Gear">Mobile Gear</option>
            </select>
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
              Save Customer to Firestore
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
