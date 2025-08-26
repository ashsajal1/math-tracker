import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import useFundStore from '@/lib/store/fundStore';
import type { FundTransaction as UtilFundTransaction, CategoryType } from '@/lib/utils/fundCalculations';
import { calculateMonthlySummary, type MonthlySummary } from '@/lib/utils/fundCalculations';
import { DollarSign } from 'lucide-react';
import { FundTransaction } from '@/lib/store/types';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol'
  }).format(amount);
};

export default function Dashboard() {
  const { transactions, globalBalance, globalCost } = useFundStore();
  
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Overview</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(globalBalance)}</div>
                <p className="text-xs text-muted-foreground">Available Balance ({transactions.length} transactions)</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">-{formatCurrency(globalCost)}</div>
                <p className="text-xs text-muted-foreground">Total Spent Since Last Deposit</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spending Ratio</span>
                  <span>{globalBalance > 0 ? Math.round((globalCost / (globalBalance + globalCost)) * 100) : 0}%</span>
                </div>
                <Progress 
                  value={globalBalance > 0 ? (globalCost / (globalBalance + globalCost)) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
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
