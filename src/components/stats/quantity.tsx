import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Award } from "lucide-react";
import useFundStore from "@/lib/store/fundStore";

type QuantityCardProps = {
  problemsGoal?: number; // kept for API compatibility, but dynamic goal is used
  pointsGoal?: number;   // kept for API compatibility, but dynamic goal is used
};

export default function QuantityCard({ problemsGoal = 5, pointsGoal = 100 }: QuantityCardProps) {
  const { transactions } = useFundStore();

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { countToday, pointsToday } = useMemo(() => {
    const todaysCosts = transactions
      .filter(tx => tx.type === 'cost' && tx.date.startsWith(today));
    const count = todaysCosts.length;
    const pts = todaysCosts.reduce((sum, tx) => sum + tx.amount, 0);
    return { countToday: count, pointsToday: pts };
  }, [transactions, today]);

  // Dynamic goals:
  // - Problems: segment of 10 that advances at the exact peak. Example:
  //   0–9 => 10, 10 => 20, 11–19 => 20, 20 => 30, etc. (min 10), using provided problemsGoal as a minimum
  // - Points: align with problems goal at 5 points per problem, using provided pointsGoal as a minimum
  const nextSegment = (() => {
    if (countToday > 0 && countToday % 10 === 0) {
      return countToday + 10; // advance when hitting exact peak
    }
    return Math.ceil(Math.max(countToday, 1) / 10) * 10; // otherwise normal ceiling
  })();
  const dynamicProblemsGoal = Math.max(problemsGoal, 10, nextSegment);
  const dynamicPointsGoal = Math.max(pointsGoal, dynamicProblemsGoal * 5);

  const problemsProgress = Math.min(100, Math.round((countToday / dynamicProblemsGoal) * 100));
  const pointsProgress = Math.min(100, Math.round((pointsToday / dynamicPointsGoal) * 100));

  return (
    <Card className="p-3 sm:p-6 space-y-4">
      {/* Problems Today */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Expenses Today</p>
          <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{countToday}</div>
          <p className="text-sm text-muted-foreground">
            {countToday === 1 ? "expense" : "expenses"} today
          </p>
        </div>
        <Progress value={problemsProgress} className="h-1" />
      </div>

      {/* Points Today */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Points Today</p>
          <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">${pointsToday.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">
            spent today
          </p>
        </div>
        <Progress value={pointsProgress} className="h-1" />
      </div>
    </Card>
  );
}
