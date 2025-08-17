import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMathStore, getAllProblemTypes, MathProblemType } from "@/lib/store";

export default function CreateWork() {
  const { addProblem } = useMathStore();
  const allTypes = getAllProblemTypes();

  const subjects = useMemo(() => {
    const set = new Set(allTypes.map((t) => t.subject));
    return Array.from(set);
  }, [allTypes]);

  const [subject, setSubject] = useState<string>("Mathematics");
  const topicsForSubject = useMemo(
    () => allTypes.filter((t) => t.subject === subject).map((t) => t.topic),
    [allTypes, subject]
  );
  const [topic, setTopic] = useState<string>("");
  const [points, setPoints] = useState<number>(5);

  useEffect(() => {
    // Set default topic when subject changes
    setTopic((prev) => (topicsForSubject.includes(prev) ? prev : topicsForSubject[0] || ""));
  }, [subject, topicsForSubject]);

  const canSubmit = subject && topic && points > 0;

  const handleCreate = () => {
    if (!canSubmit) return;
    const type: MathProblemType = { subject, topic };
    addProblem(type, points);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Topic</Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {topicsForSubject.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Points</Label>
          <Input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value || 0))}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleCreate} disabled={!canSubmit}>
          Add Work
        </Button>
      </div>
    </Card>
  );
}
