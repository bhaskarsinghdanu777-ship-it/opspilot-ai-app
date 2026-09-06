export type RoutePath =
  | '/login'
  | '/signup'
  | '/dashboard'
  | '/sales'
  | '/inventory'
  | '/customers'
  | '/expenses'
  | '/ai'
  | '/history';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  businessId: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  ownerId: string;
  createdAt: string;
}

export type InventoryStatus = 'Normal' | 'Low Stock' | 'Out of Stock';

export type CustomerStatus = 'VIP' | 'Active' | 'At Risk' | 'Inactive';

export type ExpenseCategory =
  | 'Rent'
  | 'Marketing'
  | 'Shipping'
  | 'Suppliers'
  | 'Utilities'
  | 'Salary';

export interface ProductItem {
  id: string;
  businessId?: string;
  ownerId?: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  threshold: number;
  salesVelocity: string;
  status: InventoryStatus;
  supplierLeadTimeDays?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleItem {
  id: string;
  businessId?: string;
  ownerId?: string;
  orderNumber: string;
  date: string;
  customerName: string;
  category: string;
  items: string;
  channel: 'In-Store' | 'Online Store';
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'NetBanking';
  amount: number;
  status: 'Completed' | 'Processing' | 'Refunded';
  createdAt?: string;
}

export interface CustomerItem {
  id: string;
  businessId?: string;
  ownerId?: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpend: number;
  lastPurchase: string;
  status: CustomerStatus;
  preferredCategory: string;
  createdAt?: string;
}

export interface ExpenseItem {
  id: string;
  businessId?: string;
  ownerId?: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  vendor: string;
  status: 'Paid' | 'Pending';
  createdAt?: string;
}

export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext?: string;
  critical?: boolean;
}

export interface InventoryAlert {
  id: string;
  product: string;
  category: string;
  stock: number;
  status: InventoryStatus;
  action: string;
  urgency: 'high' | 'medium';
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: 'inventory' | 'marketing' | 'customer';
  completed?: boolean;
}

export interface AiRiskItem {
  category: 'declining_sales' | 'order_patterns' | 'low_performing_products' | 'inventory' | 'customer' | 'profit_risk' | 'general';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  explanation: string;
  supportingData: string;
  recommendedAction: string;
}

export interface AiExecutiveSummaryDetails {
  revenuePerformance: string;
  orderTrends: string;
  estimatedProfit: string;
  operationalChanges: string;
  majorRisks: string;
  recommendedActionsSummary: string;
}

export interface AiAnalysis {
  id?: string;
  businessId?: string;
  ownerId?: string;
  query: string;
  title: string;
  date: string;
  confidence: number;
  summary: string;
  evidence: string[];
  keyFactors: {
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
  }[];
  recommendations: {
    action: string;
    expectedImpact: string;
    timeframe: string;
    priority: 'High' | 'Medium' | 'Low';
    explainableReason?: string;
  }[];
  executiveSummary?: AiExecutiveSummaryDetails;
  risks?: AiRiskItem[];
  factsFromData?: string[];
  insufficientDataNotes?: string[];
  analysisType?: 'executive_summary' | 'risk_analysis' | 'recommendations' | 'natural_language_query';
  dataPeriod?: string;
  createdAt?: string;
  timestamp?: string;
  generatedBy?: string;
}

export type AiAnalysisResult = AiAnalysis;
