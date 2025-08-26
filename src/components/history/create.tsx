import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useFundStore from "@/lib/store/fundStore";
import { AlertCircle } from "lucide-react";
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
  const { funds, activeFundId, addCost } = useFundStore();

  const [cost, setCost] = useState<number>(0);
  const [reason, setReason] = useState<ReasonType>("Household");
  const [note, setNote] = useState<string>("");
  const [selectedFundId, setSelectedFundId] = useState<string | undefined>(activeFundId ?? undefined);

  // Default date to today
  const defaultDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const [date, setDate] = useState<string>(defaultDate);

  const canSubmit = Boolean(cost > 0 && reason && (selectedFundId || selectedFundId === 'debt'));

  const handleCreate = () => {
    if (!canSubmit) return;

    if (selectedFundId === 'debt') {
      // Use the addCost function with a special debt fund ID
      addCost(cost, reason, note || `Debt expense: ${reason}`, 'debt');
    } else if (selectedFundId) {
      // For regular funds, use the existing addCost function
      addCost(cost, reason, note || undefined, selectedFundId);
    }

    // Reset form
    setCost(0);
    setReason("Household");
    setNote("");
    setDate(defaultDate);
    setSelectedFundId(undefined);
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

        
        <div className="space-y-2">
          <Label>Select Fund <span className="text-red-500">*</span></Label>
          <Select
            value={selectedFundId}
            onValueChange={setSelectedFundId}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a fund" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debt" className="font-semibold text-amber-600">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Debt Fund (Add to Debt)</span>
                </div>
              </SelectItem>
              {Object.values(funds).map((fund) => (
                <SelectItem key={fund.id} value={fund.id}>
                  {fund.name} (৳{fund.balance})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {selectedFundId === 'debt' ? (
              <span className="text-amber-500 font-medium">
                This will add {cost}৳ to your debt balance.
              </span>
            ) : selectedFundId && funds[selectedFundId]?.balance < cost ? (
              <span className="text-amber-500">
                Insufficient funds. {cost - funds[selectedFundId].balance}৳ will be added to debt.
              </span>
            ) : null}
          </p>
        </div>

        <div className="space-y-2">
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
