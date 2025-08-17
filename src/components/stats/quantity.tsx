import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Award } from "lucide-react";
import { useMathStore } from "@/lib/store";

type QuantityCardProps = {
  problemsGoal?: number; // kept for API compatibility, but dynamic goal is used
  pointsGoal?: number;   // kept for API compatibility, but dynamic goal is used
};

export default function QuantityCard({ problemsGoal = 10, pointsGoal = 50 }: QuantityCardProps) {
  const { problems } = useMathStore();

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { countToday, pointsToday } = useMemo(() => {
    const todays = problems.filter((p) => p.date.startsWith(today));
    const count = todays.length;
    const pts = todays.reduce((sum, p) => sum + p.points, 0);
    return { countToday: count, pointsToday: pts };
  }, [problems, today]);

  // Dynamic goals:
  // - Problems: next multiple of 10 (min 10), using provided problemsGoal as a minimum
  // - Points: align with problems goal at 5 points per problem, using provided pointsGoal as a minimum
  const dynamicProblemsGoal = Math.max(
    problemsGoal,
    10,
    Math.ceil(Math.max(countToday, 1) / 10) * 10
  );
  const dynamicPointsGoal = Math.max(pointsGoal, dynamicProblemsGoal * 5);

  const problemsProgress = Math.min(100, Math.round((countToday / dynamicProblemsGoal) * 100));
  const pointsProgress = Math.min(100, Math.round((pointsToday / dynamicPointsGoal) * 100));

  return (
    <Card className="p-3 sm:p-6 space-y-4">
      {/* Problems Today */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Problems Today</p>
          <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg sm:text-2xl font-bold">{countToday}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Goal: {dynamicProblemsGoal}</p>
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
          <h3 className="text-lg sm:text-2xl font-bold">{pointsToday}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Goal: {dynamicPointsGoal}</p>
        </div>
        <Progress value={pointsProgress} className="h-1" />
      </div>
    </Card>
  );
}
