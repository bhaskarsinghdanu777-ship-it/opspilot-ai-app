import React from 'react';
import { ProductItem, SaleItem, CustomerItem, ExpenseItem } from '@/src/types';
import {
  TrendingUp,
  Package,
  Users,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useRouter } from '@/src/lib/router';

interface OperationalHealthGridProps {
  sales: SaleItem[];
  products: ProductItem[];
  customers: CustomerItem[];
  expenses: ExpenseItem[];
  isLoading?: boolean;
}

export const OperationalHealthGrid: React.FC<OperationalHealthGridProps> = ({
  sales,
  products,
  customers,
  expenses,
  isLoading,
}) => {
  const { navigate } = useRouter();

  if (isLoading) {
    return (
      <div id="operational-health-loading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse h-32">
            <div className="h-4 bg-slate-100 rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // 1. Sales Health
  const totalRevenue = sales.reduce((acc, s) => acc + (s.amount || 0), 0);
  const salesCount = sales.length;
  const avgOrderValue = salesCount > 0 ? Math.round(totalRevenue / salesCount) : null;
  const salesHealthStatus =
    salesCount === 0
      ? 'Insufficient data'
      : salesCount >= 5
      ? 'Active Velocity'
      : 'Low Volume';

  // 2. Inventory Health
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;
  const healthyStock = products.filter((p) => p.stock > p.threshold).length;
  const inventoryHealthPercent =
    totalProducts > 0 ? Math.round((healthyStock / totalProducts) * 100) : null;
  const inventoryHealthStatus =
    totalProducts === 0
      ? 'Insufficient data'
      : outOfStock > 0
      ? 'Stockouts Detected'
      : lowStock > 0
      ? 'Low Stock Warning'
      : 'Optimal Balance';

  // 3. Expense & Margin Health
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const expenseToRevenueRatio =
    totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : null;
  const expenseHealthStatus =
    totalRevenue === 0 || expenses.length === 0
      ? 'Insufficient data'
      : expenseToRevenueRatio! <= 50
      ? 'High Efficiency'
      : expenseToRevenueRatio! <= 75
      ? 'Moderate Overhead'
      : 'Elevated Costs';

  // 4. Customer Base Health
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) => c.status === 'Active' || c.status === 'VIP'
  ).length;
  const customerHealthPercent =
    totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : null;
  const customerHealthStatus =
    totalCustomers === 0
      ? 'Insufficient data'
      : customerHealthPercent! >= 70
      ? 'High Engagement'
      : 'Retention At Risk';

  return (
    <div id="operational-health-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Operational Health & Stability Indicators</span>
          </h2>
          <p className="text-xs text-slate-500">
            Computed strictly from authenticated Firestore transaction logs, catalog stock, and expense ledgers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sales Health */}
        <div
          id="health-card-sales"
          onClick={() => navigate('/sales')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Sales Health</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  salesCount === 0
                    ? 'bg-slate-100 text-slate-600'
                    : salesHealthStatus === 'Active Velocity'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {salesHealthStatus}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              <div>
                <span className="font-semibold text-slate-900">{salesCount}</span> transactions logged
              </div>
              <div className="text-[11px] text-slate-500">
                {avgOrderValue !== null ? (
                  <>Avg ticket: <span className="font-medium text-slate-800">₹{avgOrderValue.toLocaleString('en-IN')}</span></>
                ) : (
                  'Insufficient data'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Inventory Health */}
        <div
          id="health-card-inventory"
          onClick={() => navigate('/inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Inventory Health</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  totalProducts === 0
                    ? 'bg-slate-100 text-slate-600'
                    : outOfStock > 0
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : lowStock > 0
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {inventoryHealthStatus}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              <div>
                <span className="font-semibold text-rose-600">{outOfStock} out of stock</span> •{' '}
                <span className="font-semibold text-amber-600">{lowStock} low</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {inventoryHealthPercent !== null ? (
                  <>{inventoryHealthPercent}% catalog within threshold</>
                ) : (
                  'Insufficient data'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Expense Efficiency */}
        <div
          id="health-card-expenses"
          onClick={() => navigate('/expenses')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Expense Efficiency</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  expenseHealthStatus === 'Insufficient data'
                    ? 'bg-slate-100 text-slate-600'
                    : expenseHealthStatus === 'High Efficiency'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {expenseHealthStatus}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              <div>
                {expenseToRevenueRatio !== null ? (
                  <>Cost-to-Sales: <span className="font-semibold text-slate-900">{expenseToRevenueRatio}%</span></>
                ) : (
                  'Cost-to-Sales: Insufficient data'
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                {expenses.length > 0 ? (
                  <>Total logged: ₹{totalExpenses.toLocaleString('en-IN')}</>
                ) : (
                  'Insufficient data'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Customer Health */}
        <div
          id="health-card-customers"
          onClick={() => navigate('/customers')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Customer Health</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  customerHealthStatus === 'Insufficient data'
                    ? 'bg-slate-100 text-slate-600'
                    : customerHealthStatus === 'High Engagement'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {customerHealthStatus}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              <div>
                <span className="font-semibold text-slate-900">{activeCustomers}</span> active client accounts
              </div>
              <div className="text-[11px] text-slate-500">
                {customerHealthPercent !== null ? (
                  <>{customerHealthPercent}% healthy engagement</>
                ) : (
                  'Insufficient cohort data'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
