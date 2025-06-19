import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMathStore, MathProblemType } from "@/lib/store";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Award, Brain, Target } from "lucide-react";

// Format date for display
const formatDate = (date: Date) => date.toLocaleDateString();
const formatDay = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });

// Get last N days data
const getLastNDaysData = (days: number) => {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - 1 - i));
    return date;
  });
};

// Calculate progress percentage
const calculateProgress = (current: number, target = 100) => {
  return Math.min((current / target) * 100, 100);
};

export default function Home() {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const { 
    problems, 
    addProblem, 
    removeLastProblem,
    getPointsByType, 
    getTotalPoints 
  } = useMathStore();
  
  // Get problem types
  const problemTypes: MathProblemType[] = ['integration', 'differentiation', 'trigonometric', 'mechanics', 'physics'];
  
  // Generate chart data based on view mode
  const chartData = useMemo(() => {
    const days = viewMode === 'weekly' ? 7 : 30;
    const dates = getLastNDaysData(days);
    
    return dates.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayProblems = problems.filter(p => p.date.startsWith(dateStr));
      const totalPoints = dayProblems.reduce((sum, p) => sum + p.points, 0);
      
      return {
        date,
        name: viewMode === 'weekly' ? formatDay(date) : date.getDate().toString(),
        time: viewMode === 'weekly' ? formatDay(date) : formatDate(date),
        quantity: totalPoints,
      };
    });
  }, [problems, viewMode]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const latest = chartData[chartData.length - 1].quantity;
    const previous = chartData[chartData.length - 2].quantity;
    return ((latest - previous) / (previous || 1)) * 100;
  }, [chartData]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Points</p>
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg sm:text-2xl font-bold">{getTotalPoints()}</h3>
            <div className={`flex items-center text-xs sm:text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />}
              <span className="ml-1">{Math.abs(trend).toFixed(1)}%</span>
            </div>
          </div>
          <Progress value={calculateProgress(getTotalPoints())} className="h-1" />
        </Card>

        <Card className="p-3 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Problems Today</p>
            <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold">
            {problems.filter(p => p.date.startsWith(new Date().toISOString().split('T')[0])).length}
          </h3>
          <Progress 
            value={calculateProgress(
              problems.filter(p => p.date.startsWith(new Date().toISOString().split('T')[0])).length,
              10
            )} 
            className="h-1" 
          />
        </Card>

        <Card className="p-3 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Streak</p>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold">7 days</h3>
          <Progress value={70} className="h-1" />
        </Card>

        <Card className="p-3 sm:p-6">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Top Category</p>
          <div className="space-y-2 sm:space-y-4">
            {problemTypes.slice(0, 2).map((type) => (
              <div key={type} className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="capitalize">{type}</span>
                  <span className="font-medium">{getPointsByType(type)}</span>
                </div>
                <Progress value={calculateProgress(getPointsByType(type), getTotalPoints())} className="h-1" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Graph Section */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Progress
            </h2>
            <p className="text-sm text-muted-foreground">
              Track your learning journey over time
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-muted/50 p-1 rounded-lg">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'weekly' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground/80'
              }`}
            >
              Week
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground/80'
              }`}
            >
              Month
            </motion.button>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="3 3" 
                className="stroke-muted"
              />
              <XAxis 
                dataKey="name"
                tick={{ 
                  fontSize: 12,
                  fill: 'hsl(var(--muted-foreground))',
                }}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                className="text-xs"
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ 
                  fontSize: 12,
                  fill: 'hsl(var(--muted-foreground))',
                }}
                tickFormatter={(value) => `${value}`}
                width={30}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          Points: <span className="text-foreground font-medium">{payload[0].value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="quantity" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#lineGradient)"
                dot={{
                  r: 4,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  fill: 'hsl(var(--primary))',
                  className: 'shadow-sm'
                }}
                activeDot={{
                  r: 6,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  fill: 'hsl(var(--primary))',
                  className: 'shadow-md'
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Problem Type Buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add Problems</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {problemTypes.map((type) => (
              <motion.div key={type} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => addProblem(type)}
                  className="w-full capitalize group relative overflow-hidden"
                  variant="outline"
                >
                  <span className="relative z-10">{type}</span>
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-primary/10 text-primary absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {getPointsByType(type)}
                  </Badge>
                  <div 
                    className="absolute inset-0 bg-primary/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                    style={{
                      transform: `scaleX(${calculateProgress(getPointsByType(type), getTotalPoints()) / 100})`,
                    }}
                  />
                </Button>
              </motion.div>
            ))}
            <motion.div whileTap={{ scale: 0.97 }} className="col-span-2 md:col-span-1">
              <Button
                onClick={removeLastProblem}
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={problems.length === 0}
              >
                Remove Last
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
