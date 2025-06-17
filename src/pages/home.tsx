import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Format date for display
const formatDate = (date: Date) => date.toLocaleDateString();
const formatDay = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });

// Generate mock data for demo
const generateMockData = (days: number) => {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - 1 - i));
    return {
      date,
      quantity: Math.floor(Math.random() * 100)
    };
  });
};

export default function Home() {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [total, setTotal] = useState([{ date: new Date(), quantity: 0 }]);
  
  // Generate chart data based on view mode
  const chartData = useMemo(() => {
    const data = viewMode === 'weekly' ? 
      generateMockData(7).concat(total) : 
      generateMockData(30).concat(total);
      
    return data.map((item) => ({
      date: item.date,
      name: viewMode === 'weekly' ? formatDay(item.date) : item.date.getDate().toString(),
      time: viewMode === 'weekly' ? formatDay(item.date) : formatDate(item.date),
      quantity: item.quantity,
    }));
  }, [total, viewMode]);

  return (
    <div className="p-6 space-y-6">
      {/* Graph Section */}
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Quantity Trend
            </h2>
            <p className="text-sm text-muted-foreground">
              Track your quantity changes over time
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'weekly' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground/80'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground/80'
              }`}
            >
              Month
            </button>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="3 3" 
                className="stroke-border"
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
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: <span className="text-foreground font-medium">{payload[0].value}</span>
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
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{
                  r: 4,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  fill: 'hsl(var(--primary))',
                  className: 'shadow-md'
                }}
                activeDot={{
                  r: 6,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  fill: 'hsl(var(--primary))',
                  className: 'shadow-lg'
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <animate
                  attributeName="opacity"
                  values="0;1"
                  dur="1s"
                  fill="freeze"
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() =>
            setTotal([
              ...total,
              { date: new Date(), quantity: total[total.length - 1].quantity + 1 },
            ])
          }
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Increase quantity
        </Button>
        <Button
          onClick={() =>
            setTotal([
              ...total,
              { date: new Date(), quantity: Math.max(0, total[total.length - 1].quantity - 1) },
            ])
          }
          variant="outline"
        >
          Decrease quantity
        </Button>
      </div>

      {/* Current Value */}
      <div className="text-lg">
        Current quantity: <span className="font-bold">{total[total.length - 1].quantity}</span>
      </div>
    </div>
  );
}
