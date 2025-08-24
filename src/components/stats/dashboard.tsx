import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import useFundStore from '@/lib/store/fundStore';
import { calculateFundSummary, calculateMonthlySummary, type MonthlySummary } from '@/lib/utils/fundCalculations';
import { Calendar, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol'
  }).format(amount);
};

export default function Dashboard() {
  const { 
    transactions, 
    getTransactionsByDateRange, 
    globalBalance,
    getTotalCostsByCategory 
  } = useFundStore();
  
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);
  const [currentMonthSummary, setCurrentMonthSummary] = useState<MonthlySummary | null>(null);
  const [costsByCategory, setCostsByCategory] = useState<Record<string, number>>({});
  const [totalSummary, setTotalSummary] = useState({
    totalFunds: 0,
    totalSpent: 0,
    remaining: globalBalance,
    percentageSpent: 0,
  });

  useEffect(() => {
    // Calculate total summary including costs
    const summary = calculateFundSummary(transactions);
    setTotalSummary({
      ...summary,
      remaining: globalBalance
    });

    // Update costs by category
    setCostsByCategory(getTotalCostsByCategory());

    // Calculate monthly summaries
    const monthlySummaries = calculateMonthlySummary(transactions);
    setMonthlyData(monthlySummaries);

    // Calculate current month summary
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const currentMonthTransactions = getTransactionsByDateRange(firstDayOfMonth, lastDayOfMonth);
    const currentMonthSummary = calculateFundSummary(currentMonthTransactions);
    const monthCosts = currentMonthTransactions.filter(tx => tx.type === 'cost')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    setCurrentMonthSummary({
      ...currentMonthSummary,
      totalSpent: monthCosts,
      month: now.toLocaleString('default', { month: 'short' }),
      year: now.getFullYear(),
    });
  }, [transactions, getTransactionsByDateRange, globalBalance, getTotalCostsByCategory]);

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

  const MonthlyCard = ({ month, year, totalFunds, totalSpent, remaining, percentageSpent }: MonthlySummary) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{month} {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Funds</p>
            <p className="font-semibold">{formatCurrency(totalFunds)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="font-semibold text-red-500">-{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`font-semibold ${
              remaining >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Spending Progress</span>
            <span>{Math.round(percentageSpent)}%</span>
          </div>
          <Progress value={percentageSpent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Funds Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Global Balance"
          value={formatCurrency(globalBalance)}
          description="Current available balance"
          icon={DollarSign}
          trend={globalBalance > 0 ? "up" : "down"}
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSummary.totalSpent)}
          description="All-time spending"
          icon={TrendingDown}
          trend="down"
        />
        <StatCard
          title="Remaining"
          value={formatCurrency(totalSummary.remaining)}
          description="Available balance"
          icon={TrendingUp}
          trend={totalSummary.remaining >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Spent This Month"
          value={currentMonthSummary ? formatCurrency(currentMonthSummary.totalSpent) : formatCurrency(0)}
          description={`${currentMonthSummary?.month || ''} ${currentMonthSummary?.year || ''}`}
          icon={Calendar}
          trend="down"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Cost Categories</h3>
          {Object.entries(costsByCategory).length > 0 ? (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(costsByCategory).map(([category, amount]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                      <Progress 
                        value={totalSummary.totalSpent ? (amount / totalSummary.totalSpent) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-muted-foreground">No cost data available</p>
          )}

          <h3 className="text-lg font-semibold mb-4 mt-6">Current Month</h3>
          {currentMonthSummary ? (
            <MonthlyCard {...currentMonthSummary} />
          ) : (
            <p className="text-muted-foreground">No data for current month</p>
          )}
        </div>
      </div>
    </div>
  );
}
