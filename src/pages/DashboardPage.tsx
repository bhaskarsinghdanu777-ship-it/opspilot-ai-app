import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { dashboardMetrics } from '@/src/lib/mock-data/overview';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { RevenueTrendChart } from '@/src/components/charts/RevenueTrendChart';
import { SalesCategoryChart } from '@/src/components/charts/SalesCategoryChart';
import { InventoryAlertsTable } from '@/src/components/dashboard/InventoryAlertsTable';
import { AiInsightCard } from '@/src/components/dashboard/AiInsightCard';
import { RecommendedActions } from '@/src/components/dashboard/RecommendedActions';
import { useRouter } from '@/src/lib/router';
import { Calendar, RefreshCw, Database, Sparkles } from 'lucide-react';
import { seedBusinessData, checkHasBusinessData } from '@/src/services/seedData';

export const DashboardPage: React.FC = () => {
  const { user, business } = useAuth();
  const { navigate } = useRouter();
  const [hasData, setHasData] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkHasBusinessData(user.uid).then((exists) => {
        setHasData(exists);
      });
    }
  }, [user]);

  const handleSeed = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await seedBusinessData(user.uid, business?.id || `biz_${user.uid.slice(0, 10)}`);
      setHasData(true);
      setSeedNotice('Workspace successfully seeded with NovaMart retail telemetry!');
    } catch (err) {
      console.error('Error seeding data:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const businessName = business?.name || 'NovaMart Electronics';

  return (
    <div id="page-dashboard" className="space-y-6">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Operations Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry and diagnostics for <strong className="text-slate-700">{businessName}</strong> (September 2026)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>01 Sep - 05 Sep, 2026</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-800 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firestore Linked</span>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
            title="Refresh overview metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fresh Account Seed Banner (if no data) */}
      {!hasData && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Welcome to your new business workspace! Initialize Firestore with sample catalogue, sales, and analytics.
            </span>
          </div>
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer transition-colors shrink-0 disabled:opacity-50"
          >
            {isSeeding ? 'Seeding Firestore...' : 'Populate Demo Data'}
          </button>
        </div>
      )}

      {seedNotice && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{seedNotice}</span>
        </div>
      )}

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Revenue Card */}
        <StatCard
          id="stat-card-revenue"
          title={dashboardMetrics.revenue.title}
          value={dashboardMetrics.revenue.value}
          change={dashboardMetrics.revenue.change}
          isPositive={dashboardMetrics.revenue.isPositive}
          subtext={dashboardMetrics.revenue.comparison}
          onClick={() => navigate('/sales')}
        />

        {/* 2. Orders Card */}
        <StatCard
          id="stat-card-orders"
          title={dashboardMetrics.orders.title}
          value={dashboardMetrics.orders.value}
          change={dashboardMetrics.orders.change}
          isPositive={dashboardMetrics.orders.isPositive}
          subtext={dashboardMetrics.orders.comparison}
          onClick={() => navigate('/sales')}
        />

        {/* 3. Estimated Profit Card */}
        <StatCard
          id="stat-card-profit"
          title={dashboardMetrics.profit.title}
          value={dashboardMetrics.profit.value}
          change={dashboardMetrics.profit.change}
          isPositive={dashboardMetrics.profit.isPositive}
          subtext={dashboardMetrics.profit.comparison}
          onClick={() => navigate('/expenses')}
        />

        {/* 4. Alerts Card */}
        <StatCard
          id="stat-card-alerts"
          title={dashboardMetrics.alerts.title}
          value={dashboardMetrics.alerts.value}
          subtext={dashboardMetrics.alerts.subtext}
          critical={true}
          onClick={() => navigate('/inventory')}
        />
      </div>

      {/* AI Insight Card */}
      <AiInsightCard />

      {/* Charts Grid: Revenue Trend & Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>
        <div>
          <SalesCategoryChart />
        </div>
      </div>

      {/* Inventory Alerts & Recommended Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <InventoryAlertsTable />
        </div>
        <div className="lg:col-span-2">
          <RecommendedActions />
        </div>
      </div>
    </div>
  );
};
