import { useState, useEffect } from "react";
import { topicStore, Topic } from "@/lib/store/topicStore";
import { Play, Pause, RotateCcw, X, Award, Edit2 } from "lucide-react";
import { useMathStore } from "@/lib/store/mathStore";
import { useTimeTrackStore } from "@/lib/store/timeTrackStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StopwatchProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeUpdate?: (time: number, isRunning: boolean) => void;
}

export const Stopwatch = ({
  isOpen,
  onClose,
  onTimeUpdate,
}: StopwatchProps) => {
  const [topics, setTopics] = useState<Topic[]>(topicStore.getState().topics);

  // Store state
  const {
    isRunning,
    startTime,
    accumulatedTime,
    selectedTopicId,
    chapter,
    lastProcessedTime,
    start,
    stop,
    reset,
    setTopic,
    setChapter,
    setElapsedTime,
    updateLastProcessedTime,
  } = useTimeTrackStore();

  // Local display state
  const [displayTime, setDisplayTime] = useState<number>(accumulatedTime);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editMinutes, setEditMinutes] = useState("");

  const addProblem = useMathStore((state) => state.addProblem);

  // Subscribe to topic store updates
  useEffect(() => {
    const unsub = topicStore.subscribe((state) => {
      setTopics(state.topics);
      if (!selectedTopicId && state.topics.length > 0) {
        setTopic(state.topics[0].id);
      }
    });
    return () => unsub();
  }, [selectedTopicId, setTopic]);

  // Timer effect - updates display time and handles points
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateTimer = () => {
      const now = Date.now();
      const currentSessionTime =
        isRunning && startTime ? Math.floor((now - startTime) / 1000) : 0;
      const totalTime = accumulatedTime + currentSessionTime;

      setDisplayTime(totalTime);

      // Check for 10-minute intervals
      // 600 seconds = 10 minutes
      if (totalTime - lastProcessedTime >= 600) {
        const selectedTopic = topics.find((t) => t.id === selectedTopicId);

        if (selectedTopic) {
          addProblem(
            {
              subject: selectedTopic.subject,
              topic: "Revision/Reading",
            },
            5 // 5 points for 10 minutes of study
          );

          // Update last processed time to current total time (floored to interval to be safe, or just add 600)
          // Adding 600 ensures we track every 10 mins exactly.
          updateLastProcessedTime(lastProcessedTime + 600);
        }
      }
    };

    if (isRunning) {
      interval = setInterval(updateTimer, 1000);
      updateTimer(); // Immediate update
    } else {
      setDisplayTime(accumulatedTime);
    }

    return () => clearInterval(interval);
  }, [
    isRunning,
    startTime,
    accumulatedTime,
    lastProcessedTime,
    selectedTopicId,
    topics,
    addProblem,
    updateLastProcessedTime,
  ]);

  // Update parent component when time or running state changes
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(displayTime, isRunning);
    }
  }, [displayTime, isRunning, onTimeUpdate]);

  const handleEditTime = () => {
    const minutes = parseInt(editMinutes);
    if (!isNaN(minutes) && minutes >= 0) {
      setElapsedTime(minutes * 60);
      setDisplayTime(minutes * 60);
      // We also update lastProcessedTime to avoid awarding points for manually added time immediately
      // or we can let it be. If we want to prevent "cheating", we should set lastProcessedTime to new time.
      // But maybe user forgot to turn on timer. Let's set it to new time to be safe against spamming.
      // Actually, if they legitimately studied, they should get points.
      // But simpler to just update time and let them earn points moving forward.
      updateLastProcessedTime(minutes * 60);
      setIsEditOpen(false);
      setEditMinutes("");
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  };

  const handleReset = () => {
    reset();
    setDisplayTime(0);
  };

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-neutral-700 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
            Study Stopwatch
          </h1>

          {/* Topic and Chapter Selection */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Topic
              </label>
              <select
                value={selectedTopicId ?? ""}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {topics.length === 0 && (
                  <option value="">No topics available</option>
                )}
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.subject} / {topic.topic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Chapter (Optional)
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g., Chapter 5"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Timer Display */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center border border-blue-200 dark:border-blue-800">
              <div className="text-6xl font-mono font-bold text-slate-900 dark:text-slate-100 tracking-wider relative group">
                {formatTime(displayTime)}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <button className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-500">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Time</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Time (in minutes)
                        </label>
                        <Input
                          type="number"
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(e.target.value)}
                          placeholder="Enter minutes"
                        />
                      </div>
                      <Button onClick={handleEditTime} className="w-full">
                        Save Time
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {selectedTopic && (
                <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  Studying:{" "}
                  <span className="font-medium">
                    {selectedTopic.subject} / {selectedTopic.topic}
                  </span>
                  {chapter && <span> - {chapter}</span>}
                </div>
              )}
              {lastProcessedTime > 0 && (
                <div className="mt-3 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">
                    {Math.floor(lastProcessedTime / 600)} problem
                    {Math.floor(lastProcessedTime / 600) > 1 ? "s" : ""}{" "}
                    created! 🎉
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleStartPause}
              disabled={!selectedTopicId}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-900 dark:text-slate-100 font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
