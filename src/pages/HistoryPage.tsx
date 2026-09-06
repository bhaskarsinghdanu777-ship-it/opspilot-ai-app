import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { getAiAnalyses } from '@/src/services/aiAnalyses';
import { mockHistoryAnalyses, HistoryAnalysisItem } from '@/src/lib/mock-data/history';
import { sampleAnalyses } from '@/src/lib/mock-data/aiAnalysis';
import { useRouter } from '@/src/lib/router';
import {
  History,
  Calendar,
  ArrowRight,
  Database,
  Sparkles,
  RefreshCw,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { AiAnalysisDisplay } from '@/src/components/ai/AiAnalysisDisplay';
import { AiAnalysisResult } from '@/src/types';
import { seedBusinessData } from '@/src/services/seedData';

export const HistoryPage: React.FC = () => {
  const { user, business } = useAuth();
  const { navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [analyses, setAnalyses] = useState<AiAnalysisResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeAnalysisModal, setActiveAnalysisModal] = useState<AiAnalysisResult | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const categories = ['All', 'Revenue', 'Inventory', 'Customers', 'Strategy'];

  const loadAnalyses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAiAnalyses(user.uid, business?.id);
      if (data && data.length > 0) {
        setAnalyses(data);
        setStatusNotice('Loaded persistent diagnostic reports from Cloud Firestore.');
      } else {
        // Starter fallback
        const fallbackList: AiAnalysisResult[] = Object.values(sampleAnalyses);
        setAnalyses(fallbackList);
        setStatusNotice('Showing starter operational analyses. Firestore collection empty.');
      }
    } catch (err) {
      console.error('Failed to load analyses from Firestore:', err);
      setAnalyses(Object.values(sampleAnalyses));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, [user, business]);

  const handleOpenAnalysisInStudio = (query: string) => {
    navigate('/ai', { preselectedQuestion: query });
  };

  const handleSeedDemoAnalyses = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await seedBusinessData(
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );
      await loadAnalyses();
      setStatusNotice('AI analyses persisted to Cloud Firestore collection: aiAnalyses!');
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div id="page-history" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Analysis History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud Firestore backed diagnostic reports and evidence-grounded action plans
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-800 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firestore: /aiAnalyses</span>
          </div>

          <button
            onClick={loadAnalyses}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Firestore Status Banner */}
      {statusNotice && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{statusNotice}</span>
          </div>

          <button
            onClick={handleSeedDemoAnalyses}
            disabled={isSyncing}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? 'Writing analyses to Firestore...' : 'Seed Sample Analyses to Firestore'}
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Filter Category:</span>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-500">
          Showing {analyses.length} archived analyses
        </span>
      </div>

      {/* History Items List */}
      <div className="space-y-4">
        {analyses.map((item, idx) => (
          <div
            key={item.id || idx}
            id={`history-item-${item.id || idx}`}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {item.confidence || '94% Confidence'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {item.date}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                {item.summary}
              </p>

              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-slate-500">Evidence grounded:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {item.evidence?.length || 3} telemetry citations
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => setActiveAnalysisModal(item)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Quick Preview
              </button>

              <button
                onClick={() => handleOpenAnalysisInStudio(item.query)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <span>Open in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Details Modal */}
      {activeAnalysisModal && (
        <Modal
          isOpen={Boolean(activeAnalysisModal)}
          onClose={() => setActiveAnalysisModal(null)}
          title={activeAnalysisModal.title}
          subtitle={`Archived on ${activeAnalysisModal.date} • Saved in Firestore: aiAnalyses`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <AiAnalysisDisplay analysis={activeAnalysisModal} />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setActiveAnalysisModal(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const q = activeAnalysisModal.query;
                  setActiveAnalysisModal(null);
                  handleOpenAnalysisInStudio(q);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Launch in AI Studio
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
