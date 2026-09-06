import { InventoryAlert, RecommendedAction } from '@/src/types';

export const dashboardMetrics = {
  revenue: {
    title: 'Revenue',
    value: '₹8,42,000',
    rawVal: 842000,
    change: '-14.8%',
    isPositive: false,
    comparison: 'vs previous period',
  },
  orders: {
    title: 'Orders',
    value: '1,284',
    rawVal: 1284,
    change: '+8.4%',
    isPositive: true,
    comparison: 'vs previous period',
  },
  profit: {
    title: 'Estimated Profit',
    value: '₹2,16,000',
    rawVal: 216000,
    change: '-6.2%',
    isPositive: false,
    comparison: 'vs previous period',
  },
  alerts: {
    title: 'Alerts',
    value: '7',
    subtext: '3 critical',
    criticalCount: 3,
    totalCount: 7,
  },
};

export const revenueTrendData = [
  { month: 'Apr', current: 720000, previous: 680000 },
  { month: 'May', current: 780000, previous: 710000 },
  { month: 'Jun', current: 890000, previous: 790000 },
  { month: 'Jul', current: 980000, previous: 850000 },
  { month: 'Aug', current: 988000, previous: 890000 },
  { month: 'Sep (Current)', current: 842000, previous: 988000 },
];

export const salesByCategoryData = [
  { category: 'Electronics', amount: 354000, percentage: 42, color: '#2563eb' },
  { category: 'Audio & Acoustics', amount: 195000, percentage: 23, color: '#0284c7' },
  { category: 'Accessories', amount: 143000, percentage: 17, color: '#0d9488' },
  { category: 'Computing & Peripherals', amount: 101000, percentage: 12, color: '#f59e0b' },
  { category: 'Mobile Gear', amount: 49000, percentage: 6, color: '#6366f1' },
];

export const inventoryAlerts: InventoryAlert[] = [
  {
    id: 'alt-1',
    product: 'UltraSpeed USB-C Multi-Hub 7-in-1',
    category: 'Accessories',
    stock: 0,
    status: 'Out of Stock',
    action: 'Restock immediately (Lead time: 3 days)',
    urgency: 'high',
  },
  {
    id: 'alt-2',
    product: 'SonicBass Noise-Cancelling Headphones',
    category: 'Audio',
    stock: 0,
    status: 'Out of Stock',
    action: '32 backorders pending. Expedite supplier PO #882',
    urgency: 'high',
  },
  {
    id: 'alt-3',
    product: '65W GaN Fast Charger Dual-Port',
    category: 'Electronics',
    stock: 0,
    status: 'Out of Stock',
    action: 'Reorder 100 units from TechVibe Dist.',
    urgency: 'high',
  },
  {
    id: 'alt-4',
    product: 'Ergonomic Vertical Wireless Mouse',
    category: 'Computing',
    stock: 3,
    status: 'Low Stock',
    action: 'Reorder suggested threshold: 15 units',
    urgency: 'medium',
  },
  {
    id: 'alt-5',
    product: 'Mechanical Gaming Keyboard RGB',
    category: 'Computing',
    stock: 4,
    status: 'Low Stock',
    action: 'Review supplier pricing before restock',
    urgency: 'medium',
  },
];

export const aiInsightCardData = {
  quote:
    'Revenue decreased 14.8% compared with the previous period. Electronics sales declined 21%, while 3 high-demand products are currently out of stock.',
  impactMetric: 'Estimated lost sales: ₹1,12,000 due to stockouts',
  suggestedFocus: 'Supply chain replenishment for high-velocity SKUs & category flash sale.',
};

export const recommendedActions: RecommendedAction[] = [
  {
    id: 'act-1',
    title: 'Restock USB-C Hub',
    description: 'High velocity SKU out of stock for 6 days. 42 customer inquiries recorded.',
    impact: '+₹45,000 est. monthly recovery',
    category: 'inventory',
  },
  {
    id: 'act-2',
    title: 'Launch weekend promotion',
    description: 'Run 10% bundle promotion on Audio & Computing categories to offset electronics dip.',
    impact: '+8-12% sales lift expected',
    category: 'marketing',
  },
  {
    id: 'act-3',
    title: 'Contact inactive customers',
    description: 'Send personalized WhatsApp/SMS re-engagement offers to 142 at-risk buyers.',
    impact: 'Recover ~15-20 dormant accounts',
    category: 'customer',
  },
];
