import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMathStore } from "@/lib/store";

export default function CreateWork() {
  const { addProblem } = useMathStore();
  
  const [cost, setCost] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState<string>("");
  
  // Default date to today
  const defaultDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);
  
  const [date, setDate] = useState<string>(defaultDate);

  const canSubmit = Boolean(cost > 0 && reason);

  const handleCreate = () => {
    if (!canSubmit) return;
    
    // Use current time for the timestamp
    const now = new Date();
    const [year, month, day] = date.split("-").map(Number);
    
    const dt = new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );
    
    // Create a custom data object to store the additional fields
    const customData = {
      cost,
      reason,
      note: note || undefined, // Only include note if it's not empty
    };
    
    // Add the problem with the custom data
    // Using empty strings for subject and topic to maintain compatibility
    addProblem({ subject: "", topic: "" }, 0, dt.toISOString(), customData);
    
    // Reset form
    setCost(0);
    setReason("");
    setNote("");
    setDate(defaultDate);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-4">

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
          <Label>Reason for Cost</Label>
          <Input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why was there a cost?"
          />
        </div>

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