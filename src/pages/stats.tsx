import { useState, useMemo } from 'react';
import { useCostStore } from '@/lib/store/costStore';
import { format, subDays, isSameDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { DollarSign, PieChart, BarChart3, TrendingUp, Filter } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const timeRanges = [
  { value: '7', label: 'Last 7 Days' },
  { value: '14', label: 'Last 14 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 3 Months' },
  { value: 'all', label: 'All Time' },
];

export default function Stats() {
  const [timeRange, setTimeRange] = useState('30');
  const { costData } = useCostStore();

  // Filter costs based on selected time range
  const filteredCosts = useMemo(() => {
    if (!costData.length) return [];
    
    if (timeRange === 'all') return costData;
    
    const days = parseInt(timeRange, 10);
    const cutoffDate = subDays(new Date(), days);
    
    return costData.filter(cost => new Date(cost.date) >= cutoffDate);
  }, [costData, timeRange]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return filteredCosts.reduce((sum, cost) => sum + cost.cost, 0);
  }, [filteredCosts]);

  // Group by category for pie chart
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    filteredCosts.forEach(cost => {
      const current = categoryMap.get(cost.reason) || 0;
      categoryMap.set(cost.reason, current + cost.cost);
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      percentage: parseFloat(((value / totalExpenses) * 100).toFixed(1))
    }));
  }, [filteredCosts, totalExpenses]);

  // Prepare data for weekly spending chart
  const weeklyData = useMemo(() => {
    if (!filteredCosts.length) return [];
    
    const result = [];
    const days = parseInt(timeRange, 10) || 30;
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'MMM dd');
      const dayCosts = filteredCosts.filter(cost => 
        isSameDay(new Date(cost.date), date)
      );
      
      const total = dayCosts.reduce((sum, cost) => sum + cost.cost, 0);
      
      result.push({
        date: dateStr,
        total: parseFloat(total.toFixed(2))
      });
    }
    
    return result;
  }, [filteredCosts, timeRange]);

  // Get top expenses
  const topExpenses = useMemo(() => {
    return [...filteredCosts]
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)
      .map(expense => ({
        ...expense,
        date: format(new Date(expense.date), 'MMM dd, yyyy')
      }));
  }, [filteredCosts]);

  // Calculate spending by day of week
  const dayOfWeekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = days.map(day => ({
      name: day,
      total: 0,
      count: 0
    }));
    
    filteredCosts.forEach(cost => {
      const day = new Date(cost.date).getDay();
      result[day].total += cost.cost;
      result[day].count++;
    });
    
    return result.map(day => ({
      ...day,
      average: day.count > 0 ? parseFloat((day.total / day.count).toFixed(2)) : 0,
      total: parseFloat(day.total.toFixed(2))
    }));
  }, [filteredCosts]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Analytics</h1>
          <p className="text-muted-foreground">Track and analyze your spending patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-background border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {timeRanges.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredCosts.length} {filteredCosts.length === 1 ? 'expense' : 'expenses'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
            <p className="text-xs text-muted-foreground">
              {categoryData.length === 1 ? 'Category' : 'Categories'} tracked
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalExpenses / (parseInt(timeRange) || 30)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per day
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoryData[0]?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {categoryData[0]?.percentage || 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Spending Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Over Time</CardTitle>
            <CardDescription>Daily expenses for the selected period</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Total']}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Breakdown of expenses by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, _name, props) => [`$${value}`, props.payload.name]}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Spending by Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Day of Week</CardTitle>
            <CardDescription>Average spending per day</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                />
                <Bar dataKey="average" fill="#10B981" name="Average per day" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Expenses</CardTitle>
            <CardDescription>Your highest individual expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {topExpenses.length > 0 ? (
              <div className="space-y-4">
                {topExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{expense.reason}</p>
                      <p className="text-sm text-muted-foreground">{expense.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${expense.cost.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.note || 'No note'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No expenses to display. Add some expenses to see them here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
