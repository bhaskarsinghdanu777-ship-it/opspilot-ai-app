import { ExpenseCategory, ExpenseItem } from '@/src/types';

export const expenseSummary = {
  totalExpenses: '₹6,26,000',
  monthlyExpenses: '₹1,48,000',
  largestCategory: 'Rent (₹55,000 / 37.2%)',
  monthOverMonthChange: '+3.4%',
  netMarginRatio: '25.6%',
};

export const expenseCategoryBreakdown = [
  { category: 'Rent' as ExpenseCategory, amount: 55000, percentage: 37.2, color: '#2563eb' },
  { category: 'Salary' as ExpenseCategory, amount: 42000, percentage: 28.4, color: '#0d9488' },
  { category: 'Suppliers' as ExpenseCategory, amount: 22000, percentage: 14.9, color: '#f59e0b' },
  { category: 'Marketing' as ExpenseCategory, amount: 14000, percentage: 9.5, color: '#8b5cf6' },
  { category: 'Shipping' as ExpenseCategory, amount: 9500, percentage: 6.4, color: '#ec4899' },
  { category: 'Utilities' as ExpenseCategory, amount: 5500, percentage: 3.7, color: '#64748b' },
];

export const mockExpensesData: ExpenseItem[] = [
  {
    id: 'exp-1',
    date: '01 Sep, 2026',
    category: 'Rent',
    description: 'Commercial Showroom Lease - Indiranagar Main 100ft Rd',
    amount: 55000,
    vendor: 'Brigade Commercial Properties',
    status: 'Paid',
  },
  {
    id: 'exp-2',
    date: '01 Sep, 2026',
    category: 'Salary',
    description: 'Store staff & technician monthly payroll (3 personnel)',
    amount: 42000,
    vendor: 'Internal Payroll Ops',
    status: 'Paid',
  },
  {
    id: 'exp-3',
    date: '28 Aug, 2026',
    category: 'Suppliers',
    description: 'Component freight & clearance invoice #IN-8891',
    amount: 22000,
    vendor: 'TechVibe Electronics Wholesale Ltd',
    status: 'Paid',
  },
  {
    id: 'exp-4',
    date: '25 Aug, 2026',
    category: 'Marketing',
    description: 'Meta & Google Local Store Visits Ad Campaigns',
    amount: 14000,
    vendor: 'Google India & Meta Ads',
    status: 'Paid',
  },
  {
    id: 'exp-5',
    date: '22 Aug, 2026',
    category: 'Shipping',
    description: 'BlueDart & Delhivery intra-city hyper-delivery package contract',
    amount: 9500,
    vendor: 'BlueDart Express Ltd',
    status: 'Paid',
  },
  {
    id: 'exp-6',
    date: '20 Aug, 2026',
    category: 'Utilities',
    description: 'BESCOM High-Tension Commercial Electricity Bill',
    amount: 4200,
    vendor: 'BESCOM Karnataka',
    status: 'Paid',
  },
  {
    id: 'exp-7',
    date: '18 Aug, 2026',
    category: 'Utilities',
    description: 'Airtel Business Optical Fiber 1Gbps + Fixed VoIP Line',
    amount: 1300,
    vendor: 'Airtel Broadband Telecommunications',
    status: 'Paid',
  },
];
