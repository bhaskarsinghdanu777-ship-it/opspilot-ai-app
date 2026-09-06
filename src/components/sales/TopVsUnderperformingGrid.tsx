import React from 'react';
import { SaleItem, ProductItem } from '@/src/types';
import { TrendingUp, TrendingDown, Package, Sparkles, AlertTriangle } from 'lucide-react';

interface TopVsUnderperformingGridProps {
  sales: SaleItem[];
  products?: ProductItem[];
}

export const TopVsUnderperformingGrid: React.FC<TopVsUnderperformingGridProps> = ({
  sales,
  products = [],
}) => {
  // 1. Calculate revenue and units by product name / item string from sales
  const itemPerformanceMap: Record<string, { name: string; revenue: number; orders: number; category: string }> = {};

  sales.forEach((s) => {
    const itemName = s.items || 'Unknown Item';
    if (!itemPerformanceMap[itemName]) {
      itemPerformanceMap[itemName] = {
        name: itemName,
        revenue: 0,
        orders: 0,
        category: s.category || 'General',
      };
    }
    itemPerformanceMap[itemName].revenue += s.amount || 0;
    itemPerformanceMap[itemName].orders += 1;
  });

  const sortedItems = Object.values(itemPerformanceMap).sort((a, b) => b.revenue - a.revenue);

  // Top performers
  const topItems = sortedItems.slice(0, 3);

  // Underperforming items (either lowest in sales or products marked low velocity / 0 stock)
  const lowVelocityProducts = products.filter(
    (p) => p.salesVelocity === 'Low' || (p.salesVelocity === 'Medium' && p.stock > 40)
  );

  const underperformingItems =
    sortedItems.length > 3
      ? sortedItems.slice(-3).reverse()
      : lowVelocityProducts.slice(0, 3).map((p) => ({
          name: p.name,
          revenue: p.price * 2,
          orders: 2,
          category: p.category,
        }));

  return (
    <div id="sales-top-vs-underperforming-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top Performers Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Top-Selling Items
              </h3>
              <p className="text-[11px] text-slate-500">Highest grossing products by sales volume</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            High Velocity
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {topItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No sales recorded yet.</p>
          ) : (
            topItems.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.category} • {item.orders} orders</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2 font-mono">
                  <span className="text-xs font-bold text-slate-900">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Underperforming Items Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Underperforming / Slow-Moving
              </h3>
              <p className="text-[11px] text-slate-500">Low turnover velocity or lagging revenue contribution</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Action Needed
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {underperformingItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">All inventory items meeting sales velocity goals.</p>
          ) : (
            underperformingItems.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                    !
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.category} • {item.orders} orders</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[9px] text-amber-700 font-semibold">Consider bundle promo</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
