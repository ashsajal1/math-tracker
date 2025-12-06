import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TimeChartProps {
  data: {
    name: string;
    value: number; // time in seconds
    formattedTime: string;
  }[];
}

export default function TimeChart({ data }: TimeChartProps) {
  // Colors for the bars
  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

  const formatYAxis = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-neutral-800/50 rounded-xl border border-dashed border-slate-200 dark:border-neutral-700 text-slate-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="h-80 w-full bg-white dark:bg-neutral-800 p-4 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-neutral-700">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {data.name}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400">
                      {data.formattedTime}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
