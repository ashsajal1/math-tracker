import { topicStore } from "@/lib/store/topicStore";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2, BookOpen } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";

export default function UpdateTopic() {
  const { topics, updateTopic, removeTopic } = topicStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<{
    id: string;
    subject: string;
    topic: string;
    points: number;
  } | null>(null);
  const [error, setError] = useState("");

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;

    if (!editingTopic.subject.trim() || !editingTopic.topic.trim()) {
      setError("Please fill in all fields");
      return;
    }

    updateTopic(editingTopic.id, {
      subject: editingTopic.subject.toLowerCase(),
      topic: editingTopic.topic.toLowerCase(),
      points: editingTopic.points || 5,
    });

    toast.success("Topic updated successfully");
    setIsDialogOpen(false);
    setError("");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this topic?")) {
      removeTopic(id);
      toast.success("Topic deleted successfully");
    }
  };

  const openEditDialog = (topic: any) => {
    setEditingTopic(topic);
    setError("");
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Manage Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No topics found. Add some topics to get started.</p>
        ) : (
          <div className="space-y-4">
            {topics.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div>
                  <h4 className="font-medium capitalize">{item.subject}</h4>
                  <p className="text-sm text-muted-foreground">{item.topic}</p>
                  <span className="inline-flex items-center text-xs text-muted-foreground mt-1">
                    {item.points || 5} points
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEditDialog(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Topic
            </Button>
          </DialogTrigger>
          {editingTopic && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Topic</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={editingTopic?.subject || ""}
                    onChange={(e) =>
                      setEditingTopic({
                        ...editingTopic!,
                        subject: e.target.value,
                      })
                    }
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={editingTopic?.topic || ""}
                    onChange={(e) =>
                      setEditingTopic({
                        ...editingTopic!,
                        topic: e.target.value,
                      })
                    }
                    placeholder="e.g., Quadratic Equations"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Select
                    value={editingTopic?.points?.toString() || "5"}
                    onValueChange={(value) =>
                      setEditingTopic({
                        ...editingTopic!,
                        points: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select points" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} point{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
}