import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';
import { useRouter } from '@/src/lib/router';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { getLatestCachedAnalysis } from '@/src/services/geminiAi';
import { AiAnalysis } from '@/src/types';

export const AiInsightCard: React.FC = () => {
  const { navigate } = useRouter();
  const { user, business } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState<AiAnalysis | null>(null);

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
      }
    }
    loadLatest();
    return () => {
      isMounted = false;
    };
  }, [user, business]);

  const handleViewAnalysis = () => {
    navigate('/ai', {
      preselectedQuestion: latestAnalysis?.query || 'Why did revenue decrease?',
      mode: latestAnalysis?.analysisType || 'executive_summary',
    });
  };

  return (
    <div
      id="dashboard-ai-insight-card"
      className="bg-white rounded-2xl border-2 border-indigo-100 shadow-lg shadow-indigo-100/50 p-6 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center bg-gradient-to-r from-white to-indigo-50/30"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 text-white">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Gemini 3.8 Live
          </span>
          <h3 className="text-lg font-bold text-slate-800">
            {latestAnalysis ? latestAnalysis.title : 'AI Operations Executive Summary'}
          </h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
          {latestAnalysis
            ? latestAnalysis.summary
            : 'Gemini 3.8 Flash is ready to analyze your authentic Cloud Firestore sales transactions, inventory turnovers, operating expenses, and customer patterns.'}
        </p>
      </div>

      <button
        id="btn-view-analysis"
        onClick={handleViewAnalysis}
        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shrink-0 cursor-pointer flex items-center gap-2"
      >
        <span>{latestAnalysis ? 'View Analysis' : 'Analyze Now'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
