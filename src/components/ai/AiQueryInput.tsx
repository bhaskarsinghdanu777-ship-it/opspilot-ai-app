import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Lightbulb,
  FileText,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

export const AI_SUGGESTED_QUESTIONS = [
  'Why did revenue decrease?',
  'Which products are performing poorly?',
  'What should I focus on today?',
  'Which area has the highest risk?',
  'How can I improve profit?',
  'Which customers are at risk of churn?',
];

export type AiAnalysisMode =
  | 'query'
  | 'executive_summary'
  | 'risk_analysis'
  | 'recommendations';

interface AiQueryInputProps {
  currentQuestion: string;
  onQuestionSelect: (q: string) => void;
  onAnalyze: (q: string) => void;
  onSelectMode: (mode: AiAnalysisMode) => void;
  currentMode: AiAnalysisMode;
  isAnalyzing: boolean;
}

export const AiQueryInput: React.FC<AiQueryInputProps> = ({
  currentQuestion,
  onQuestionSelect,
  onAnalyze,
  onSelectMode,
  currentMode,
  isAnalyzing,
}) => {
  const [inputVal, setInputVal] = useState(currentQuestion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onAnalyze(inputVal.trim());
    }
  };

  const handlePillClick = (q: string) => {
    setInputVal(q);
    onQuestionSelect(q);
    onSelectMode('query');
    onAnalyze(q);
  };

  return (
    <div
      id="ai-query-container"
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4"
    >
      {/* Header & Feature Modes Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              OpsPilot AI Operations Studio
            </h2>
            <p className="text-xs text-slate-500">
              Correlates live Firestore sales, inventory turnover, expenses, and customer behavior
            </p>
          </div>
        </div>

        {/* 4 Feature Modes */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap">
          <button
            type="button"
            onClick={() => onSelectMode('query')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === 'query'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask OpsPilot</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('executive_summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === 'executive_summary'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Summary</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('risk_analysis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === 'risk_analysis'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Risk Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('recommendations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === 'recommendations'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Recommendations</span>
          </button>
        </div>
      </div>

      {/* Input Form for Natural Language Queries */}
      {currentMode === 'query' ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              id="ai-question-textarea"
              rows={3}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                onQuestionSelect(e.target.value);
              }}
              placeholder="Ask OpsPilot AI anything about your authenticated sales, stock, expenses or customers (e.g., 'Why did revenue decrease?')..."
              className="w-full p-3.5 pr-32 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 resize-none font-sans"
            />

            <div className="absolute right-3 bottom-3.5">
              <button
                id="btn-run-ai-analysis"
                type="submit"
                disabled={isAnalyzing || !inputVal.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Data...</span>
                  </>
                ) : (
                  <>
                    <span>Ask OpsPilot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Suggested Questions Pills */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Suggested operational questions from business metrics:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {AI_SUGGESTED_QUESTIONS.map((question) => {
                const isSelected = inputVal === question;
                return (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handlePillClick(question)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {question}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      ) : (
        /* Action Card for Dedicated Modules (Executive Summary, Risk Analysis, Recommendations) */
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {currentMode === 'executive_summary' && 'Generate Full Executive Summary'}
              {currentMode === 'risk_analysis' && 'Execute Deep Operational Risk Audit'}
              {currentMode === 'recommendations' && 'Generate Actionable Recommendations'}
            </h3>
            <p className="text-xs text-slate-500">
              {currentMode === 'executive_summary' &&
                'Calculates revenue velocity, order patterns, net profit, operational shifts, and key risks.'}
              {currentMode === 'risk_analysis' &&
                'Scans inventory stockouts, declining categories, cash tie-up, and customer retention.'}
              {currentMode === 'recommendations' &&
                'Produces specific, explainable, prioritized directives backed strictly by Firestore data.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAnalyze('')}
            disabled={isAnalyzing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {currentMode === 'executive_summary' && 'Synthesize Executive Summary'}
                  {currentMode === 'risk_analysis' && 'Run Risk Audit'}
                  {currentMode === 'recommendations' && 'Generate Recommendations'}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
