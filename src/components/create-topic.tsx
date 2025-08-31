import { topicStore } from "@/lib/store/topicStore";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { PlusCircle, BookOpen, BookMarked } from "lucide-react";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

export default function CreateTopic() {
  const { addTopic, topics } = topicStore();
  // Get unique subjects from both store and local state
  const storeSubjects = Array.from(new Set(topics.map((t) => t.subject)));
  const [localSubjects, setLocalSubjects] = useState<string[]>([]);
  // Combine store and local subjects, removing duplicates
  const allSubjects = Array.from(new Set([...storeSubjects, ...localSubjects]));

  const [topic, setTopic] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [newSubject, setNewSubject] = useState<string>("");
  const [showNewSubjectInput, setShowNewSubjectInput] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleAddTopic = () => {
    if (!topic.trim() || !subject) {
      setError("Please fill in all fields");
      return;
    }
    
    addTopic(subject, topic);
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
    setLocalSubjects(prev => [...prev, newSubject]);
    setSubject(newSubject);
    setNewSubject("");
    setShowNewSubjectInput(false);
    setError("");
  };

  return (
    <Card>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Manage Subjects & Topics
        </h2>
        <p className="text-muted-foreground">
          Create and organize your study materials by subjects and topics
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject
            </Label>
            {!showNewSubjectInput && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() => setShowNewSubjectInput(true)}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add New Subject
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
                      {s}
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

        <div className="space-y-2">
          <Label htmlFor="topic" className="text-sm font-medium">
            Topic
          </Label>
          <div className="flex gap-2">
            <Input
              id="topic"
              placeholder="Enter topic name"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
              className="flex-1"
            />
            <Button 
              onClick={handleAddTopic}
              disabled={!topic.trim() || !subject}
              className="gap-1"
            >
              <BookMarked className="w-4 h-4" />
              Add Topic
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    </Card>
  );
}
