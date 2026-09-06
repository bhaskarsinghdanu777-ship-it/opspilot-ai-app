import { AiAnalysis } from '@/src/types';

export const suggestedQuestions = [
  'Why did my revenue decrease this month?',
  'Which products need attention?',
  'Which customers are at risk?',
  'What should I focus on this week?',
  'Where am I losing money?',
];

export const sampleAnalyses: Record<string, AiAnalysis> = {
  'Why did my revenue decrease this month?': {
    id: 'ai-rev-1',
    query: 'Why did my revenue decrease this month?',
    title: 'Revenue Decline Root-Cause Analysis',
    date: '05 Sep 2026, 18:30 IST',
    confidence: 94,
    summary:
      'Total revenue declined 14.8% (down ₹1,46,000 from ₹9,88,000 in August). The decline is heavily concentrated in the Electronics category (-21%), directly induced by prolonged out-of-stock periods on 3 high-velocity SKUs and a 12% decrease in walk-in conversions during mid-week days.',
    evidence: [
      'Electronics category gross billing contracted from ₹4,48,000 to ₹3,54,000 (-21.0%).',
      'UltraSpeed USB-C Multi-Hub 7-in-1, SonicBass Headphones, and 65W GaN Fast Charger generated ₹0 sales across the last 6 days due to 0-inventory stockouts.',
      'Historical velocity shows these 3 products normally contribute ₹1,12,000 / month (~76.7% of the observed revenue gap).',
      'Average Order Value (AOV) softened slightly from ₹692 to ₹655 (-5.3%) due to lower attach-rate of high-margin peripherals.',
    ],
    keyFactors: [
      {
        title: 'Critical Inventory Stockouts',
        description:
          'Supplier shipment PO #882 was delayed by 4 business days, causing 3 staple margin-drivers to run out concurrently.',
        severity: 'critical',
      },
      {
        title: 'Mid-Week Footfall Slump',
        description:
          'Tuesday and Wednesday in-store transactions dropped 19% compared to last month’s averages.',
        severity: 'warning',
      },
      {
        title: 'Uncompensated Category Reliance',
        description:
          'Growth in Audio & Acoustics (+6%) was insufficient to counterbalance the primary electronics shortfall.',
        severity: 'info',
      },
    ],
    recommendations: [
      {
        action: 'Expedite restock PO #882 for USB-C Hubs and 65W GaN Chargers with priority air courier.',
        expectedImpact: '+₹45,000 revenue recapture within 10 days',
        timeframe: 'Immediate (24-48 hrs)',
        priority: 'High',
      },
      {
        action: 'Launch mid-week "Tech Upgrade Blitz" bundle discount (e.g. Keyboard + Vertical Mouse).',
        expectedImpact: 'Stimulate +15% weekday transaction volume',
        timeframe: 'Next 7 days',
        priority: 'Medium',
      },
      {
        action: 'Re-calibrate reorder safety threshold from 10 units to 20 units for top 5 velocity items.',
        expectedImpact: 'Prevent recurring stockout risks over Q4',
        timeframe: 'Next 14 days',
        priority: 'Medium',
      },
    ],
  },

  'Which products need attention?': {
    id: 'ai-prod-1',
    query: 'Which products need attention?',
    title: 'Critical Product & SKU Health Audit',
    date: '05 Sep 2026, 17:15 IST',
    confidence: 96,
    summary:
      '3 top revenue drivers are fully depleted (Out of Stock), representing ₹28,000 weekly unfulfilled demand. Additionally, 4 items have breached safety thresholds and will stock out within 48 hours at current sales velocity.',
    evidence: [
      'UltraSpeed USB-C Multi-Hub: Stock 0 | Demand velocity 28 units/week | Est. daily loss: ₹11,596.',
      'SonicBass ANC Headphones: Stock 0 | 32 backorders pending | Est. daily loss: ₹13,570.',
      '65W GaN Fast Charger: Stock 0 | Velocity 34 units/week | Stockout duration: 5 days.',
      'Ergonomic Vertical Mouse & Mechanical Keyboard: Stock 3 and 4 units remaining respectively.',
    ],
    keyFactors: [
      {
        title: 'Supply Chain Bottleneck',
        description: 'Lead times for primary electronics distributor extended from 3 to 7 days.',
        severity: 'critical',
      },
      {
        title: 'Inadequate Safety Buffers',
        description: 'Threshold limits set in June were based on slower off-season volumes.',
        severity: 'warning',
      },
      {
        title: 'Dead Capital in Slow Moving SKUs',
        description: 'Over ₹1.2L locked up in low-velocity mobile accessories with turnover < 1.1x.',
        severity: 'info',
      },
    ],
    recommendations: [
      {
        action: 'Split supplier purchase orders across dual vendors to reduce single-point lead time lag.',
        expectedImpact: 'Cuts fulfillment delays by 60%',
        timeframe: 'Next 3 days',
        priority: 'High',
      },
      {
        action: 'Immediate emergency transfer/reorder for USB-C Hub & GaN Chargers.',
        expectedImpact: 'Restores ₹35,000/week baseline cashflow',
        timeframe: 'Immediate',
        priority: 'High',
      },
      {
        action: 'Liquidate slow-moving mobile gear through clearance endcap or buy-one-get-one deals.',
        expectedImpact: 'Unlocks ~₹40,000 working capital',
        timeframe: 'Next 10 days',
        priority: 'Medium',
      },
    ],
  },

  'Which customers are at risk?': {
    id: 'ai-cust-1',
    query: 'Which customers are at risk?',
    title: 'Customer Churn & Retention Vulnerability Scan',
    date: '05 Sep 2026, 15:45 IST',
    confidence: 91,
    summary:
      '142 registered repeat customers have not made a purchase in 60+ days, exceeding their historical average inter-purchase interval of 26 days. At-risk accounts represent ₹1,84,000 in previous quarterly spending.',
    evidence: [
      'High-value repeat clients (e.g. Sunil Chettiar, Meera Nambiar, Karan Malhotra) crossed 60-day silence threshold.',
      '71% of at-risk clients previously bought computing or audio hardware and haven’t viewed new arrivals.',
      'Customer churn rate increased by 2.4% month-over-month.',
      'Average satisfaction rating on repeat orders remains high (4.7/5), indicating absence is engagement-driven rather than quality-driven.',
    ],
    keyFactors: [
      {
        title: 'Lack of Automated Lifecycle Messaging',
        description: 'No post-purchase re-engagement or accessory upgrade triggers are active.',
        severity: 'warning',
      },
      {
        title: 'High Lifetime Value at Stake',
        description: 'Top 25 at-risk accounts spent an average of ₹22,000 each in the past year.',
        severity: 'critical',
      },
      {
        title: 'Competitive Local Proximity',
        description: 'Two new consumer electronics outlets opened within a 3km radius last month.',
        severity: 'info',
      },
    ],
    recommendations: [
      {
        action: 'Trigger targeted WhatsApp re-engagement campaign with personalized ₹300 loyalty vouchers.',
        expectedImpact: 'Expected reactivation of 25-35 high-value buyers',
        timeframe: 'Next 48 hrs',
        priority: 'High',
      },
      {
        action: 'Assign store assistant to personally phone VIP corporate buyers with custom catalog offers.',
        expectedImpact: 'Secures repeat orders worth ₹50,000+',
        timeframe: 'Next 5 days',
        priority: 'High',
      },
      {
        action: 'Introduce customer loyalty tier rewards (VIP Club) with priority restock reservations.',
        expectedImpact: '+18% long-term customer lifetime value',
        timeframe: 'Next 30 days',
        priority: 'Medium',
      },
    ],
  },

  'What should I focus on this week?': {
    id: 'ai-focus-1',
    query: 'What should I focus on this week?',
    title: 'Weekly Executive Operations Action Plan',
    date: '05 Sep 2026, 12:00 IST',
    confidence: 95,
    summary:
      'This week’s highest-leverage priorities focus on resolving the inventory crisis for top sellers, launching a targeted weekend audio/computing promotion, and re-engaging top dormant VIP customers.',
    evidence: [
      'Stockouts are burning ₹4,000/day in pure gross margin loss.',
      'Saturday footfall peaks historically at 2.4x regular weekdays — weekend readiness is paramount.',
      'Fixed monthly rent of ₹55,000 is due in 3 days; maximizing gross margin velocity protects liquidity.',
    ],
    keyFactors: [
      {
        title: 'Inventory Priority #1',
        description: 'Restock clearance for USB-C Hub and Fast Chargers must close before Friday.',
        severity: 'critical',
      },
      {
        title: 'Margin Optimization',
        description: 'Audio accessories yield 58% margin vs 34% on base electronics.',
        severity: 'info',
      },
      {
        title: 'Staff Scheduling',
        description: 'Ensure store staffing is concentrated between 4 PM - 9 PM peak shopping hours.',
        severity: 'info',
      },
    ],
    recommendations: [
      {
        action: 'Call supplier dispatch to confirm express delivery tracking for PO #882.',
        expectedImpact: 'Guarantees weekend inventory availability',
        timeframe: 'Today by 3 PM',
        priority: 'High',
      },
      {
        action: 'Set up "Desk Setup Bundle" promo featuring Mechanical Keyboards and Mice at 8% discount.',
        expectedImpact: 'Targets ₹60,000 in weekend computing turnover',
        timeframe: 'Thursday',
        priority: 'Medium',
      },
      {
        action: 'Broadcast WhatsApp campaign to 142 at-risk accounts with weekend early-access code.',
        expectedImpact: 'Drives 20-30 weekend visits',
        timeframe: 'Friday Morning',
        priority: 'High',
      },
    ],
  },

  'Where am I losing money?': {
    id: 'ai-money-1',
    query: 'Where am I losing money?',
    title: 'Expense & Profit Leakage Diagnostic',
    date: '05 Sep 2026, 10:15 IST',
    confidence: 93,
    summary:
      'Profit leakage is driven by two fronts: ₹1,12,000 in unrealized gross revenue from stockouts, combined with a 24% surge in per-parcel expedited courier costs and high unmonitored digital ad spend without direct conversion tracking.',
    evidence: [
      'Expedited intra-city shipping costs rose from ₹6,200 to ₹9,500 (+53%) due to last-minute distributor pickups.',
      'Marketing ad spend of ₹14,000 generated only 18 tracked online conversions (₹777 customer acquisition cost).',
      'Defective returns on low-cost Cat7 cables reached 6.2% return rate (supplier credit pending).',
      'Rent represents 37.2% of total operational expenditure, requiring higher revenue throughput to amortize.',
    ],
    keyFactors: [
      {
        title: 'Emergency Courier Surcharges',
        description: 'Frequent stock depletion forces costly single-item emergency courier pickups.',
        severity: 'warning',
      },
      {
        title: 'Sub-Optimal Ad Targeting',
        description: 'Google/Meta campaigns are running broad radius rather than high-density 5km pin codes.',
        severity: 'warning',
      },
      {
        title: 'Unclaimed Supplier RMA Credits',
        description: '₹4,800 in defective inventory is sitting in backroom awaiting credit notes.',
        severity: 'info',
      },
    ],
    recommendations: [
      {
        action: 'Consolidate supplier logistics into scheduled bi-weekly freight instead of emergency parcels.',
        expectedImpact: 'Saves ₹3,800/month in freight waste',
        timeframe: 'Next 7 days',
        priority: 'High',
      },
      {
        action: 'Narrow digital ad radius to 5km hyper-local catchment with in-store redemption coupons.',
        expectedImpact: 'Cuts CAC by ~40% and lifts verified store visits',
        timeframe: 'Immediate',
        priority: 'High',
      },
      {
        action: 'File official vendor RMA claim for 8 defective cable batches.',
        expectedImpact: 'Recovers ₹4,800 instant credit balance',
        timeframe: 'This week',
        priority: 'Medium',
      },
    ],
  },
};
