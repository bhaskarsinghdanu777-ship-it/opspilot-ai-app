import React, { useState, useEffect, useCallback } from 'react';
import { AiAnalysis } from '@/src/types';
import { AiQueryInput, AiAnalysisMode } from '@/src/components/ai/AiQueryInput';
import { AiAnalysisDisplay } from '@/src/components/ai/AiAnalysisDisplay';
import { useRouter } from '@/src/lib/router';
import { useAuth } from '@/src/lib/firebase/AuthContext';
import { getProducts } from '@/src/services/products';
import { getSales } from '@/src/services/sales';
import { getCustomers } from '@/src/services/customers';
import { getExpenses } from '@/src/services/expenses';
import {
  askOpsPilot,
  generateExecutiveSummary,
  generateRiskAnalysis,
  generateRecommendations,
  getLatestCachedAnalysis,
  BusinessDataPayload,
} from '@/src/services/geminiAi';
import {
  Sparkles,
  Cpu,
  RefreshCw,
  AlertCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const AiOperationsPage: React.FC = () => {
  const { routeState } = useRouter();
  const { user, business } = useAuth();

  const [currentMode, setCurrentMode] = useState<AiAnalysisMode>('query');
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    (routeState?.preselectedQuestion as string) || 'Why did revenue decrease?'
  );

  const [activeAnalysis, setActiveAnalysis] = useState<AiAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [telemetrySummary, setTelemetrySummary] = useState<{
    salesCount: number;
    productsCount: number;
    expensesCount: number;
    customersCount: number;
  }>({
    salesCount: 0,
    productsCount: 0,
    expensesCount: 0,
    customersCount: 0,
  });

  // Cached business data
  const [businessData, setBusinessData] = useState<BusinessDataPayload | null>(
    null
  );

  // Load Firestore business data
  const loadFirestoreContext = useCallback(async (): Promise<BusinessDataPayload | null> => {
    if (!user) return null;
    try {
      const [products, sales, customers, expenses] = await Promise.all([
        getProducts(user.uid, business?.id).catch(() => []),
        getSales(user.uid, business?.id).catch(() => []),
        getCustomers(user.uid, business?.id).catch(() => []),
        getExpenses(user.uid, business?.id).catch(() => []),
      ]);

      const payload: BusinessDataPayload = {
        business: business || {
          name: 'NovaMart Retail Workspace',
          type: 'retail',
        },
        products: products || [],
        sales: sales || [],
        customers: customers || [],
        expenses: expenses || [],
      };

      setBusinessData(payload);
      setTelemetrySummary({
        salesCount: (sales || []).length,
        productsCount: (products || []).length,
        expensesCount: (expenses || []).length,
        customersCount: (customers || []).length,
      });

      return payload;
    } catch (err) {
      console.warn('Could not fetch Firestore business telemetry:', err);
      return null;
    }
  }, [user, business]);

  // Initial load: check for cached analysis in Firestore to avoid duplicate Gemini calls
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      if (!user) return;
      const context = await loadFirestoreContext();

      // Check if user came with a preselected question
      if (routeState?.preselectedQuestion) {
        const q = routeState.preselectedQuestion as string;
        setCurrentQuestion(q);
        setCurrentMode('query');
        return;
      }

      // Check if user specified a mode via routeState
      if (routeState?.mode) {
        setCurrentMode(routeState.mode as AiAnalysisMode);
      }

      // Load latest cached analysis from Firestore /aiAnalyses
      try {
        const cached = await getLatestCachedAnalysis(user.uid, business?.id);
        if (isMounted && cached) {
          setActiveAnalysis(cached);
          if (cached.analysisType) {
            setCurrentMode(
              cached.analysisType === 'natural_language_query'
                ? 'query'
                : (cached.analysisType as AiAnalysisMode)
            );
          }
          if (cached.query && cached.analysisType === 'natural_language_query') {
            setCurrentQuestion(cached.query);
          }
        }
      } catch (err) {
        console.warn('Failed to load cached analysis:', err);
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [user, business, routeState, loadFirestoreContext]);

  // Human-friendly error mapper
  const formatUserFacingError = (err: any): string => {
    const msg = (err?.message || String(err || '')).toLowerCase();
    if (msg.includes('auth') || msg.includes('token') || msg.includes('unauthorized') || msg.includes('sign in')) {
      return 'Your session has expired or authentication is required. Please sign in again.';
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
      return 'Network connection issue. Please verify your internet connection and try again.';
    }
    if (msg.includes('telemetry') || msg.includes('no data') || msg.includes('empty')) {
      return 'Not enough business data is available in Firestore for this analysis. Please ensure transactions and products exist.';
    }
    if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('429')) {
      return 'AI Operations service is experiencing high operational traffic. Please try again in a few moments.';
    }
    return 'OpsPilot could not complete the analysis. Please verify your business telemetry and try again.';
  };

  // Core analysis dispatcher
  const executeAnalysis = async (queryText?: string, targetMode?: AiAnalysisMode) => {
    if (!user) {
      setError('Please sign in to execute Gemini AI operations.');
      return;
    }

    const mode = targetMode || currentMode;
    const question = (queryText !== undefined ? queryText : currentQuestion).trim();

    setIsAnalyzing(true);
    setError(null);

    try {
      // 1. Get verified Firebase ID token
      const idToken = await user.getIdToken();

      // 2. Ensure business data is available
      let context = businessData;
      if (!context) {
        context = await loadFirestoreContext();
      }

      if (!context) {
        throw new Error('Unable to retrieve Firestore business telemetry context.');
      }

      const ownerId = user.uid;
      const businessId = business?.id || `biz_${user.uid.slice(0, 10)}`;

      let result: AiAnalysis;

      // 3. Dispatch to appropriate Gemini endpoint
      if (mode === 'executive_summary') {
        result = await generateExecutiveSummary(
          idToken,
          context,
          ownerId,
          businessId,
          true
        );
      } else if (mode === 'risk_analysis') {
        result = await generateRiskAnalysis(
          idToken,
          context,
          ownerId,
          businessId,
          true
        );
      } else if (mode === 'recommendations') {
        result = await generateRecommendations(
          idToken,
          context,
          ownerId,
          businessId,
          true
        );
      } else {
        // Natural Language Query
        const promptQuestion = question || 'Why did revenue decrease?';
        result = await askOpsPilot(
          promptQuestion,
          idToken,
          context,
          ownerId,
          businessId,
          true
        );
      }

      setActiveAnalysis(result);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setError(formatUserFacingError(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleModeSelect = (mode: AiAnalysisMode) => {
    setCurrentMode(mode);
    setError(null);
  };

  return (
    <div id="page-ai-operations" className="space-y-6">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Operations Studio
            </h1>
            <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Model: {activeAnalysis?.generatedBy || 'gemini-3.8-flash'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time business intelligence grounded strictly in authenticated Cloud Firestore telemetry
          </p>
        </div>

        {/* Telemetry Counter Pill */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700 border border-slate-200">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {telemetrySummary.salesCount} Sales • {telemetrySummary.productsCount} SKUs •{' '}
              {telemetrySummary.expensesCount} Expenses
            </span>
          </div>

          <button
            onClick={() => loadFirestoreContext()}
            title="Refresh Firestore telemetry"
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Analysis Error: </span>
              <span>{error}</span>
            </div>
          </div>
          <button
            onClick={() => executeAnalysis()}
            className="px-2.5 py-1 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Large Question / Input Area with 4 Modes */}
      <AiQueryInput
        currentQuestion={currentQuestion}
        onQuestionSelect={(q) => setCurrentQuestion(q)}
        onAnalyze={(q) => executeAnalysis(q)}
        onSelectMode={handleModeSelect}
        currentMode={currentMode}
        isAnalyzing={isAnalyzing}
      />

      {/* 2. Analysis Result Display */}
      {activeAnalysis ? (
        <AiAnalysisDisplay
          analysis={activeAnalysis}
          isLoading={isAnalyzing}
          onSaveToHistory={() => {}}
        />
      ) : isAnalyzing ? (
        <AiAnalysisDisplay
          analysis={{
            query: currentQuestion,
            title: 'Analyzing...',
            date: new Date().toLocaleDateString(),
            confidence: 0,
            summary: '',
            evidence: [],
            keyFactors: [],
            recommendations: [],
          }}
          isLoading={true}
        />
      ) : (
        /* Empty State / Prompt to Run */
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-xs">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 text-blue-600 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Ready to Analyze Business Telemetry
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Select an operational question above or click &quot;Synthesize Executive Summary&quot;
            to have Google Gemini correlate your authenticated Firestore records.
          </p>
          <button
            onClick={() => executeAnalysis('', 'executive_summary')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Executive Summary</span>
          </button>
        </div>
      )}
    </div>
  );
};
