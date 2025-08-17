import { useState, useMemo } from "react";
import { useMathStore } from "@/lib/store";
import HistoryCard from "./history-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PAGE_SIZE = 5;

export default function HistoryList() {
  const { problems, removeProblem } = useMathStore();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sorted = useMemo(() => {
    return [...problems].sort((a, b) => b.date.localeCompare(a.date));
  }, [problems]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-3">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history yet. Add some problems to get started.</p>
        ) : (
          visible.map((p) => (
            <HistoryCard key={p.id} problem={p} onRemove={removeProblem} />
          ))
        )}
      </div>
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Show more
          </Button>
        </div>
      )}
    </Card>
  );
}
