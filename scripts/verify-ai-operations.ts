import fetch from 'node-fetch';

import fs from 'fs';

let detectedApiKey = process.env.VITE_FIREBASE_API_KEY || '';
if (!detectedApiKey) {
  try {
    if (fs.existsSync('firebase-applet-config.json')) {
      const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
      detectedApiKey = cfg.apiKey || '';
    }
  } catch {}
}

const BASE_URL = 'http://127.0.0.1:3000';
const FIREBASE_API_KEY = detectedApiKey;

interface VerificationResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: VerificationResult[] = [];

function record(suite: string, name: string, passed: boolean, details?: string, error?: string) {
  results.push({ suite, name, passed, details, error });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] ${suite} -> ${name}`);
  if (details) console.log(`   Info: ${details}`);
  if (error) console.log(`   Error: ${error}`);
}

async function getAuthenticatedIdToken(): Promise<{ idToken: string; uid: string }> {
  const email = `verifier_${Date.now()}@novamart.ops`;
  const password = 'OpsPilotPassword2026!';
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const data = (await res.json()) as any;
  if (!res.ok || !data.idToken) {
    throw new Error(`Failed to acquire test token: ${JSON.stringify(data)}`);
  }
  return { idToken: data.idToken, uid: data.localId };
}

async function runTests() {
  console.log('====================================================');
  console.log('OPSPILOT AI - PHASE 3 VERIFICATION & HARDENING SUITE');
  console.log('====================================================\n');

  // Step 0: Acquire Genuine Firebase Token
  console.log('Step 0: Authenticating with Firebase Identity Toolkit...');
  const { idToken, uid } = await getAuthenticatedIdToken();
  console.log(`Authenticated as User UID: ${uid}\n`);

  // Sample Authenticated Business Context
  const testBusinessContext = {
    business: {
      id: `biz_${uid.slice(0, 10)}`,
      name: 'NovaMart Electronics Flagship',
      ownerId: uid,
    },
    products: [
      { id: 'p1', name: 'UltraHD 4K Smart TV 65"', sku: 'TV-4K-65', price: 799.99, stock: 2, threshold: 5, salesVelocity: 4.2, status: 'low_stock', ownerId: uid },
      { id: 'p2', name: 'Wireless Noise-Canceling Headphones', sku: 'AUDIO-NC-PRO', price: 199.99, stock: 0, threshold: 8, salesVelocity: 12.5, status: 'out_of_stock', ownerId: uid },
      { id: 'p3', name: 'Fast Charging USB-C Dock 100W', sku: 'ACC-DOCK-100', price: 69.99, stock: 45, threshold: 10, salesVelocity: 1.1, status: 'in_stock', ownerId: uid },
    ],
    sales: [
      { orderNumber: 'ORD-9001', amount: 799.99, date: '2026-09-01', channel: 'In-Store', category: 'Televisions', items: 1, ownerId: uid },
      { orderNumber: 'ORD-9002', amount: 399.98, date: '2026-09-02', channel: 'Online Web', category: 'Audio', items: 2, ownerId: uid },
      { orderNumber: 'ORD-9003', amount: 69.99, date: '2026-09-03', channel: 'In-Store', category: 'Accessories', items: 1, ownerId: uid },
    ],
    customers: [
      { name: 'Sarah Jenkins', email: 's.jenkins@example.com', totalSpend: 1199.97, orders: 3, ownerId: uid },
      { name: 'Alex Rivera', email: 'arivera@example.com', totalSpend: 69.99, orders: 1, ownerId: uid },
    ],
    expenses: [
      { description: 'Component Supplier Restock', amount: 450.00, category: 'Inventory', date: '2026-09-02', ownerId: uid },
      { description: 'Store Electricity and HVAC', amount: 180.00, category: 'Utilities', date: '2026-09-01', ownerId: uid },
    ],
  };

  // 1. TEST ASK OPSPILOT - Question 1: "Why did revenue decrease?"
  try {
    const res = await fetch(`${BASE_URL}/api/ai/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        question: 'Why did revenue decrease?',
        context: testBusinessContext,
      }),
    });

    const data = (await res.json()) as any;
    const passed = res.ok && data.success && data.analysis && typeof data.analysis.summary === 'string' && data.analysis.ownerId === uid;
    record(
      '1. Ask OpsPilot',
      'Question: "Why did revenue decrease?"',
      passed,
      `Title: "${data.analysis?.title}", Confidence: ${data.analysis?.confidence}%, Facts: ${data.analysis?.factsFromData?.length}`,
      data.error
    );
  } catch (err: any) {
    record('1. Ask OpsPilot', 'Question: "Why did revenue decrease?"', false, undefined, err.message);
  }

  // 1b. TEST ASK OPSPILOT - Question 2: "Which products are performing poorly?"
  await new Promise((r) => setTimeout(r, 1200));
  try {
    const res = await fetch(`${BASE_URL}/api/ai/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        question: 'Which products are performing poorly?',
        context: testBusinessContext,
      }),
    });

    const data = (await res.json()) as any;
    const passed = res.ok && data.success && data.analysis && data.analysis.recommendations?.length > 0;
    record(
      '1. Ask OpsPilot',
      'Question: "Which products are performing poorly?"',
      passed,
      `Identified factors: ${data.analysis?.keyFactors?.length}, Recommendations: ${data.analysis?.recommendations?.length}`,
      data.error
    );
  } catch (err: any) {
    record('1. Ask OpsPilot', 'Question: "Which products are performing poorly?"', false, undefined, err.message);
  }

  // 1c. TEST ASK OPSPILOT - Question 3: "What should I focus on today?"
  await new Promise((r) => setTimeout(r, 1200));
  try {
    const res = await fetch(`${BASE_URL}/api/ai/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        question: 'What should I focus on today?',
        context: testBusinessContext,
      }),
    });

    const data = (await res.json()) as any;
    const passed = res.ok && data.success && data.analysis && typeof data.analysis.title === 'string';
    record(
      '1. Ask OpsPilot',
      'Question: "What should I focus on today?"',
      passed,
      `Action directives: ${data.analysis?.recommendations?.map((r: any) => r.action).slice(0, 2).join('; ')}`,
      data.error
    );
  } catch (err: any) {
    record('1. Ask OpsPilot', 'Question: "What should I focus on today?"', false, undefined, err.message);
  }

  // 2. TEST EXECUTIVE SUMMARY
  await new Promise((r) => setTimeout(r, 1200));
  try {
    const res = await fetch(`${BASE_URL}/api/ai/executive-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        context: testBusinessContext,
      }),
    });

    const data = (await res.json()) as any;
    const a = data.analysis;
    const hasExec = a && a.executiveSummary &&
      typeof a.executiveSummary.revenuePerformance === 'string' &&
      typeof a.executiveSummary.orderTrends === 'string' &&
      typeof a.executiveSummary.estimatedProfit === 'string';
    const passed = res.ok && data.success && hasExec && a.analysisType === 'executive_summary';
    record(
      '2. Executive Summary',
      'POST /api/ai/executive-summary',
      passed,
      `Profit: "${a?.executiveSummary?.estimatedProfit}", Revenue: "${a?.executiveSummary?.revenuePerformance?.slice(0, 50)}..."`,
      data.error
    );
  } catch (err: any) {
    record('2. Executive Summary', 'POST /api/ai/executive-summary', false, undefined, err.message);
  }

  // 3. TEST RISK ANALYSIS
  await new Promise((r) => setTimeout(r, 1200));
  try {
    const res = await fetch(`${BASE_URL}/api/ai/risk-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        context: testBusinessContext,
      }),
    });

    const data = (await res.json()) as any;
    const a = data.analysis;
    const hasRisks = a && Array.isArray(a.risks) && a.risks.length > 0;
    const validCategories = hasRisks && a.risks.every((r: any) => r.category && r.severity && r.explanation);
    const passed = res.ok && data.success && validCategories && a.analysisType === 'risk_analysis';
    record(
      '3. Risk Analysis',
      'POST /api/ai/risk-analysis',
      passed,
      `Identified ${a?.risks?.length} risks. Severities: ${a?.risks?.map((r: any) => `${r.category}:${r.severity}`).join(', ')}`,
      data.error
    );
  } catch (err: any) {
    record('3. Risk Analysis', 'POST /api/ai/risk-analysis', false, undefined, err.message);
  }

  // 4. TEST RECOMMENDATIONS
  await new Promise((r) => setTimeout(r, 1200));
  try {
    const res = await fetch(`${BASE_URL}/api/ai/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        context: testBusinessContext,
      }),
    });

    const data = (await res.json()) as any;
    const a = data.analysis;
    const hasRecs = a && Array.isArray(a.recommendations) && a.recommendations.length > 0;
    const validRecs = hasRecs && a.recommendations.every((r: any) => r.action && r.expectedImpact && r.priority);
    const passed = res.ok && data.success && validRecs && a.analysisType === 'recommendations';
    record(
      '4. Recommendations',
      'POST /api/ai/recommendations',
      passed,
      `Prioritized ${a?.recommendations?.length} actions. Priorities: ${a?.recommendations?.map((r: any) => r.priority).join(', ')}`,
      data.error
    );
  } catch (err: any) {
    record('4. Recommendations', 'POST /api/ai/recommendations', false, undefined, err.message);
  }

  // 5. TEST EMPTY DATASET HANDLING
  await new Promise((r) => setTimeout(r, 1200));
  try {
    const emptyContext = {
      business: { id: `biz_${uid.slice(0, 10)}`, name: 'Unpopulated Store', ownerId: uid },
      products: [],
      sales: [],
      customers: [],
      expenses: [],
    };

    const res = await fetch(`${BASE_URL}/api/ai/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        question: 'What is my current monthly revenue?',
        context: emptyContext,
      }),
    });

    const data = (await res.json()) as any;
    const a = data.analysis;
    const handledEmpty = a && (
      (Array.isArray(a.insufficientDataNotes) && a.insufficientDataNotes.length > 0) ||
      a.summary.toLowerCase().includes('0') ||
      a.summary.toLowerCase().includes('empty') ||
      a.summary.toLowerCase().includes('no')
    );
    const passed = res.ok && data.success && handledEmpty;
    record(
      '5. Empty Datasets',
      'Zero products, zero sales, zero expenses handled without crashing',
      passed,
      `Insufficient Data Notes: ${a?.insufficientDataNotes?.join('; ') || 'None stated'}`,
      data.error
    );
  } catch (err: any) {
    record('5. Empty Datasets', 'Zero products, zero sales handled without crashing', false, undefined, err.message);
  }

  // 6. MULTI-TENANT ISOLATION SECURITY AUDIT
  await new Promise((r) => setTimeout(r, 1200));
  try {
    // Malicious context injection: Business A user tries to inject records tagged with 'attacker_tenant_b'
    const hostileContext = {
      business: { id: 'alien_biz', name: 'Victim Business B', ownerId: 'victim_tenant_b' },
      products: [
        { id: 'stealth1', name: 'Confidential Prototype B', price: 9999, ownerId: 'victim_tenant_b' },
        { id: 'legit1', name: 'My Own Product', price: 10, ownerId: uid },
      ],
      sales: [
        { orderNumber: 'VICTIM-001', amount: 50000, ownerId: 'victim_tenant_b' },
        { orderNumber: 'MINE-001', amount: 20, ownerId: uid },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/ai/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        question: 'What is my total sales volume and prototype status?',
        context: hostileContext,
      }),
    });

    const data = (await res.json()) as any;
    const a = data?.analysis;
    if (!res.ok || !data?.success || !a) {
      record(
        '6. Multi-Tenant Security',
        'Foreign tenant data strictly purged before Gemini ingestion',
        false,
        undefined,
        data?.error || `HTTP ${res.status}`
      );
    } else {
      // The AI context must NOT include $50,000 or Confidential Prototype B because ownerId !== uid
      const aStr = JSON.stringify(a);
      const leakedVictimRevenue = aStr.includes('50000') || aStr.includes('50,000');
      const leakedVictimPrototype = aStr.includes('Confidential Prototype B');
      const isolated = !leakedVictimRevenue && !leakedVictimPrototype && a.ownerId === uid;

      record(
        '6. Multi-Tenant Security',
        'Foreign tenant data strictly purged before Gemini ingestion',
        isolated,
        `Alien revenue leaked: ${leakedVictimRevenue}, Alien product leaked: ${leakedVictimPrototype}. Verified UID: ${a?.ownerId}`,
        leakedVictimRevenue ? 'VICTIM DATA LEAKED' : undefined
      );
    }
  } catch (err: any) {
    record('6. Multi-Tenant Security', 'Foreign tenant data purged', false, undefined, err.message);
  }

  // 7. INVALID / FORGED TOKEN REJECTION
  try {
    const res = await fetch(`${BASE_URL}/api/ai/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid.forged.signature.token',
      },
      body: JSON.stringify({ question: 'Can I access this without authenticating?' }),
    });

    const passed = res.status === 401;
    record(
      '7. Security Hardening',
      'Reject forged/invalid Bearer token with HTTP 401',
      passed,
      `HTTP Status: ${res.status}`,
      res.status !== 401 ? `Unexpected status: ${res.status}` : undefined
    );
  } catch (err: any) {
    record('7. Security Hardening', 'Reject forged Bearer token', false, undefined, err.message);
  }

  // Print Summary Table
  console.log('\n====================================================');
  console.log('PHASE 3 VERIFICATION RESULTS SUMMARY:');
  console.log('====================================================');
  const allPassed = results.every((r) => r.passed);
  console.table(
    results.map((r) => ({
      Suite: r.suite,
      Test: r.name,
      Status: r.passed ? 'PASS' : 'FAIL',
      Details: r.details ? r.details.slice(0, 60) + '...' : '',
    }))
  );

  if (allPassed) {
    console.log('\n🎉 ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME VERIFICATION TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
