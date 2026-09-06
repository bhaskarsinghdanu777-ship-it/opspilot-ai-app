export interface HistoryAnalysisItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  query: string;
  impactHighlight: string;
  status: 'Completed';
  category: 'Revenue' | 'Inventory' | 'Customers' | 'Strategy';
}

export const mockHistoryAnalyses: HistoryAnalysisItem[] = [
  {
    id: 'hist-1',
    title: 'Revenue Decline Analysis',
    date: '05 Sep 2026, 18:30 IST',
    summary:
      'Pinpointed 14.8% monthly revenue drop to stockouts in 3 key electronics SKUs, causing ₹1.12L in missed transactions during peak hours.',
    query: 'Why did my revenue decrease this month?',
    impactHighlight: '₹1,12,000 lost revenue identified',
    status: 'Completed',
    category: 'Revenue',
  },
  {
    id: 'hist-2',
    title: 'Inventory Risk Analysis',
    date: '04 Sep 2026, 14:15 IST',
    summary:
      'Identified 3 depleted SKUs and 4 products nearing stockout safety thresholds. Recommended dual-sourcing suppliers to shorten lead times.',
    query: 'Which products need attention?',
    impactHighlight: '7 SKUs flagged for immediate restock',
    status: 'Completed',
    category: 'Inventory',
  },
  {
    id: 'hist-3',
    title: 'Customer Retention Analysis',
    date: '31 Aug 2026, 11:20 IST',
    summary:
      'Discovered 142 repeat buyers inactive for >60 days with ₹1.84L historical quarterly value. Outlined targeted WhatsApp retention strategy.',
    query: 'Which customers are at risk?',
    impactHighlight: '142 at-risk accounts segmented',
    status: 'Completed',
    category: 'Customers',
  },
  {
    id: 'hist-4',
    title: 'Weekly Business Recommendations',
    date: '28 Aug 2026, 09:45 IST',
    summary:
      'Formulated actionable operational priorities focusing on weekend promotion bundles, urgent courier tracking, and staffing during 4-9 PM peaks.',
    query: 'What should I focus on this week?',
    impactHighlight: '3 high-priority actions implemented',
    status: 'Completed',
    category: 'Strategy',
  },
];
