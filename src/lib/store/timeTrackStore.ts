import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TimeTrackStore {
  isRunning: boolean;
  startTime: number | null; // Timestamp when the timer was started
  accumulatedTime: number; // Total time accumulated in seconds before the current session
  selectedTopicId: string | null;
  chapter: string;
  lastProcessedTime: number; // Total time (accumulated + current session) when points were last awarded

  // Actions
  start: () => void;
  stop: () => void;
  reset: () => void;
  setTopic: (id: string) => void;
  setChapter: (name: string) => void;
  setElapsedTime: (seconds: number) => void;
  updateLastProcessedTime: (time: number) => void;
}

export const useTimeTrackStore = create<TimeTrackStore>()(
  persist(
    (set, get) => ({
      isRunning: false,
      startTime: null,
      accumulatedTime: 0,
      selectedTopicId: null,
      chapter: "",
      lastProcessedTime: 0,

      start: () => {
        if (get().isRunning) return;
        set({
          isRunning: true,
          startTime: Date.now(),
        });
      },

      stop: () => {
        if (!get().isRunning) return;
        const now = Date.now();
        const startTime = get().startTime;
        const currentSessionTime = startTime ? Math.floor((now - startTime) / 1000) : 0;

        set((state) => ({
          isRunning: false,
          startTime: null,
          accumulatedTime: state.accumulatedTime + currentSessionTime,
        }));
      },

      reset: () => {
        set({
          isRunning: false,
          startTime: null,
          accumulatedTime: 0,
          lastProcessedTime: 0,
          // We might want to keep topic/chapter, but "reset" usually implies resetting the timer session.
          // Let's keep topic/chapter as they are user selections, but reset timer related stuff.
          // Actually, the previous implementation reset everything including intervals.
          // Let's reset timer values.
        });
      },

      setTopic: (id) => set({ selectedTopicId: id }),
      setChapter: (name) => set({ chapter: name }),

      setElapsedTime: (seconds) => {
        // When editing time, we assume we are setting the TOTAL elapsed time.
        // If running, we should probably stop first to avoid confusion, or adjust accumulatedTime such that total equals new time.
        // Easiest is to stop, set accumulatedTime, and let user start again if they want.
        set({
          isRunning: false,
          startTime: null,
          accumulatedTime: seconds,
          // We should also probably reset lastProcessedTime or adjust it?
          // If user increases time, they might get free points if we don't adjust.
          // If user decreases time, they might re-earn points.
          // Let's leave lastProcessedTime as is, or maybe set it to the new time if new time < lastProcessedTime to allow re-earning?
          // For simplicity and to prevent abuse, let's set lastProcessedTime to the new time (floored to 10 min interval)
          // so they don't get immediate points for past time, but can earn for future.
          // Actually, if they manually set it to 50 mins, maybe they WANT to record 50 mins of work.
          // But the requirement is "track time", usually for study sessions.
          // Let's just update accumulatedTime. The UI logic will handle points based on *crossing* thresholds.
        });
      },

      updateLastProcessedTime: (time) => set({ lastProcessedTime: time }),
    }),
    {
      name: "time-track-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
