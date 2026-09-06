import React, { useState } from 'react';
import { salesDailyTrend } from '@/src/lib/mock-data/sales';

export const SalesTrendChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxSales = 200000;
  const height = 180;
  const width = 580;
  const padLeft = 60;
  const padRight = 20;
  const padBottom = 30;
  const padTop = 15;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const barWidth = 28;

  return (
    <div id="sales-trend-chart-component" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Weekly Sales Velocity (Daily Breakdown)</h3>
          <p className="text-xs text-slate-500">Gross revenue generated per day across store and online channels</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-blue-600 rounded-xs inline-block"></span>
            <span className="text-slate-600">Daily Revenue (₹)</span>
          </div>
          <div className="text-slate-400 font-mono">Total: ₹8,42,000</div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Y Axis Gridlines */}
          {[0, 50000, 100000, 150000, 200000].map((val) => {
            const y = padTop + chartH - (val / maxSales) * chartH;
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  ₹{(val / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {salesDailyTrend.map((d, i) => {
            const step = chartW / salesDailyTrend.length;
            const x = padLeft + i * step + (step - barWidth) / 2;
            const barH = (d.sales / maxSales) * chartH;
            const y = padTop + chartH - barH;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.day}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="3"
                  className={`transition-colors ${
                    isHovered ? 'fill-blue-700' : 'fill-blue-600'
                  }`}
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[11px] ${
                    isHovered ? 'fill-blue-600 font-semibold' : 'fill-slate-500 font-medium'
                  }`}
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && (
          <div className="absolute top-2 right-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md shadow-md border border-slate-700 flex items-center gap-3">
            <span className="font-semibold text-slate-200">{salesDailyTrend[hoveredIdx].day}:</span>
            <span className="font-mono text-emerald-400 font-bold">
              ₹{salesDailyTrend[hoveredIdx].sales.toLocaleString('en-IN')}
            </span>
            <span className="text-slate-400 text-[11px]">
              ({salesDailyTrend[hoveredIdx].orders} orders)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
