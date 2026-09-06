import { AiAnalysis } from '@/src/types';
import { addAiAnalysis, getAiAnalyses } from './aiAnalyses';

export interface BusinessDataPayload {
  business?: any;
  products?: any[];
  sales?: any[];
  customers?: any[];
  expenses?: any[];
}

const TIMEOUT_MS = 45000; // 45s timeout for thorough AI synthesis

/**
 * Robust fetch wrapper with timeout, token auth, and structured error propagation
 */
async function callAiApi(
  endpoint: string,
  idToken: string,
  payload: Record<string, any>
): Promise<AiAnalysis> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Server error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.details || errorMessage;
      } catch (_) {
        // Fallback to generic status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.analysis) {
      throw new Error('Malformed AI response: missing analysis payload');
    }

    return validateAndSanitizeAiAnalysis(data.analysis);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(
        'Gemini analysis timed out after 45 seconds. The telemetry dataset might be large, please try again.'
      );
    }
    throw err;
  }
}

/**
 * Validates and sanitizes AI payload to ensure rendering components never encounter null or undefined arrays
 */
function validateAndSanitizeAiAnalysis(raw: any): AiAnalysis {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Malformed AI response: payload is not an object');
  }

  return {
    title:
      typeof raw.title === 'string' && raw.title.trim()
        ? raw.title
        : 'AI Operations Analysis',
    summary:
      typeof raw.summary === 'string' && raw.summary.trim()
        ? raw.summary
        : 'Telemetry synthesis completed for this workspace.',
    confidence:
      typeof raw.confidence === 'number' && !isNaN(raw.confidence)
        ? Math.min(100, Math.max(0, raw.confidence))
        : 90,
    executiveSummary:
      raw.executiveSummary && typeof raw.executiveSummary === 'object'
        ? raw.executiveSummary
        : undefined,
    factsFromData: Array.isArray(raw.factsFromData)
      ? raw.factsFromData.filter((f: any) => typeof f === 'string')
      : [],
    evidence: Array.isArray(raw.evidence)
      ? raw.evidence.filter((e: any) => typeof e === 'string')
      : [],
    keyFactors: Array.isArray(raw.keyFactors) ? raw.keyFactors : [],
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations
      : [],
    risks: Array.isArray(raw.risks) ? raw.risks : [],
    insufficientDataNotes: Array.isArray(raw.insufficientDataNotes)
      ? raw.insufficientDataNotes
      : [],
    query: typeof raw.query === 'string' ? raw.query : undefined,
    date:
      typeof raw.date === 'string'
        ? raw.date
        : new Date().toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
    analysisType: raw.analysisType || 'analysis',
    dataPeriod: raw.dataPeriod || 'Current Period',
    generatedBy: raw.generatedBy || 'Gemini 3.8 Flash',
    timestamp: raw.timestamp || new Date().toISOString(),
    id: raw.id,
    businessId: raw.businessId,
    ownerId: raw.ownerId,
  };
}

/**
 * 1. AI Executive Summary
 * Generates an executive summary based on user's Firestore data and persists it.
 */
export async function generateExecutiveSummary(
  idToken: string,
  dataContext: BusinessDataPayload,
  ownerId: string,
  businessId: string,
  autoPersist = true
): Promise<AiAnalysis> {
  const analysis = await callAiApi('/api/ai/executive-summary', idToken, {
    context: dataContext,
  });

  if (autoPersist) {
    try {
      const saved = await addAiAnalysis(analysis, ownerId, businessId);
      return saved;
    } catch (persistErr) {
      console.warn('Failed to auto-persist analysis to Firestore:', persistErr);
    }
  }

  return analysis;
}

/**
 * 2. AI Risk Analysis
 * Deep risk matrix across inventory, declining sales, margins, and customer retention.
 */
export async function generateRiskAnalysis(
  idToken: string,
  dataContext: BusinessDataPayload,
  ownerId: string,
  businessId: string,
  autoPersist = true
): Promise<AiAnalysis> {
  const analysis = await callAiApi('/api/ai/risk-analysis', idToken, {
    context: dataContext,
  });

  if (autoPersist) {
    try {
      const saved = await addAiAnalysis(analysis, ownerId, businessId);
      return saved;
    } catch (persistErr) {
      console.warn('Failed to auto-persist risk analysis to Firestore:', persistErr);
    }
  }

  return analysis;
}

/**
 * 3. AI Recommendations
 * Generates practical, specific, explainable business recommendations.
 */
export async function generateRecommendations(
  idToken: string,
  dataContext: BusinessDataPayload,
  ownerId: string,
  businessId: string,
  autoPersist = true
): Promise<AiAnalysis> {
  const analysis = await callAiApi('/api/ai/recommendations', idToken, {
    context: dataContext,
  });

  if (autoPersist) {
    try {
      const saved = await addAiAnalysis(analysis, ownerId, businessId);
      return saved;
    } catch (persistErr) {
      console.warn('Failed to auto-persist recommendations to Firestore:', persistErr);
    }
  }

  return analysis;
}

/**
 * 4. AI Natural Language Query ("Ask OpsPilot")
 * Answers operational questions with facts, evidence, and clear boundaries.
 */
export async function askOpsPilot(
  question: string,
  idToken: string,
  dataContext: BusinessDataPayload,
  ownerId: string,
  businessId: string,
  autoPersist = true
): Promise<AiAnalysis> {
  const analysis = await callAiApi('/api/ai/query', idToken, {
    question,
    context: dataContext,
  });

  if (autoPersist) {
    try {
      const saved = await addAiAnalysis(analysis, ownerId, businessId);
      return saved;
    } catch (persistErr) {
      console.warn('Failed to auto-persist query response to Firestore:', persistErr);
    }
  }

  return analysis;
}

/**
 * Retrieves the latest cached analysis of a specific type from Firestore to prevent redundant Gemini calls
 */
export async function getLatestCachedAnalysis(
  ownerId: string,
  businessId?: string,
  analysisType?: string
): Promise<AiAnalysis | null> {
  try {
    const list = await getAiAnalyses(ownerId, businessId);
    if (!list || list.length === 0) return null;

    if (analysisType) {
      const filtered = list.filter((item) => item.analysisType === analysisType);
      return filtered.length > 0 ? filtered[0] : null;
    }

    return list[0];
  } catch (err) {
    console.warn('Error reading cached analysis:', err);
    return null;
  }
}
