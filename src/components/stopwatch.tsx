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
    getTopicTime,
  } = useTimeTrackStore();

  // Local display state
  const [displayTime, setDisplayTime] = useState<number>(0);
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

      const topicTime = getTopicTime(selectedTopicId);
      const totalTime = topicTime + currentSessionTime;

      setDisplayTime(totalTime);

      // Check for 10-minute intervals
      // 600 seconds = 10 minutes
      // We use totalTime for the topic to determine points
      // But we need to be careful: lastProcessedTime tracks "when we last gave points".
      // If we switch topics, lastProcessedTime might be irrelevant if it's not per-topic?
      // Wait, lastProcessedTime in store is GLOBAL/SINGLE.
      // If I study Topic A for 10 mins -> points. Switch to Topic B.
      // Topic B has 0 mins. `totalTime` is 0. `lastProcessedTime` is 600.
      // `totalTime - lastProcessedTime` = -600. No points. Correct.
      // But what if I go back to Topic A? `totalTime` is 10 mins. `lastProcessedTime` is 600.
      // `totalTime - lastProcessedTime` = 0. No points.
      // If I study Topic A for another 10 mins -> `totalTime` 20 mins. Diff 600. Points!
      // So a single `lastProcessedTime` MIGHT work if it tracks "total points awarded * 600" roughly?
      // NO. `lastProcessedTime` was "accumulatedTime + sessionTime" when points were awarded.
      // If we switch topics, `accumulatedTime` changes!
      // So `lastProcessedTime` MUST be tracked per topic OR we just calculate points based on `Math.floor(totalTime / 600)`.
      // If we use `Math.floor`, we need to know how many points we ALREADY gave.
      // Maybe we don't store `lastProcessedTime` in store?
      // Or we store `pointsAwarded` in `topicTimes`? No, that's just time.
      // Let's use a local ref or just rely on the store's `lastProcessedTime` BUT we need to reset/sync it when topic changes.
      // Actually, simplest way:
      // Calculate `expectedPoints = Math.floor(totalTime / 600)`.
      // We need to know `awardedPoints` for this topic.
      // Maybe we don't store `lastProcessedTime` in store?
      // Or we store `pointsAwarded` in `topicTimes`? No, that's just time.
      // Let's just use a local state `lastPointsAwarded` for the current session?
      // But if I refresh, I lose that.
      // Let's update the store to track `lastProcessedTime` as a MAP too? Or just simplify.
      // Let's assume for now we just check if `totalTime % 600 === 0` (roughly)? No, timer ticks.
      // Let's use `lastProcessedTime` from store, but we need to update it when topic changes?
      // Actually, `lastProcessedTime` in the store is currently just a number.
      // Let's try to use `Math.floor(totalTime / 600)` and compare it to something?
      // If we don't track "points awarded" per topic, we might double award or miss.
      // For this iteration, let's just stick to the single `lastProcessedTime` but reset it when topic changes?
      // No, that would allow farming points by switching topics.
      // Let's just check `totalTime` against `lastProcessedTime` IF `lastProcessedTime` was also per topic.
      // Since I didn't add `lastProcessedTimeMap` to store, I will use a heuristic:
      // We only award points if `currentSessionTime` crosses a boundary?
      // Let's just use the `lastProcessedTime` as "Time mark on THIS TOPIC when we last checked".
      // But we need to save it per topic.
      // I'll update `useTimeTrackStore` to have `topicLastProcessed: Record<string, number>` in a future step if needed.
      // For now, let's just use `Math.floor(totalTime / 600)` and compare with a local ref that initializes from `totalTime`?
      // No, persistence.
      // Let's just use the store's `lastProcessedTime` and assume it tracks the CURRENT topic's processed time.
      // When we switch topic, we should probably update `lastProcessedTime` to that topic's current time (floored).
      // I'll add a `useEffect` to sync `lastProcessedTime` when topic changes.

      if (totalTime - lastProcessedTime >= 600) {
        const selectedTopic = topics.find((t) => t.id === selectedTopicId);

        if (selectedTopic) {
          addProblem(
            {
              subject: selectedTopic.subject,
              topic: "Revision/Reading",
            },
            5
          );
          updateLastProcessedTime(lastProcessedTime + 600);
        }
      }
    };

    if (isRunning) {
      interval = setInterval(updateTimer, 1000);
      updateTimer();
    } else {
      setDisplayTime(getTopicTime(selectedTopicId));
    }

    return () => clearInterval(interval);
  }, [
    isRunning,
    startTime,
    selectedTopicId,
    topics,
    addProblem,
    updateLastProcessedTime,
    getTopicTime,
    lastProcessedTime,
  ]);

  // Reset lastProcessedTime when topic changes to avoid conflicts?
  // Ideally we should track it per topic.
  // For now, let's just set lastProcessedTime to the current topic's time (floored to 600) when switching.
  useEffect(() => {
    if (selectedTopicId) {
      const time = getTopicTime(selectedTopicId);
      // We want to start awarding points from the NEXT 10 min mark.
      // So we set lastProcessedTime to the last completed 10 min mark.
      updateLastProcessedTime(Math.floor(time / 600) * 600);
    }
  }, [selectedTopicId, getTopicTime, updateLastProcessedTime]);

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
                disabled={isRunning}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
