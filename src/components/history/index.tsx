import { useState, useMemo } from "react";
import { useCostStore } from "@/lib/store";
import useFundStore from "@/lib/store/fundStore";
import HistoryCard from "./history-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PAGE_SIZE = 5;

export default function HistoryList() {
  const { costData, removeCost } = useCostStore();
  const { deposit } = useFundStore();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sorted = useMemo(() => {
    return [...costData].sort((a, b) => b.date.localeCompare(a.date));
  }, [costData]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this entry?')) {
      const costToRemove = costData.find(c => c.id === id);
      if (costToRemove?.fundId) {
        // Refund the amount to the fund
        deposit(costToRemove.cost, 
          `Refund for deleted cost: ${costToRemove.reason}`, 
          costToRemove.fundId);
      }
      removeCost(id);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-3">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history yet. Add some problems to get started.</p>
        ) : (
          visible.map((p) => (
            <HistoryCard key={p.id} problem={p} onRemove={handleRemove} />
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
