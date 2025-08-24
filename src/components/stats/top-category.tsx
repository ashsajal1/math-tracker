import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";
import useFundStore from "@/lib/store/fundStore";

export default function TopCategoryCard() {
  const { transactions } = useFundStore();

  const top3AndTotal = useMemo(() => {
    // Get only cost transactions
    const costTransactions = transactions.filter(tx => tx.type === 'cost');
    const totalCost = costTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Aggregate amounts by category
    const map = new Map<string, { category: string; amount: number }>();
    for (const tx of costTransactions) {
      const key = tx.category || 'Other';
      const entry = map.get(key) ?? { category: key, amount: 0 };
      entry.amount += tx.amount;
      map.set(key, entry);
    }
    
    // Sort by amount desc and take top 3
    const top3 = Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return { top3, totalCost };
  }, [transactions]);

  return (
    <Card className="p-3 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Top Spending Categories</h3>
        <Award className="h-5 w-5 text-primary" />
      </div>
      {top3AndTotal.top3.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {top3AndTotal.top3.map((item) => (
            <div key={item.category} className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="capitalize flex items-center gap-2">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  {item.category}
                </span>
                <span className="font-medium">৳{item.amount.toFixed(2)}</span>
              </div>
              <Progress 
                value={Math.min(100, Math.round((item.amount / Math.max(1, top3AndTotal.totalCost)) * 100))} 
                className="h-1" 
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No data available. Start adding expenses to see your spending by category.
        </p>
      )}
    </Card>
  );
}
