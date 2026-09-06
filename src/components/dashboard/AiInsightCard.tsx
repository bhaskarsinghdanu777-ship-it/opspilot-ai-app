import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from '@/src/lib/router';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { getLatestCachedAnalysis } from '@/src/services/geminiAi';
import { AiAnalysis, ProductItem, SaleItem } from '@/src/types';

interface AiInsightCardProps {
  products?: ProductItem[];
  sales?: SaleItem[];
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({ products = [], sales = [] }) => {
  const { navigate } = useRouter();
  const { user, business } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadLatest() {
      if (!user) return;
      try {
        const cached = await getLatestCachedAnalysis(user.uid, business?.id);
        if (isMounted && cached) {
          setLatestAnalysis(cached);
        }
      } catch (err) {
        console.warn('Could not load cached analysis for dashboard card:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLatest();
    return () => {
      isMounted = false;
    };
  }, [user, business]);

  const handleOpenAi = (question?: string, mode?: string) => {
    navigate('/ai', {
      preselectedQuestion: question || latestAnalysis?.query || 'Why did revenue decrease?',
      mode: mode || latestAnalysis?.analysisType || 'executive_summary',
    });
  };

  // Derive top operational signals if no AI analysis run yet
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;

  const biggestIssue =
    latestAnalysis?.keyFactors?.[0]?.title ||
    latestAnalysis?.risks?.[0]?.title ||
    (outOfStockCount > 0
      ? `${outOfStockCount} critical catalog items are completely out of stock`
      : 'Inventory buffers are within safety limits');

  const highestRisk =
    latestAnalysis?.risks?.[0]?.title ||
    (outOfStockCount > 0
      ? 'Lost customer orders due to stockouts in top velocity SKUs'
      : 'Monitoring demand fluctuations');

  const recommendedAction =
    latestAnalysis?.recommendations?.[0]?.action ||
    (outOfStockCount > 0
      ? 'Initiate emergency purchase order with electronics suppliers'
      : 'Review category margins and sales velocity');

  return (
    <div
      id="dashboard-ai-insight-card"
      className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
    >
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-blue-500 text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-100 tracking-wide">
            OpsPilot Executive Intelligence Briefing
          </span>
          <span className="hidden sm:inline-block text-slate-400">•</span>
          <span className="text-[11px] text-slate-300 font-mono">
            {latestAnalysis ? `Analysis #${latestAnalysis.id?.slice(0, 7) || 'latest'}` : 'Grounded on Live Firestore'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Model: {latestAnalysis?.generatedBy || 'gemini-3.8-flash'}
          </span>
          {latestAnalysis?.confidence && (
            <span className="text-slate-300 text-[11px]">
              Confidence: <strong className="text-white">{latestAnalysis.confidence}%</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {latestAnalysis ? latestAnalysis.title : 'Live Operations Diagnostic'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {latestAnalysis
                ? latestAnalysis.summary
                : 'Correlating your store transactions, inventory velocities, supplier lead times, and operating disbursements to identify vulnerabilities and margin optimization opportunities.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-open-ai-summary"
              onClick={() => handleOpenAi(undefined, 'executive_summary')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{latestAnalysis ? 'Deep Executive Diagnostic' : 'Run Full AI Diagnostic'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Concise Insight Callouts */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Biggest Issue */}
          <div
            onClick={() => handleOpenAi('Why did revenue decrease?', 'risk_analysis')}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Biggest Issue
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs font-semibold text-slate-900 line-clamp-2">
              {biggestIssue}
            </p>
          </div>

          {/* 2. Highest Operational Risk */}
          <div
            onClick={() => handleOpenAi('Where are my biggest operational risks?', 'risk_analysis')}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Highest Risk
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs font-semibold text-slate-900 line-clamp-2">
              {highestRisk}
            </p>
          </div>

          {/* 3. Recommended Action */}
          <div
            onClick={() => handleOpenAi('What should I focus on today?', 'recommendations')}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Recommended Action
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs font-semibold text-slate-900 line-clamp-2">
              {recommendedAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
