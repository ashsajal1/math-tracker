import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Format date for display
const formatDate = (date: Date) => {
  return date.toLocaleTimeString();
};

export default function Home() {
  const [total, setTotal] = useState([{ date: new Date(), quantity: 0 }]);
  
  // Prepare data for the chart
  const chartData = total.map((item, index) => ({
    name: `#${index + 1}`,
    time: formatDate(item.date),
    quantity: item.quantity,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Graph Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quantity Over Time</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time"
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'Quantity']}
                labelFormatter={(label) => `Update: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="quantity" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
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
