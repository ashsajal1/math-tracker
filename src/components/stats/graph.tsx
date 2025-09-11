import { useMemo, useState } from "react";
import {
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useMathStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { topicStore } from '../../lib/store/topicStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { capitalize } from "@/lib/utils";

type FilterType = "week" | "month" | "all";

export default function PointsGraph() {
  const { problems } = useMathStore();
  const [filter, setFilter] = useState<FilterType>("week");

  const { topics } = topicStore();
  const subjects = useMemo(() => {
    const set = new Set(topics.map((t) => t.subject.toLowerCase()));
    return ["All", ...Array.from(set)];
  }, [topics]);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const filteredProblems = useMemo(() => {
    let subjectFiltered = problems;
    if (selectedSubject !== "All") {
      subjectFiltered = problems.filter(
        (p) => p.type.subject.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    const now = new Date();
    if (filter === "week") {
      const start = startOfWeek(now);
      const end = endOfWeek(now);
      return subjectFiltered.filter((p) => {
        const d = new Date(p.date);
        return d >= start && d <= end;
      });
    }
    if (filter === "month") {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return subjectFiltered.filter((p) => {
        const d = new Date(p.date);
        return d >= start && d <= end;
      });
    }
    return subjectFiltered;
  }, [problems, filter, selectedSubject]);

  const data = useMemo(() => {
    const grouped = filteredProblems.reduce((acc, problem) => {
      const date = format(new Date(problem.date), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += problem.points;
      return acc;
    }, {} as Record<string, number>);

    const now = new Date();
    let interval;
    if (filter === "week") {
      interval = { start: startOfWeek(now), end: endOfWeek(now) };
    } else if (filter === "month") {
      interval = { start: startOfMonth(now), end: endOfMonth(now) };
    }

    if (interval) {
      const allDays = eachDayOfInterval(interval);
      return allDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return {
          date: dateStr,
          points: grouped[dateStr] || 0,
        };
      });
    }

    return Object.entries(grouped)
      .map(([date, points]) => ({ date, points }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredProblems, filter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Points Over Time
            </h2>
            <p className="text-sm text-muted-foreground">
              Visualize your progress and consistency.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>
                    {capitalize(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 bg-muted/50 p-1 rounded-lg">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter("week")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === "week"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                Week
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter("month")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === "month"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                Month
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                All
              </motion.button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[150px] sm:h-[250px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {data.length > 0 ? (
              <LineChart
                data={data}
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
                  dataKey="date"
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  tickLine={false}
                  axisLine={false}
                  padding={{ left: 10, right: 10 }}
                  className="text-xs"
                  tickFormatter={(str) => format(new Date(str), "MMM d")}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  tickFormatter={(value) => `${value} XP`}
                  width={70}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground">
                            {format(new Date(label), "eeee, MMM d")}
                          </p>
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
                  dataKey="points"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
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
                <Area
                  type="monotone"
                  dataKey="points"
                  fillOpacity={1}
                  fill="url(#lineGradient)"
                />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  No data to display for the selected period.
                </p>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
