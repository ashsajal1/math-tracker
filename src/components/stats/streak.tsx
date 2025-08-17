import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { useMathStore } from "@/lib/store";

type StreakCardProps = {
  goalDays?: number; // for progress bar, default 30
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Local YYYY-MM-DD string (not UTC) so streaks align with user's local day
const toLocalDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function StreakCard({ goalDays = 30 }: StreakCardProps) {
  const { problems } = useMathStore();

  const { streak, percentage } = useMemo(() => {
    // Build a set of unique local-date keys (YYYY-MM-DD) from problems
    const days = new Set<string>(
      problems.map((p) => toLocalDateKey(new Date(p.date)))
    );

    // Count consecutive days ending today (local)
    let count = 0;
    const cursor = startOfDay(new Date());

    while (days.has(toLocalDateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const pct = Math.min(100, Math.round((count / goalDays) * 100));
    return { streak: count, percentage: pct };
  }, [problems, goalDays]);

  return (
    <Card className="p-3 sm:p-6 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          Streak
        </p>
        <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
      </div>
      <h3 className="text-lg sm:text-2xl font-bold">{streak} days</h3>
      <Progress value={percentage} className="h-1" />
    </Card>
  );
}
