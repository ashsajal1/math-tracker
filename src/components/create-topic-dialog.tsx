import { topicStore } from "@/lib/store/topicStore";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { PlusCircle, BookOpen, BookMarked, AlertCircle } from "lucide-react";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { capitalize } from "@/lib/utils";

export default function CreateTopicDialog() {
  const { addTopic, topics } = topicStore();
  // Get unique subjects from both store and local state
  const storeSubjects = Array.from(new Set(topics.map((t) => t.subject)));
  const [localSubjects, setLocalSubjects] = useState<string[]>([]);
  // Combine store and local subjects, removing duplicates
  const allSubjects = Array.from(new Set([...storeSubjects, ...localSubjects]));

  const [topic, setTopic] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [newSubject, setNewSubject] = useState<string>("");
  const [showNewSubjectInput, setShowNewSubjectInput] =
    useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [points, setPoints] = useState<number>(5);

  const handleAddTopic = () => {
    if (!topic.trim() || !subject) {
      setError("Please fill in all fields");
      return;
    }

    addTopic(subject, topic, points);
    setTopic("");
    setError("");
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      setError("Subject name cannot be empty");
      return;
    }

    if (allSubjects.includes(newSubject)) {
      setError("Subject already exists");
      return;
    }

    // Add to local subjects and select it
    setLocalSubjects((prev) => [...prev, newSubject]);
    setSubject(newSubject);
    setNewSubject("");
    setShowNewSubjectInput(false);
    setError("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <PlusCircle className="w-3.5 h-3.5" />
          New Subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Manage Subjects & Topics
              </h2>
              <p className="text-sm text-muted-foreground">
                Organize your study materials efficiently
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="subject"
                  className="text-sm font-medium text-foreground"
                >
                  Subject
                </Label>
                <p className="text-xs text-muted-foreground">
                  Select or create a subject
                </p>
              </div>
              {!showNewSubjectInput && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setShowNewSubjectInput(true)}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  New Subject
                </Button>
              )}
            </div>

            {showNewSubjectInput ? (
              <div className="flex gap-2">
                <Input
                  id="new-subject"
                  placeholder="Enter subject name"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddSubject}>
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewSubjectInput(false);
                      setNewSubject("");
                      setError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {allSubjects.length > 0 ? (
                    allSubjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {capitalize(s)}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No subjects yet
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="topic"
                  className="text-sm font-medium text-foreground"
                >
                  Topic
                </Label>
                <p className="text-xs text-muted-foreground">
                  Add a new topic to the selected subject
                </p>
              </div>

              <Input
                placeholder="Enter points"
                className="w-20"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
            </div>

            <div className="flex gap-2">
              <Input
                id="topic"
                placeholder="Enter topic name"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
                className="flex-1 h-10"
              />
              <Button
                onClick={handleAddTopic}
                disabled={!topic.trim() || !subject}
                className="gap-1.5 h-10"
              >
                <BookMarked className="w-4 h-4" />
                <span>Add Topic</span>
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm font-medium rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
