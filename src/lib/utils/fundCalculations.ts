// Define the FundTransaction type here to avoid circular dependencies
type CategoryType = "Household" | "Transport" | "Food" | "Entertainment" | "Education" | "Health" | "Other";

type FundTransaction = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'cost';
  amount: number;
  category?: CategoryType;
  note?: string;
  date: string;
};

export interface FundSummary {
  totalFunds: number;
  totalSpent: number;
  remaining: number;
  percentageSpent: number;
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
    } else if (transaction.type === 'withdrawal' || transaction.type === 'cost') {
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
