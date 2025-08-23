import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Download, BarChart3, PieChart, LineChart, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { useCostStore } from '@/lib/store/costStore';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

type TimeRange = '7d' | '30d' | '90d' | 'month' | 'year' | 'custom';

export default function Reports() {
  const { costData } = useCostStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Get all unique categories
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    costData.forEach(item => categorySet.add(item.reason));
    return Array.from(categorySet);
  }, [costData]);

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!dateRange?.from) return [];
    
    const from = dateRange.from;
    const to = dateRange.to || dateRange.from;
    
    return costData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= from && itemDate <= to;
    });
  }, [costData, dateRange]);

  // Generate data for charts
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    filteredData.forEach(item => {
      const current = categoryMap.get(item.reason) || 0;
      categoryMap.set(item.reason, current + item.cost);
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  }, [filteredData]);

  // Generate time series data
  const timeSeriesData = useMemo(() => {
    if (!dateRange?.from) return [];
    
    const from = dateRange.from;
    const to = dateRange.to || dateRange.from;
    const days = eachDayOfInterval({ start: from, end: to });
    
    return days.map(day => {
      const dayData = filteredData.filter(item => 
        isSameDay(new Date(item.date), day)
      );
      
      const dayTotal = dayData.reduce((sum, item) => sum + item.cost, 0);
      
      return {
        date: format(day, 'MMM dd'),
        total: parseFloat(dayTotal.toFixed(2)),
        ...dayData.reduce((acc, item) => ({
          ...acc,
          [item.reason]: (acc[item.reason] || 0) + item.cost
        }), {} as Record<string, number>)
      };
    });
  }, [filteredData, dateRange]);

  // Handle time range change
  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value);
    const today = new Date();
    
    switch (value) {
      case '7d':
        setDateRange({
          from: subDays(today, 6),
          to: today
        });
        break;
      case '30d':
        setDateRange({
          from: subDays(today, 29),
          to: today
        });
        break;
      case '90d':
        setDateRange({
          from: subDays(today, 89),
          to: today
        });
        break;
      case 'month':
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today)
        });
        break;
      case 'year':
        setDateRange({
          from: new Date(today.getFullYear(), 0, 1),
          to: today
        });
        break;
      case 'custom':
        // Custom range will be handled by the date picker
        break;
    }
  };

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.cost, 0);
  }, [filteredData]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Export data as CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Amount', 'Note'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        format(new Date(item.date), 'yyyy-MM-dd'),
        `"${item.reason}"`,
        item.cost,
        `"${item.note || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expense Reports</h1>
          <p className="text-muted-foreground">Analyze and export your expense data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Customize your report view</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Expenses</CardDescription>
              <CardTitle className="text-3xl">
                ${totalExpenses.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {dateRange?.from && (
                  <>
                    {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                    {format(dateRange.to || dateRange.from, 'MMM dd, yyyy')}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Transactions</CardDescription>
              <CardTitle className="text-3xl">
                {filteredData.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {categories.length} categories
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Daily Spend</CardDescription>
              <CardTitle className="text-3xl">
                ${(totalExpenses / (filteredData.length || 1)).toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Based on {timeSeriesData.length} days
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="categories">
                <PieChart className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="trends">
                <LineChart className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Overview</CardTitle>
                <CardDescription>
                  Daily expense breakdown for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={timeSeriesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Expense by Category</CardTitle>
                  <CardDescription>
                    Distribution of expenses across different categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Click to filter by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categoryData.map((category) => (
                        <div 
                          key={category.name}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedCategories.includes(category.name) 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleCategory(category.name)}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ 
                                backgroundColor: COLORS[categories.indexOf(category.name) % COLORS.length] 
                              }} 
                            />
                            <span>{category.name}</span>
                          </div>
                          <span>${category.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Trends</CardTitle>
                <CardDescription>
                  Track your spending patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={timeSeriesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total Expenses"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    {selectedCategories.map((category, index) => (
                      <Line
                        key={category}
                        type="monotone"
                        dataKey={category}
                        name={category}
                        stroke={COLORS[(index + 1) % COLORS.length]}
                      />
                    ))}
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
