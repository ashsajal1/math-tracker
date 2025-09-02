import { useMemo } from "react";
import { useMathStore, MathProblemType } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

export default function Stats() {
  const { problems, getPointsByType } = useMathStore();
  const problemTypes = useMemo(() => {
    const typeMap = new Map<string, MathProblemType>();
    problems.forEach((p) => {
      const key = `${p.type.subject}:${p.type.topic}`;
      typeMap.set(key, p.type);
    });
    return Array.from(typeMap.values());
  }, [problems]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = problems.length;
    const byType = problemTypes.map((type) => {
      
      return {
        name: `${type.subject}: ${type.topic}`,
        value: problems.filter(p => 
          p.type.subject === type.subject && p.type.topic === type.topic
        ).length,
        points: getPointsByType(type),
      };
    });

    // Get dates with problems
    const dates = [...new Set(problems.map((p) => p.date.split("T")[0]))];

    return {
      total,
      byType,
      avgPerDay: total / Math.max(dates.length, 1),
      mostProductiveDay: dates.reduce(
        (max, date) => {
          const count = problems.filter((p) => p.date.startsWith(date)).length;
          return count > max.count ? { date, count } : max;
        },
        { date: "", count: 0 }
      ),
    };
  }, [problems, problemTypes, getPointsByType]);

  // Colors for the pie chart
  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9E579D",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold">Statistics Overview</h1>
        <p className="text-muted-foreground">
          Detailed analysis of your learning progress
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Problems Solved</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Avg. {stats.avgPerDay.toFixed(1)} problems per day
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Most Active Day</h3>
          <p className="text-3xl font-bold">{stats.mostProductiveDay.count}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Problems on{" "}
            {new Date(stats.mostProductiveDay.date).toLocaleDateString()}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Categories</h3>
          <p className="text-3xl font-bold">{problemTypes.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Active learning categories
          </p>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Problem Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.byType.filter((t) => t.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {stats.byType.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {stats.byType.map((type, index) => (
            <div key={type.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="capitalize text-sm font-medium">
                  {type.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {type.value} problems ({type.points} points)
                </span>
              </div>
              <Progress
                value={(type.value / stats.total) * 100}
                className="h-2"
                style={{
                  backgroundColor: `${COLORS[index % COLORS.length]}20`,
                }}
                color={COLORS[index % COLORS.length]}
              />
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
