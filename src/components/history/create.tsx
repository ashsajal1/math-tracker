import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCostStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReasonType =
  | "Household"
  | "Transport"
  | "Food"
  | "Entertainment"
  | "Education"
  | "Health"
  | "Other";

export default function CreateWork() {
  const { addCost } = useCostStore();

  const [cost, setCost] = useState<number>(0);
  const [reason, setReason] = useState<ReasonType>("Household");
  const [note, setNote] = useState<string>("");

  // Default date to today
  const defaultDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const [date, setDate] = useState<string>(defaultDate);

  const canSubmit = Boolean(cost > 0 && reason);

  const handleCreate = () => {
    if (!canSubmit) return;

    // Create the cost data object
    const costData = {
      cost,
      reason,
      note: note || undefined, // Only include note if it's not empty
      fund: undefined, // Optional fund field
    };

    // Add the cost data
    addCost(costData);

    // Reset form
    setCost(0);
    setReason("Household");
    setNote("");
    setDate(defaultDate);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-4">
        <section className="flex items-center gap-2">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Amount (৳)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
          <Label>Reason</Label>
          <Select
            value={reason}
            onValueChange={(value: ReasonType) => setReason(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Household">Household</SelectItem>
              <SelectItem value="Transport">Transport</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        </section>

        
        <div className="md:col-span-2 space-y-2">
          <Label>Additional Note (Optional)</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleCreate} disabled={!canSubmit}>
          Add Cost Entry
        </Button>
      </div>
    </Card>
  );
}
