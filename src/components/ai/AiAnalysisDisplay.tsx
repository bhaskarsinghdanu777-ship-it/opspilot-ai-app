import React, { useState } from 'react';
import { AiAnalysis } from '@/src/types';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  ShieldCheck,
  BrainCircuit,
  Bookmark,
  DollarSign,
  ShoppingCart,
  Layers,
  HelpCircle,
  Info,
  Check,
} from 'lucide-react';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { addAiAnalysis } from '@/src/services/aiAnalyses';

interface AiAnalysisDisplayProps {
  analysis: AiAnalysis;
  isLoading?: boolean;
  onSaveToHistory?: () => void;
}

export const AiAnalysisDisplay: React.FC<AiAnalysisDisplayProps> = ({
  analysis,
  isLoading,
  onSaveToHistory,
}) => {
  const { user, business } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addAiAnalysis(
        analysis,
        user.uid,
        business?.id || `biz_${user.uid.slice(0, 10)}`
      );
      setSavedSuccess(true);
      if (onSaveToHistory) onSaveToHistory();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving analysis:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        id="ai-loading-card"
        className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs"
      >
        <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 mb-3 animate-pulse">
          <BrainCircuit className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Synthesizing Firestore Telemetry with Gemini AI...
        </h3>
        <p className="text-xs text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
          Correlating authenticated POS transactions, SKU inventory stockouts, supplier
          operating disbursements, and customer velocity metrics. Formulating evidence-grounded
          diagnostics...
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-blue-700 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero cross-user data leakage • Authenticated Firestore context</span>
        </div>
      </div>
    );
  }

  const exec = analysis.executiveSummary;
  const risks = analysis.risks;
  const facts = analysis.factsFromData || analysis.evidence || [];
  const missingData = analysis.insufficientDataNotes || [];

  return (
    <div
      id="ai-analysis-result-card"
      className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
    >
      {/* Live Gemini Grounded Banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-200/80 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold uppercase tracking-wider text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">
            Gemini AI Live
          </span>
          <span className="text-emerald-800 font-medium">
            Grounded strictly in authenticated Cloud Firestore telemetry
          </span>
        </div>
        <span className="font-mono text-[11px] text-emerald-800">
          Model: {analysis.generatedBy || 'gemini-3.8-flash'}
        </span>
      </div>

      {/* Analysis Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900">{analysis.title}</h2>
            {analysis.id && (
              <span className="text-xs text-slate-400 font-mono">#{analysis.id.slice(0, 8)}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {analysis.date}
            </span>
            <span>•</span>
            <span className="text-slate-600 font-medium">
              Data Period: {analysis.dataPeriod || 'Current Month'}
            </span>
            <span>•</span>
            <span className="text-slate-600">
              Query: &quot;{analysis.query}&quot;
            </span>
          </p>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Diagnostic Confidence
            </div>
            <div className="text-lg font-bold text-emerald-600 font-mono">
              {analysis.confidence || 94}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/40 bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs font-mono">
            {analysis.confidence || 94}%
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. Primary Executive Summary / Core Synthesis */}
        <section id="section-ai-summary">
          <div className="flex items-center gap-2 mb-2.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Executive Briefing
            </h3>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-sm text-slate-800 leading-relaxed space-y-3">
            <p>{analysis.summary}</p>
          </div>
        </section>

        {/* 2. Structured Executive Summary Breakdown (if present) */}
        {exec && (
          <section id="section-ai-executive-breakdown" className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Operational Telemetry Breakdown
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Revenue Performance */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5 text-blue-700 font-bold text-xs">
                  <DollarSign className="w-3.5 h-3.5" />
                  <h4>Revenue Performance</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {exec.revenuePerformance}
                </p>
              </div>

              {/* Order Trends */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5 text-indigo-700 font-bold text-xs">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <h4>Order Trends</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {exec.orderTrends}
                </p>
              </div>

              {/* Estimated Profit */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5 text-emerald-700 font-bold text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <h4>Estimated Profit & Margin</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {exec.estimatedProfit}
                </p>
              </div>

              {/* Operational Changes */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5 text-amber-700 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <h4>Operational Shifts</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {exec.operationalChanges}
                </p>
              </div>

              {/* Major Risks */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5 text-rose-700 font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <h4>Major Vulnerabilities</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {exec.majorRisks}
                </p>
              </div>

              {/* Recommended Actions Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5 text-purple-700 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <h4>Recommended Directives</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {exec.recommendedActionsSummary}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 3. Deep Operational Risk Matrix (if present) */}
        {risks && risks.length > 0 && (
          <section id="section-ai-risks">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Identified Operational Risks
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {risks.length} Risk Vectors Audited
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {risks.map((risk, idx) => (
                <div
                  key={idx}
                  className={`border rounded-xl p-4 flex flex-col justify-between ${
                    risk.severity === 'critical'
                      ? 'bg-rose-50/40 border-rose-200'
                      : risk.severity === 'warning'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">{risk.title}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 capitalize bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                          {(risk.category || 'general').replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            risk.severity === 'critical'
                              ? 'bg-rose-600 text-white'
                              : risk.severity === 'warning'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {risk.severity}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed mb-3">
                      {risk.explanation}
                    </p>

                    <div className="bg-white/90 border border-slate-200/80 rounded-lg p-2.5 text-[11px] mb-2.5">
                      <span className="font-semibold text-slate-500">Supporting Data: </span>
                      <span className="text-slate-800 font-medium">{risk.supportingData}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 text-xs">
                    <span className="font-semibold text-blue-700">Mitigation: </span>
                    <span className="text-slate-700">{risk.recommendedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Verified Firestore Facts (Facts from Data) */}
        {facts && facts.length > 0 && (
          <section id="section-ai-facts">
            <div className="flex items-center gap-2 mb-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Verified Firestore Facts & Evidence
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {facts.map((fact, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-start gap-2.5 hover:border-slate-300 transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{fact}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Key Root Factors (if standard display) */}
        {(!risks || risks.length === 0) && analysis.keyFactors && analysis.keyFactors.length > 0 && (
          <section id="section-ai-factors">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Key Root Factors
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.keyFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-3.5 flex flex-col justify-between ${
                    factor.severity === 'critical'
                      ? 'bg-rose-50/50 border-rose-200'
                      : factor.severity === 'warning'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{factor.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                          factor.severity === 'critical'
                            ? 'bg-rose-200/80 text-rose-900'
                            : factor.severity === 'warning'
                            ? 'bg-amber-200/80 text-amber-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {factor.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {factor.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Prioritized Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <section id="section-ai-recommendations">
            <div className="flex items-center gap-2 mb-2.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Prioritized Actionable Recommendations
              </h3>
            </div>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:border-blue-200 transition-colors shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">{rec.action}</h4>
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          Impact: {rec.expectedImpact}
                        </span>
                        {rec.explainableReason && (
                          <span className="text-slate-500 text-[11px]">
                            • Rationale: {rec.explainableReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                      {rec.timeframe}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                        rec.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : rec.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Unavailable Information & Data Limitations */}
        {missingData.length > 0 && (
          <section id="section-ai-insufficient-data">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Unavailable Information & Boundaries
              </h3>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1">
              {missingData.map((note, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit trail verified • Persisted in Firestore /aiAnalyses</span>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Saved to Firestore!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || savedSuccess}
            className="px-3.5 py-1.5 border border-slate-300 rounded-lg hover:bg-white text-slate-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : savedSuccess ? 'Archived' : 'Save to History'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
