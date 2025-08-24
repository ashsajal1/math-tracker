import { useState, useMemo } from "react";
import useFundStore from "@/lib/store/fundStore";
import HistoryCard from "./history-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PAGE_SIZE = 5;

export default function HistoryList() {
  const { transactions, deleteTransaction } = useFundStore();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sorted = useMemo(() => {
    return [...transactions]
      .filter(tx => tx.type === 'cost')
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this entry?')) {
      deleteTransaction(id);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-3">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cost history yet. Add some costs to get started.</p>
        ) : (
          visible.map((transaction) => (
            <HistoryCard key={transaction.id} problem={transaction} onRemove={handleRemove} />
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
