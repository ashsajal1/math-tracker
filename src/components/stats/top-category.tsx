import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";
import { useCostStore } from "@/lib/store";

export default function TopCategoryCard() {
  const { costData } = useCostStore();

  const top3 = useMemo(() => {
    // Aggregate points by subject:topic key
    const map = new Map<string, { subject: string; cost: number }>();
    for (const p of costData) {
      const key = `${p.reason}`;
      const entry = map.get(key) ?? { subject: p.reason, cost: 0 };
      entry.cost += p.cost;
      map.set(key, entry);
    }
    // Sort by points desc and take top 3
    return Array.from(map.values())
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 3);
  }, [costData]);

  const totalCost = costData.reduce((sum, p) => sum + p.cost, 0);

  return (
    <Card className="p-3 sm:p-6">
      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Top Categories</p>
      {top3.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {top3.map((item) => {
            const value = Math.min(100, Math.round((item.cost / Math.max(1, totalCost)) * 100));
            return (
              <div key={`${item.subject}`} className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="capitalize flex items-center gap-2">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    {item.subject}
                  </span>
                  <span className="font-medium">{item.cost}</span>
                </div>
                <Progress value={value} className="h-1" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No data yet</div>
      )}
    </Card>
  );
}
