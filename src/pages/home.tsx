import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Switch } from "@/components/ui/switch";

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
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Quantity Trend
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${viewMode === 'weekly' ? 'text-blue-600' : 'text-gray-500'}`}>
              Weekly
            </span>
            <Switch
              id="view-mode"
              checked={viewMode === 'monthly'}
              onCheckedChange={(checked) => setViewMode(checked ? 'monthly' : 'weekly')}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={`text-sm font-medium ${viewMode === 'monthly' ? 'text-blue-600' : 'text-gray-500'}`}>
              Monthly
            </span>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [`${value} units`, 'Quantity']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="quantity" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={{ r: 4, stroke: '#4f46e5', strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 6, stroke: '#4338ca', strokeWidth: 2, fill: 'white' }}
              />
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
