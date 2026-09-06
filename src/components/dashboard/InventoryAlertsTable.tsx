import React from 'react';
import { inventoryAlerts } from '@/src/lib/mock-data/overview';
import { AlertCircle } from 'lucide-react';
import { useRouter } from '@/src/lib/router';

export const InventoryAlertsTable: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div id="dashboard-inventory-alerts-card" className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>Inventory Stockout Alerts</span>
        </h3>
        <button
          onClick={() => navigate('/inventory')}
          className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
        >
          Manage Inventory &rarr;
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-center">Stock</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Recommended Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
            {inventoryAlerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-800">
                  {alert.product}
                </td>
                <td className="px-5 py-3 text-slate-500">{alert.category}</td>
                <td className="px-5 py-3 text-center font-mono font-semibold text-slate-900">
                  {alert.stock}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                      alert.status === 'Out of Stock'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
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
      </div>
    </div>
  );
};
