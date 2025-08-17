import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";
import { useMathStore } from "@/lib/store";

export default function TopCategoryCard() {
  const { problems, getTotalPoints } = useMathStore();

  const top = useMemo(() => {
    // Aggregate points by subject:topic key
    const map = new Map<string, { subject: string; topic: string; points: number }>();
    for (const p of problems) {
      const key = `${p.type.subject}:${p.type.topic}`;
      const entry = map.get(key) ?? { subject: p.type.subject, topic: p.type.topic, points: 0 };
      entry.points += p.points;
      map.set(key, entry);
    }
    // Find max
    let best: { subject: string; topic: string; points: number } | null = null;
    for (const v of map.values()) {
      if (!best || v.points > best.points) best = v;
    }
    return best;
  }, [problems]);

  const totalPoints = getTotalPoints();
  const value = top ? Math.min(100, Math.round((top.points / Math.max(1, totalPoints)) * 100)) : 0;

  return (
    <Card className="p-3 sm:p-6">
      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Top Category</p>
      {top ? (
        <div className="space-y-2 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="capitalize flex items-center gap-2">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                {top.topic}
              </span>
              <span className="font-medium">{top.points}</span>
            </div>
            <Progress value={value} className="h-1" />
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No data yet</div>
      )}
    </Card>
  );
}
