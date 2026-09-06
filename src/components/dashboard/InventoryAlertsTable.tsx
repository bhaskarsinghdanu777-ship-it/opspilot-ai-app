import React from 'react';
import { inventoryAlerts } from '@/src/lib/mock-data/overview';
import { ProductItem } from '@/src/types';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from '@/src/lib/router';

interface InventoryAlertsTableProps {
  products?: ProductItem[];
  isLoading?: boolean;
}

export const InventoryAlertsTable: React.FC<InventoryAlertsTableProps> = ({
  products,
  isLoading,
}) => {
  const { navigate } = useRouter();

  // Compute live alerts if products are supplied
  const alertsToDisplay = React.useMemo(() => {
    if (!products) return inventoryAlerts;

    const criticalProducts = products.filter(
      (p) => p.stock === 0 || p.stock <= p.threshold
    );

    // Sort: Out of stock first, then lowest stock
    criticalProducts.sort((a, b) => {
      if (a.stock === 0 && b.stock !== 0) return -1;
      if (b.stock === 0 && a.stock !== 0) return 1;
      return a.stock - b.stock;
    });

    return criticalProducts.map((p) => ({
      id: p.id,
      product: p.name,
      sku: p.sku,
      category: p.category,
      stock: p.stock,
      threshold: p.threshold,
      status: (p.stock === 0 ? 'Out of Stock' : 'Low Stock') as 'Out of Stock' | 'Low Stock' | 'Normal',
      action:
        p.stock === 0
          ? `Priority restock (Supplier lead: ${p.supplierLeadTimeDays || 4}d)`
          : `Restock to target buffer (${p.threshold * 2} units)`,
      urgency: (p.stock === 0 ? 'high' : 'medium') as 'high' | 'medium',
    }));
  }, [products]);

  if (isLoading) {
    return (
      <div id="dashboard-inventory-alerts-card" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-100 rounded w-1/3"></div>
          <div className="h-24 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-inventory-alerts-card" className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <h3 className="font-bold text-slate-800 text-sm">
            Inventory Stockout & Buffer Alerts
          </h3>
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            {alertsToDisplay.length} Requiring Action
          </span>
        </div>
        <button
          onClick={() => navigate('/inventory')}
          className="text-xs text-blue-600 font-semibold hover:text-blue-700 cursor-pointer flex items-center gap-1"
        >
          <span>Manage Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        {alertsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <p className="font-semibold text-slate-800 text-sm">All Inventory Levels Stable</p>
            <p className="text-slate-500">Every catalog item is currently above its minimum safety threshold.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3">Product & SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-center">Stock / Threshold</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Recommended Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {alertsToDisplay.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-800">{alert.product}</div>
                    {(alert as any).sku && (
                      <div className="text-[10px] font-mono text-slate-400">SKU: {(alert as any).sku}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{alert.category}</td>
                  <td className="px-5 py-3 text-center font-mono font-semibold text-slate-900">
                    <span className={alert.stock === 0 ? 'text-rose-600 font-bold' : 'text-amber-700'}>
                      {alert.stock}
                    </span>
                    <span className="text-slate-400 font-normal"> / {(alert as any).threshold || 15}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                        alert.status === 'Out of Stock'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 font-medium">
                    {alert.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
