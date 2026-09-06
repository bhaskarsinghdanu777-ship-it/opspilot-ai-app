import React, { useState } from 'react';
import { revenueTrendData } from '@/src/lib/mock-data/overview';

export const RevenueTrendChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = 1100000;
  const height = 220;
  const width = 600;
  const padLeft = 70;
  const padRight = 20;
  const padBottom = 30;
  const padTop = 20;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (index: number) => padLeft + (index / (revenueTrendData.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - (val / maxVal) * chartH;

  const currentPoints = revenueTrendData
    .map((d, i) => `${getX(i)},${getY(d.current)}`)
    .join(' ');

  const prevPoints = revenueTrendData
    .map((d, i) => `${getX(i)},${getY(d.previous)}`)
    .join(' ');

  return (
    <div id="revenue-trend-chart-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Revenue Performance Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly gross turnover vs previous year benchmark</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 rounded-full inline-block"></span>
            <span className="text-slate-700 font-medium">FY26 Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-300 border-b border-dashed border-slate-400 inline-block"></span>
            <span className="text-slate-500">Benchmark Target</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Y-axis gridlines */}
          {[0, 250000, 500000, 750000, 1000000].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick} className="text-xs text-slate-400">
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  ₹{(tick / 100000).toFixed(1)}L
                </text>
              </g>
            );
          })}

          {/* Benchmark Line */}
          <polyline
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="4 4"
            points={prevPoints}
          />

          {/* Current Period Line */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={currentPoints}
          />

          {/* Data Points */}
          {revenueTrendData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.current);
            const isHovered = hoveredIdx === i;
            const isLast = i === revenueTrendData.length - 1;

            return (
              <g
                key={d.month}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={padTop + chartH}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : isLast ? 4.5 : 3.5}
                  fill={isLast ? '#ef4444' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* X-axis label */}
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[11px] ${
                    isLast
                      ? 'fill-red-600 font-semibold'
                      : isHovered
                      ? 'fill-blue-600 font-medium'
                      : 'fill-slate-500'
                  }`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10 flex items-center gap-3 border border-slate-700"
          >
            <div>
              <div className="text-[10px] text-slate-400 font-medium">
                {revenueTrendData[hoveredIdx].month}
              </div>
              <div className="font-semibold text-slate-100">
                ₹{revenueTrendData[hoveredIdx].current.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="border-l border-slate-700 pl-2">
              <div className="text-[10px] text-slate-400">Benchmark</div>
              <div className="text-slate-300 font-mono">
                ₹{revenueTrendData[hoveredIdx].previous.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="border-l border-slate-700 pl-2">
              <div className="text-[10px] text-slate-400">Variance</div>
              <div
                className={`font-semibold ${
                  revenueTrendData[hoveredIdx].current >=
                  revenueTrendData[hoveredIdx].previous
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {(
                  ((revenueTrendData[hoveredIdx].current -
                    revenueTrendData[hoveredIdx].previous) /
                    revenueTrendData[hoveredIdx].previous) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 text-rose-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          September down ₹1,46,000 vs August (-14.8%)
        </span>
        <span className="text-slate-400">Data synchronized from Store POS & Online</span>
      </div>
    </div>
  );
};
