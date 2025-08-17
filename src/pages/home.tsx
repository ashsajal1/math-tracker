import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMathStore, MathProblemType, getAllProblemTypes } from "@/lib/store";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, ArrowDown, Award, Brain, Target } from "lucide-react";
import HistoryList from "@/components/history";
import CreateWork from "@/components/history/create";
import StatsSection from "@/components/stats";

// Format date for display
const formatDate = (date: Date) => date.toLocaleDateString();
const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

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
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const { problems, getPointsByType, getTotalPoints } = useMathStore();

  // Get problem types
  const problemTypes: MathProblemType[] = getAllProblemTypes();

  // Generate chart data based on view mode
  const chartData = useMemo(() => {
    const days = viewMode === "weekly" ? 7 : 30;
    const dates = getLastNDaysData(days);

    return dates.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const dayProblems = problems.filter((p) => p.date.startsWith(dateStr));
      const totalPoints = dayProblems.reduce((sum, p) => sum + p.points, 0);

      return {
        date,
        name:
          viewMode === "weekly" ? formatDay(date) : date.getDate().toString(),
        time: viewMode === "weekly" ? formatDay(date) : formatDate(date),
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
      <StatsSection />

      {/* Graph Section */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {viewMode === "weekly" ? "Weekly" : "Monthly"} Progress
            </h2>
            <p className="text-sm text-muted-foreground">
              Track your learning journey over time
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-muted/50 p-1 rounded-lg">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === "weekly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              Week
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("monthly")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/80"
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
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
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
                  fill: "hsl(var(--muted-foreground))",
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
                  fill: "hsl(var(--muted-foreground))",
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
                          Points:{" "}
                          <span className="text-foreground font-medium">
                            {payload[0].value}
                          </span>
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
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                  fill: "hsl(var(--primary))",
                  className: "shadow-sm",
                }}
                activeDot={{
                  r: 6,
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                  fill: "hsl(var(--primary))",
                  className: "shadow-md",
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <CreateWork />
      <HistoryList />
    </motion.div>
  );
}
