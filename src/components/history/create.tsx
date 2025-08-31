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
import { useMathStore, MathProblemType } from "@/lib/store";
import { topicStore } from "../../lib/store/topicStore";
import CreateTopicDialog from "../create-topic-dialog";

export default function CreateWork() {
  const { addProblem } = useMathStore();

  const { getTopics } = topicStore();

  const topics = getTopics();
  const subjects = Array.from(new Set(topics.map((t) => t.subject)));

  const [subject, setSubject] = useState<string>(subjects[0]);
  const topicsForSubject = useMemo(
    () => topics.filter((t) => t.subject === subject).map((t) => t.topic),
    [topics, subject]
  );
  const [topic, setTopic] = useState<string>(topicsForSubject[0]);
  // Default points fixed at 5; remove points UI
  const defaultDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);
  const [date, setDate] = useState<string>(defaultDate);

  useEffect(() => {
    // Set default topic when subject changes
    setTopic((prev) =>
      topicsForSubject.includes(prev) ? prev : topicsForSubject[0] || ""
    );
  }, [subject, topicsForSubject]);

  const canSubmit = Boolean(subject && topic && date);

  const handleCreate = () => {
    if (!canSubmit) return;
    const type: MathProblemType = { subject, topic };
    // Compose ISO with selected date and current time
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
    addProblem(type, 5, dt.toISOString());
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
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
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <CreateTopicDialog />
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleCreate}
          disabled={!canSubmit}
        >
          Add Work
        </Button>
      </div>
    </Card>
  );
}
