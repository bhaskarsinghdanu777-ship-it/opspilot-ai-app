import React from 'react';
import { salesByCategoryData } from '@/src/lib/mock-data/overview';

export const SalesCategoryChart: React.FC = () => {
  return (
    <div id="sales-by-category-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-900">Sales by Category</h3>
          <span className="text-xs font-mono text-slate-500">₹8,42,000 Total</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Volume distribution across product verticals</p>

        {/* Multi-segment stacked bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-5">
          {salesByCategoryData.map((cat) => (
            <div
              key={cat.category}
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
              title={`${cat.category}: ${cat.percentage}%`}
              className="h-full transition-all duration-300"
            />
          ))}
        </div>

        {/* Detailed breakdown list */}
        <div className="space-y-3">
          {salesByCategoryData.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-slate-700 truncate">{cat.category}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-slate-500 font-mono">
                  ₹{cat.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-900 font-semibold w-8 text-right font-mono">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Dominant: Electronics</span>
        <span className="text-amber-600 font-medium">Electronics dropped 21% MoM</span>
      </div>
    </div>
  );
};
