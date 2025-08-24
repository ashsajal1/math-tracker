import { CostData } from "../store/costStore";

// Define the FundTransaction type here to avoid circular dependencies
type FundTransaction = {
  id: string;
  fundId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'cost';
  date: string;
  note?: string;
  relatedTransactionId?: string;
  category?: string;
};

export interface FundSummary {
  totalFunds: number;
  totalSpent: number;
  remaining: number;
  percentageSpent: number;
}

export interface CostSummary {
  totalCost: number;
  costByReason: Record<string, number>;
  highestCostReason: string;
  averageCost: number;
}

export interface MonthlySummary extends FundSummary {
  month: string;
  year: number;
}

export interface MonthlyCostSummary {
  month: string;
  year: number;
  totalCost: number;
  costByReason: Record<string, number>;
  averageCost: number;
}

export const calculateFundSummary = (transactions: FundTransaction[]): FundSummary => {
  const summary: FundSummary = {
    totalFunds: 0,
    totalSpent: 0,
    remaining: 0,
    percentageSpent: 0,
  };

  transactions.forEach(transaction => {
    if (transaction.type === 'deposit') {
      summary.totalFunds += transaction.amount;
    } else if (transaction.type === 'withdrawal' || transaction.type === 'cost') {
      summary.totalSpent += transaction.amount;
      summary.totalFunds += transaction.amount;
    } else if (['withdrawal', 'transfer'].includes(transaction.type)) {
      summary.totalSpent += transaction.amount;
    }
  });

  summary.remaining = summary.totalFunds - summary.totalSpent;
  summary.percentageSpent = summary.totalFunds > 0 
    ? (summary.totalSpent / summary.totalFunds) * 100 
    : 0;

  return summary;
};

export const calculateMonthlySummary = (transactions: FundTransaction[]): MonthlySummary[] => {
  const monthlyData: Record<string, MonthlySummary> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const key = `${year}-${date.getMonth()}`;
    
    if (!monthlyData[key]) {
      monthlyData[key] = {
        month,
        year,
        totalFunds: 0,
        totalSpent: 0,
        remaining: 0,
        percentageSpent: 0,
      };
    }
    
    if (transaction.type === 'deposit') {
      monthlyData[key].totalFunds += transaction.amount;
    } else if (['withdrawal', 'transfer'].includes(transaction.type)) {
      monthlyData[key].totalSpent += transaction.amount;
    }
    
    monthlyData[key].remaining = monthlyData[key].totalFunds - monthlyData[key].totalSpent;
    monthlyData[key].percentageSpent = monthlyData[key].totalFunds > 0
      ? (monthlyData[key].totalSpent / monthlyData[key].totalFunds) * 100
      : 0;
  });
  
  // Sort by year and month (newest first)
  return Object.values(monthlyData).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month.localeCompare(a.month);
  });
};

export const getFundsByRange = (transactions: FundTransaction[], startDate: Date, endDate: Date): FundSummary => {
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
  
  return calculateFundSummary(filteredTransactions);
};

// New cost calculation functions
export const calculateCostSummary = (costs: CostData[]): CostSummary => {
  const costByReason: Record<string, number> = {};
  let totalCost = 0;

  costs.forEach(cost => {
    costByReason[cost.reason] = (costByReason[cost.reason] || 0) + cost.cost;
    totalCost += cost.cost;
  });

  const highestCostReason = Object.entries(costByReason)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

  return {
    totalCost,
    costByReason,
    highestCostReason,
    averageCost: costs.length ? totalCost / costs.length : 0,
  };
};

export const calculateMonthlyCostSummary = (costs: CostData[]): MonthlyCostSummary[] => {
  const monthlyData: Record<string, MonthlyCostSummary> = {};
  
  costs.forEach(cost => {
    const date = new Date(cost.date);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const key = `${year}-${date.getMonth()}`;
    
    if (!monthlyData[key]) {
      monthlyData[key] = {
        month,
        year,
        totalCost: 0,
        costByReason: {},
        averageCost: 0,
      };
    }
    
    monthlyData[key].totalCost += cost.cost;
    monthlyData[key].costByReason[cost.reason] = 
      (monthlyData[key].costByReason[cost.reason] || 0) + cost.cost;
  });
  
  // Calculate averages and sort by date
  const summaries = Object.values(monthlyData);
  summaries.forEach(summary => {
    const monthCosts = costs.filter(cost => {
      const date = new Date(cost.date);
      return date.toLocaleString('default', { month: 'short' }) === summary.month 
        && date.getFullYear() === summary.year;
    });
    summary.averageCost = monthCosts.length ? summary.totalCost / monthCosts.length : 0;
  });
  
  return summaries.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month.localeCompare(a.month);
  });
};

export const getCostsByRange = (costs: CostData[], startDate: Date, endDate: Date): CostSummary => {
  const filteredCosts = costs.filter(cost => {
    const costDate = new Date(cost.date);
    return costDate >= startDate && costDate <= endDate;
  });
  
  return calculateCostSummary(filteredCosts);
};
