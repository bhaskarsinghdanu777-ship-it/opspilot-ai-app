import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

dotenv.config();

// Root directory resolution for both dev (tsx) and production (bundled CommonJS)
const rootDir = process.cwd();

// Load Firebase applet configuration for token verification
let firebaseAppConfig: {
  apiKey?: string;
  projectId?: string;
  firestoreDatabaseId?: string;
} = {};

try {
  const configPath = path.join(rootDir, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseAppConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not read firebase-applet-config.json:', e);
}

const FIREBASE_API_KEY =
  process.env.VITE_FIREBASE_API_KEY || firebaseAppConfig.apiKey || '';

// Initialize Google Gemini API strictly on the server-side
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Production primary model with automatic resilient fallback
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_MODEL = PRIMARY_MODEL;

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

/**
 * Production-safe log sanitizer
 * Prevents passwords, Firebase ID tokens, and Gemini API keys from leaking into log drains
 */
function sanitizeLog(data: any): string {
  if (typeof data !== 'string') {
    try {
      data = JSON.stringify(data);
    } catch {
      data = String(data);
    }
  }
  return data
    .replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/"password":\s*"[^"]+"/gi, '"password":"[REDACTED]"');
}

/**
 * Resilient Gemini Content Generator with Automatic Model Fallback
 * Seamlessly handles 429 quota exhaustion and 503 high-demand spikes
 */
async function generateContentWithRetry(
  prompt: string,
  options: {
    temperature?: number;
  } = {}
) {
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: options.temperature ?? 0.2,
          },
        });
        return { response, usedModel: model };
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code;
        const msg = String(err?.message || '');
        const isTransient =
          status === 503 ||
          status === 429 ||
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand') ||
          msg.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt === 0) {
          console.warn(
            `[Gemini Retry] Model ${model} returned transient state (${status || 'error'}). Retrying in 1s...`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        break; // break to try fallback model
      }
    }
  }
  throw lastError;
}

/**
 * Centralized Gemini error mapper
 * Gracefully handles 429 rate limits, 504 timeouts, and server errors without leaking secrets or stack traces
 */
function handleGeminiError(err: any, res: Response, feature: string) {
  const errString = String(err?.message || err || '');
  console.error(`[AI Error in ${feature}]:`, sanitizeLog(errString));

  // 1. Rate Limit / Quota Exceeded (429)
  if (
    err?.status === 429 ||
    errString.includes('429') ||
    errString.includes('RESOURCE_EXHAUSTED') ||
    errString.includes('quota')
  ) {
    return res.status(429).json({
      error: 'Gemini AI rate limit reached. Please wait a moment and try again.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  }

  // 1b. Service Unavailable / High Demand (503)
  if (
    err?.status === 503 ||
    errString.includes('503') ||
    errString.includes('UNAVAILABLE') ||
    errString.includes('high demand')
  ) {
    return res.status(503).json({
      error: 'Gemini AI model is currently experiencing high demand. Please try again in a few seconds.',
      code: 'MODEL_HIGH_DEMAND',
    });
  }

  // 2. Gateway Timeout / Deadline Exceeded (504)
  if (
    err?.name === 'AbortError' ||
    errString.includes('timeout') ||
    errString.includes('DEADLINE_EXCEEDED')
  ) {
    return res.status(504).json({
      error: 'Gemini AI request timed out. Please try again with a smaller dataset.',
      code: 'GATEWAY_TIMEOUT',
    });
  }

  // 3. Configuration / Missing API Key (500)
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Gemini API key is not configured on the server. Please check server environment.',
      code: 'MISSING_API_KEY',
    });
  }

  // 4. Generic Safe Server Error (500)
  return res.status(500).json({
    error: `Failed to process ${feature} with Gemini AI. Please try again shortly.`,
    code: 'AI_PROCESSING_ERROR',
  });
}

/**
 * Middleware: Verify Firebase Authentication Token
 * Validates the token using Google Identity Toolkit REST API
 * Guarantees that ownerId is derived strictly from verified Firebase Auth UID
 * Never trusts any ownerId supplied by the browser
 */
async function authenticateFirebaseUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header',
      code: 'UNAUTHORIZED',
    });
  }

  const idToken = authHeader.split('Bearer ')[1].trim();
  if (!idToken) {
    return res.status(401).json({
      error: 'Unauthorized: Empty bearer token',
      code: 'UNAUTHORIZED',
    });
  }

  try {
    // Verify token with Google Identity Toolkit
    if (FIREBASE_API_KEY) {
      const verifyRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );

      if (verifyRes.ok) {
        const data = await verifyRes.json();
        if (data.users && data.users.length > 0) {
          const user = data.users[0];
          req.user = {
            uid: user.localId,
            email: user.email,
          };
          return next();
        }
      }

      // If Google Identity Toolkit explicitly rejected the token or user was not found
      return res.status(401).json({
        error: 'Unauthorized: Firebase ID token is invalid or expired',
        code: 'UNAUTHORIZED',
      });
    }

    // Only in local development/test environments where FIREBASE_API_KEY is completely unset
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payloadBuf = Buffer.from(parts[1], 'base64');
        const payload = JSON.parse(payloadBuf.toString('utf-8'));
        const uid = payload.user_id || payload.sub;
        const exp = payload.exp;

        if (uid && exp && exp * 1000 > Date.now()) {
          req.user = {
            uid,
            email: payload.email,
          };
          return next();
        }
      }
    }

    return res.status(401).json({
      error: 'Unauthorized: Token is expired or could not be verified',
      code: 'UNAUTHORIZED',
    });
  } catch (err) {
    console.error('Auth verification error:', sanitizeLog(err));
    return res.status(401).json({
      error: 'Unauthorized: Token verification failed',
      code: 'UNAUTHORIZED',
    });
  }
}

/**
 * Prepares aggregated, sanitized telemetry string for Gemini
 * Guarantees STRICT tenant isolation:
 * Only records where item.ownerId === verifiedUid are accepted into AI context.
 * Any foreign or un-owned items are strictly filtered out.
 */
function buildBusinessContextSummary(
  verifiedUid: string,
  rawContext: {
    business?: any;
    products?: any[];
    sales?: any[];
    customers?: any[];
    expenses?: any[];
  }
) {
  const rawBusiness = rawContext.business || {};
  // If business has an ownerId that doesn't match verifiedUid, isolate it
  const isBusinessOwner = !rawBusiness.ownerId || rawBusiness.ownerId === verifiedUid;
  const businessName = isBusinessOwner
    ? rawBusiness.name || 'NovaMart Retail Workspace'
    : 'Tenant Isolated Business';
  const businessId = isBusinessOwner
    ? rawBusiness.id || `biz_${verifiedUid.slice(0, 10)}`
    : `biz_${verifiedUid.slice(0, 10)}`;

  // Strict ownership enforcement: ALL records must belong to verifiedUid
  const products = (rawContext.products || []).filter(
    (p) => p && p.ownerId === verifiedUid
  );
  const sales = (rawContext.sales || []).filter(
    (s) => s && s.ownerId === verifiedUid
  );
  const customers = (rawContext.customers || []).filter(
    (c) => c && c.ownerId === verifiedUid
  );
  const expenses = (rawContext.expenses || []).filter(
    (e) => e && e.ownerId === verifiedUid
  );

  // Compute key mathematical telemetry metrics
  const totalSalesRevenue = sales.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0
  );
  const totalExpensesAmount = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );
  const estimatedOperatingProfit = totalSalesRevenue - totalExpensesAmount;
  const avgOrderValue =
    sales.length > 0 ? (totalSalesRevenue / sales.length).toFixed(2) : '0';

  const outOfStockProducts = products.filter(
    (p) => p.stock === 0 || p.status === 'out_of_stock'
  );
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock <= (p.threshold || 5)
  );

  // Sales category breakdown
  const salesByCategory: Record<string, { count: number; total: number }> = {};
  for (const s of sales) {
    const cat = s.category || 'Uncategorized';
    if (!salesByCategory[cat]) salesByCategory[cat] = { count: 0, total: 0 };
    salesByCategory[cat].count++;
    salesByCategory[cat].total += Number(s.amount) || 0;
  }

  // Expense category breakdown
  const expensesByCategory: Record<string, number> = {};
  for (const e of expenses) {
    const cat = e.category || 'General';
    expensesByCategory[cat] =
      (expensesByCategory[cat] || 0) + (Number(e.amount) || 0);
  }

  const isEmptyWorkspace = products.length === 0 && sales.length === 0;

  return {
    verifiedUid,
    businessId,
    businessName,
    isEmptyWorkspace,
    counts: {
      totalProducts: products.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockCount: lowStockProducts.length,
      totalSalesCount: sales.length,
      totalCustomersCount: customers.length,
      totalExpensesCount: expenses.length,
    },
    financials: {
      totalSalesRevenue: Number(totalSalesRevenue.toFixed(2)),
      totalExpensesAmount: Number(totalExpensesAmount.toFixed(2)),
      estimatedOperatingProfit: Number(estimatedOperatingProfit.toFixed(2)),
      averageOrderValue: Number(avgOrderValue),
    },
    salesByCategory,
    expensesByCategory,
    samples: {
      outOfStock: outOfStockProducts.slice(0, 8).map((p) => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        salesVelocity: p.salesVelocity,
      })),
      lowStock: lowStockProducts.slice(0, 8).map((p) => ({
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        threshold: p.threshold,
        salesVelocity: p.salesVelocity,
      })),
      recentSales: sales.slice(0, 15).map((s) => ({
        orderNumber: s.orderNumber,
        date: s.date,
        amount: s.amount,
        items: s.items,
        channel: s.channel,
        category: s.category,
      })),
      topExpenses: expenses.slice(0, 10).map((e) => ({
        category: e.category,
        description: e.description,
        amount: e.amount,
        date: e.date,
      })),
      customersSummary: customers.slice(0, 10).map((c) => ({
        name: c.name,
        ordersCount: c.ordersCount,
        totalSpent: c.totalSpent,
        status: c.status,
      })),
    },
  };
}

export function createApp() {
  const app = express();

  // JSON payload parser with size limit
  app.use(express.json({ limit: '10mb' }));

  // Netlify Functions path normalizer
  // When Netlify rewrites /api/* to /.netlify/functions/api/:splat, normalize to /api/*
  app.use((req, _res, next) => {
    if (req.url.startsWith('/.netlify/functions/api')) {
      req.url = req.url.replace('/.netlify/functions/api', '/api');
    }
    next();
  });

  // Production CORS configuration
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Production-safe request logger (masks all auth tokens and secrets)
  app.use((req, res, next) => {
    const start = Date.now();
    const pathName = req.path;
    res.on('finish', () => {
      if (pathName.startsWith('/api') || pathName === '/health') {
        const duration = Date.now() - start;
        console.log(
          `[${new Date().toISOString()}] ${req.method} ${pathName} ${res.statusCode} (${duration}ms)`
        );
      }
    });
    next();
  });

  // 8. HEALTH CHECK ENDPOINTS
  // Standard Cloud Run health check: GET /health (No authentication required)
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Detailed operational health check: GET /api/health (No authentication required)
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'OpsPilot AI Full-Stack Server',
      model: GEMINI_MODEL,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. POST /api/ai/executive-summary
  // Creates an AI-powered executive summary using authenticated user's business data
  app.post(
    '/api/ai/executive-summary',
    authenticateFirebaseUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const verifiedUid = req.user!.uid;
        const telemetry = buildBusinessContextSummary(
          verifiedUid,
          req.body.context || {}
        );

        const prompt = `
You are OpsPilot AI, an executive operations intelligence agent for small retail & e-commerce businesses.
Analyze the following authentic Cloud Firestore telemetry for business: "${telemetry.businessName}".

TELEMETRY CONTEXT:
${JSON.stringify(telemetry, null, 2)}

${
  telemetry.isEmptyWorkspace
    ? `
ZERO DATA INTEGRITY MANDATE FOR FRESH/EMPTY WORKSPACE:
The authenticated business currently has 0 recorded products and 0 recorded sales.
- Total Sales Revenue is $0.00.
- DO NOT invent, assume, or hallucinate non-existent transactions, revenue numbers, or SKUs.
- State clearly in the summary that the business database is newly initialized with no active sales or inventory data.
- Provide clear onboarding guidance on adding products, establishing inventory thresholds, and logging opening expenses.
`
    : `
REQUIREMENTS:
1. Identify:
   - revenue performance (concrete figures, comparison context, margin analysis)
   - order trends (volume patterns, sales channels, ticket size)
   - estimated profit (revenue minus expenses, profit margin evaluation)
   - important operational changes (inventory movements, supplier dependencies, cost shifts)
   - major risks (stockouts, margin pressure, demand volatility)
   - recommended actions (prioritized, immediate steps)
2. Ground your analysis strictly in the provided data.
3. If data is missing or incomplete for any metric, explicitly state that in "insufficientDataNotes" instead of inventing figures.
4. Distinguish verified facts from AI-generated recommendations.
`
}

Return a JSON object conforming strictly to this structure:
{
  "title": "string (e.g., Executive Operations Summary: September 2026)",
  "summary": "string (clear 2-3 paragraph comprehensive briefing)",
  "confidence": number (80 to 98),
  "executiveSummary": {
    "revenuePerformance": "string",
    "orderTrends": "string",
    "estimatedProfit": "string",
    "operationalChanges": "string",
    "majorRisks": "string",
    "recommendedActionsSummary": "string"
  },
  "factsFromData": ["string (3-6 concrete verifiable facts from the data)"],
  "evidence": ["string (3-5 quantifiable telemetry citations)"],
  "keyFactors": [
    {
      "title": "string",
      "description": "string",
      "severity": "critical" | "warning" | "info"
    }
  ],
  "recommendations": [
    {
      "action": "string",
      "expectedImpact": "string",
      "timeframe": "string",
      "priority": "High" | "Medium" | "Low",
      "explainableReason": "string"
    }
  ],
  "insufficientDataNotes": ["string (any data limitations or unavailable historical periods)"]
}
`;

        const { response, usedModel } = await generateContentWithRetry(prompt, {
          temperature: 0.2,
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        res.json({
          success: true,
          analysis: {
            ...parsed,
            query: 'Generate Executive Summary',
            date: new Date().toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            analysisType: 'executive_summary',
            dataPeriod: 'September 2026',
            generatedBy: usedModel,
            timestamp: new Date().toISOString(),
            ownerId: verifiedUid,
            businessId: telemetry.businessId,
          },
        });
      } catch (err: any) {
        handleGeminiError(err, res, 'Executive Summary');
      }
    }
  );

  // 2. POST /api/ai/risk-analysis
  // Deep multi-category risk evaluation across sales, inventory, customers, profits
  app.post(
    '/api/ai/risk-analysis',
    authenticateFirebaseUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const verifiedUid = req.user!.uid;
        const telemetry = buildBusinessContextSummary(
          verifiedUid,
          req.body.context || {}
        );

        const prompt = `
You are OpsPilot AI, an elite operational risk auditor for retail and commercial operations.
Analyze the following Cloud Firestore telemetry for business: "${telemetry.businessName}".

TELEMETRY CONTEXT:
${JSON.stringify(telemetry, null, 2)}

${
  telemetry.isEmptyWorkspace
    ? `
ZERO DATA MANDATE FOR NEW WORKSPACE:
The authenticated business currently has 0 recorded products and 0 recorded sales.
- Total Sales Revenue is $0.00.
- DO NOT invent fake stockouts or fake declining products.
- Note the primary operational risk is the absence of recorded operational records.
`
    : `
TASK:
Identify and evaluate risks across the following categories:
- declining sales (revenue dips, underperforming categories)
- unusual order patterns (ticket size anomalies, channel concentration)
- low-performing products (slow velocity SKUs tying up cash)
- possible inventory problems (stockouts on high-velocity items, depleted safety stock)
- customer-related risks (churn risk, lack of repeat purchasers)
- revenue/profit risks (fixed expense overhead ratio, operating margin erosion)
`
}

Each risk MUST have:
- category: one of ["declining_sales", "order_patterns", "low_performing_products", "inventory", "customer", "profit_risk", "general"]
- severity: "critical" | "warning" | "info"
- title: concise title
- explanation: root-cause explanation
- supportingData: exact numbers, SKUs, or percentages from telemetry
- recommendedAction: direct mitigation step

Return JSON conforming strictly to:
{
  "title": "Comprehensive Operational Risk Matrix",
  "summary": "string (high-level risk exposure evaluation)",
  "confidence": number,
  "risks": [
    {
      "category": "inventory" | "declining_sales" | "profit_risk" | "order_patterns" | "low_performing_products" | "customer" | "general",
      "severity": "critical" | "warning" | "info",
      "title": "string",
      "explanation": "string",
      "supportingData": "string",
      "recommendedAction": "string"
    }
  ],
  "factsFromData": ["string"],
  "evidence": ["string"],
  "keyFactors": [
    {
      "title": "string",
      "description": "string",
      "severity": "critical" | "warning" | "info"
    }
  ],
  "recommendations": [
    {
      "action": "string",
      "expectedImpact": "string",
      "timeframe": "string",
      "priority": "High" | "Medium" | "Low",
      "explainableReason": "string"
    }
  ],
  "insufficientDataNotes": ["string"]
}
`;

        const { response, usedModel } = await generateContentWithRetry(prompt, {
          temperature: 0.2,
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        res.json({
          success: true,
          analysis: {
            ...parsed,
            query: 'Operational Risk Analysis',
            date: new Date().toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            analysisType: 'risk_analysis',
            dataPeriod: 'September 2026',
            generatedBy: usedModel,
            timestamp: new Date().toISOString(),
            ownerId: verifiedUid,
            businessId: telemetry.businessId,
          },
        });
      } catch (err: any) {
        handleGeminiError(err, res, 'Risk Analysis');
      }
    }
  );

  // 3. POST /api/ai/recommendations
  // Generates practical, actionable business recommendations grounded strictly in data
  app.post(
    '/api/ai/recommendations',
    authenticateFirebaseUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const verifiedUid = req.user!.uid;
        const telemetry = buildBusinessContextSummary(
          verifiedUid,
          req.body.context || {}
        );

        const prompt = `
You are OpsPilot AI.
Generate practical, specific, explainable business recommendations based ONLY on the user's Firestore data for "${telemetry.businessName}".

TELEMETRY CONTEXT:
${JSON.stringify(telemetry, null, 2)}

${
  telemetry.isEmptyWorkspace
    ? `
ZERO DATA INTEGRITY MANDATE:
The business has 0 recorded products and 0 sales.
- Direct recommendations toward workspace setup, catalogue entry, and baseline recording.
- Do NOT hallucinate existing products or past sales.
`
    : `
REQUIREMENTS:
- Recommendations must be specific (name actual products, categories, or cost centers).
- Actionable by the owner or store manager.
- Explainable: explicitly mention WHY based on the numbers.
- Prioritized: High, Medium, Low.
`
}

Return JSON conforming strictly to:
{
  "title": "Prioritized Operational Recommendations Roadmap",
  "summary": "string (tactical overview)",
  "confidence": number,
  "recommendations": [
    {
      "action": "string (concise directive)",
      "expectedImpact": "string (e.g., +$1,200 liquidity / eliminates 3 stockouts)",
      "timeframe": "string (e.g., Next 24-48 hrs)",
      "priority": "High" | "Medium" | "Low",
      "explainableReason": "string (data rationale citing exact telemetry)"
    }
  ],
  "evidence": ["string"],
  "factsFromData": ["string"],
  "keyFactors": [
    {
      "title": "string",
      "description": "string",
      "severity": "critical" | "warning" | "info"
    }
  ],
  "insufficientDataNotes": ["string"]
}
`;

        const { response, usedModel } = await generateContentWithRetry(prompt, {
          temperature: 0.2,
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        res.json({
          success: true,
          analysis: {
            ...parsed,
            query: 'Actionable Business Recommendations',
            date: new Date().toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            analysisType: 'recommendations',
            dataPeriod: 'September 2026',
            generatedBy: usedModel,
            timestamp: new Date().toISOString(),
            ownerId: verifiedUid,
            businessId: telemetry.businessId,
          },
        });
      } catch (err: any) {
        handleGeminiError(err, res, 'Recommendations');
      }
    }
  );

  // 4. POST /api/ai/query
  // Natural Language Assistant ("Ask OpsPilot")
  app.post(
    '/api/ai/query',
    authenticateFirebaseUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const verifiedUid = req.user!.uid;
        const question = (req.body.question || '').trim();

        if (!question) {
          return res.status(400).json({
            error: 'Bad Request: "question" parameter is required',
            code: 'MISSING_QUESTION',
          });
        }

        const telemetry = buildBusinessContextSummary(
          verifiedUid,
          req.body.context || {}
        );

        const prompt = `
You are OpsPilot AI, an intelligent operations co-pilot for small business owners.
The user asked the following operational question:
"${question}"

AUTHENTICATED FIRESTORE TELEMETRY FOR "${telemetry.businessName}":
${JSON.stringify(telemetry, null, 2)}

${
  telemetry.isEmptyWorkspace
    ? `
ZERO DATA INTEGRITY MANDATE:
The business has 0 recorded products and 0 sales.
- State clearly that the database has 0 sales and 0 products recorded.
- Do NOT invent numbers to answer the question.
`
    : `
INSTRUCTIONS:
1. Answer the question directly, addressing the specific operational query using the provided data.
2. Clearly distinguish:
   - FACTS from Firestore data (actual numbers, SKUs, transactions)
   - AI-GENERATED recommendations and strategic options
   - UNAVAILABLE or INSUFFICIENT information (if the data does not contain something, say so explicitly instead of inventing numbers)
3. Provide prioritized recommendations and key root causes.
`
}

Return JSON conforming strictly to:
{
  "title": "string (concise descriptive diagnostic title answering the question)",
  "summary": "string (direct, thorough answer to the user's question citing verified facts)",
  "confidence": number (70 to 98),
  "factsFromData": ["string (concrete verified facts from Firestore used to answer)"],
  "evidence": ["string (quantifiable evidence points)"],
  "keyFactors": [
    {
      "title": "string",
      "description": "string",
      "severity": "critical" | "warning" | "info"
    }
  ],
  "recommendations": [
    {
      "action": "string",
      "expectedImpact": "string",
      "timeframe": "string",
      "priority": "High" | "Medium" | "Low",
      "explainableReason": "string"
    }
  ],
  "insufficientDataNotes": ["string (notes on any data limitations related to the query)"]
}
`;

        const { response, usedModel } = await generateContentWithRetry(prompt, {
          temperature: 0.3,
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);

        res.json({
          success: true,
          analysis: {
            ...parsed,
            query: question,
            date: new Date().toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            analysisType: 'natural_language_query',
            dataPeriod: 'September 2026',
            generatedBy: usedModel,
            timestamp: new Date().toISOString(),
            ownerId: verifiedUid,
            businessId: telemetry.businessId,
          },
        });
      } catch (err: any) {
        handleGeminiError(err, res, 'Natural Language Query');
      }
    }
  );

  // 9. Unrecognized API Endpoint 404 Handler
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: `Endpoint not found: ${req.method} ${req.path}`,
      code: 'NOT_FOUND',
    });
  });

  // Global Express error handler (never leaks stack traces or secrets)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Unhandled Server Error]:', sanitizeLog(err?.message || err));
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      error: 'An internal server error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  return app;
}

export const app = createApp();

export async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Vite middleware setup (development) or static asset serving (production)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OpsPilot AI Server running on http://0.0.0.0:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

// Only launch standalone server if not in a serverless function environment
if (
  process.env.NETLIFY !== 'true' &&
  !process.env.AWS_LAMBDA_FUNCTION_NAME &&
  !process.env.NETLIFY_DEV
) {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', sanitizeLog(err));
    process.exit(1);
  });
}
