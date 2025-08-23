import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { CostData } from "@/lib/store/costStore";

type HistoryCardProps = {
  problem: CostData;
  onRemove?: (id: string) => void;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function HistoryCard({ problem, onRemove }: HistoryCardProps) {
  return (
    <Card className="p-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {problem.reason}
            </Badge>
            {problem.note && (
              <span className="text-sm font-medium text-foreground">
                {problem.note}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDateTime(problem.date)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="text-xs px-2 py-1">${problem.cost.toFixed(2)}</Badge>
        {onRemove && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onRemove(problem.id)}
            aria-label="Remove problem"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </Card>
  );
}
