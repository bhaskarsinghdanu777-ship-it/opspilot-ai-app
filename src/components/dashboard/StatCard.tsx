import React from 'react';
import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  critical?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  change,
  isPositive,
  subtext,
  critical,
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all ${
        onClick ? 'hover:border-slate-300 cursor-pointer' : ''
      }`}
    >
      {critical && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 -mr-8 -mt-8 rounded-full pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        {onClick && (
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        )}
      </div>

      <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
        {value}
      </div>

      {change ? (
        <div
          className={`text-xs font-medium mt-1 flex items-center gap-1 ${
            isPositive ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3 shrink-0" />
          ) : (
            <TrendingDown className="w-3 h-3 shrink-0" />
          )}
          <span>{change}</span>
          {subtext && <span className="text-slate-400 font-normal">vs last period</span>}
        </div>
      ) : critical ? (
        <div className="text-xs font-medium text-red-600 mt-1 uppercase tracking-tighter">
          {subtext || '3 Critical Actions Required'}
        </div>
      ) : (
        subtext && <div className="text-xs text-slate-400 mt-1 font-normal">{subtext}</div>
      )}
    </div>
  );
};
