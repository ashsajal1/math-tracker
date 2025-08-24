import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import useFundStore, { type FundTransaction } from '@/lib/store/fundStore';
import type { FundTransaction as UtilFundTransaction, CategoryType } from '@/lib/utils/fundCalculations';
import { calculateMonthlySummary, type MonthlySummary } from '@/lib/utils/fundCalculations';
import { DollarSign } from 'lucide-react';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol'
  }).format(amount);
};

export default function Dashboard() {
  const { transactions, globalBalance } = useFundStore();
  
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);

  useEffect(() => {
    // Transform transactions to match utility function expectations
    const transformTransactions = (txs: FundTransaction[]): UtilFundTransaction[] => txs.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type === 'transfer' ? 'withdrawal' : tx.type,
      date: tx.date,
      note: tx.note || '',
      category: tx.category as CategoryType | undefined
    }));

    // Calculate monthly summaries
    const monthlySummaries = calculateMonthlySummary(transformTransactions(transactions));
    setMonthlyData(monthlySummaries);
  }, [transactions]);

  const StatCard = ({ title, value, description, icon: Icon, trend }: { 
    title: string; 
    value: string; 
    description: string; 
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-4 w-4 ${
          trend === 'up' ? 'text-green-500' : 
          trend === 'down' ? 'text-red-500' : 
          'text-muted-foreground'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const MonthlyCard = ({ month, year, totalFunds, totalSpent }: MonthlySummary) => {
    const spendingPercentage = totalFunds > 0 ? (totalSpent / totalFunds) * 100 : 0;
    
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">{month} {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="font-semibold text-green-500">+{formatCurrency(totalFunds)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="font-semibold text-red-500">-{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Spending vs Income</span>
              <span>{Math.round(spendingPercentage)}%</span>
            </div>
            <Progress value={spendingPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Funds Overview</h2>
      
      <div className="mb-6">
        <StatCard
          title="Global Balance"
          value={formatCurrency(globalBalance)}
          description={`${transactions.length} transactions total`}
          icon={DollarSign}
          trend={globalBalance > 0 ? "up" : "neutral"}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Monthly Breakdown</h3>
        {monthlyData.length > 0 ? (
          monthlyData.map((data) => (
            <MonthlyCard key={`${data.month}-${data.year}`} {...data} />
          ))
        ) : (
          <p className="text-muted-foreground">No monthly data available</p>
        )}
      </div>
    </div>
  );
}
