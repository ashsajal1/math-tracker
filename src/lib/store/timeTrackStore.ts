import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TimeTrackStore {
  isRunning: boolean;
  startTime: number | null; // Timestamp when the timer was started
  topicTimes: Record<string, number>; // Map of topicId -> accumulated seconds
  selectedTopicId: string | null;
  chapter: string;
  lastProcessedTime: number; // Total time (accumulated + current session) when points were last awarded for the CURRENT session/topic

  // Actions
  start: () => void;
  stop: () => void;
  reset: () => void;
  setTopic: (id: string) => void;
  setChapter: (name: string) => void;
  setElapsedTime: (seconds: number) => void;
  updateLastProcessedTime: (time: number) => void;
  
  // Selectors (helper functions exposed as actions or just state)
  getTopicTime: (topicId: string | null) => number;
  getTotalTime: () => number;
}

export const useTimeTrackStore = create<TimeTrackStore>()(
  persist(
    (set, get) => ({
      isRunning: false,
      startTime: null,
      topicTimes: {},
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
        const selectedTopicId = get().selectedTopicId;

        if (selectedTopicId) {
          set((state) => ({
            isRunning: false,
            startTime: null,
            topicTimes: {
              ...state.topicTimes,
              [selectedTopicId]: (state.topicTimes[selectedTopicId] || 0) + currentSessionTime,
            },
          }));
        } else {
           // Fallback if no topic selected (shouldn't happen ideally if UI enforces it)
           set((state) => ({
            isRunning: false,
            startTime: null,
             // We just lose the time or assign to "unknown"? 
             // Let's assign to "unknown" to be safe
             topicTimes: {
                ...state.topicTimes,
                "unknown": (state.topicTimes["unknown"] || 0) + currentSessionTime
             }
          }));
        }
      },

      reset: () => {
        set({
          isRunning: false,
          startTime: null,
          lastProcessedTime: 0,
          // We do NOT reset topicTimes here, "reset" on stopwatch usually means reset the *current session* or *timer display*.
          // But looking at previous implementation, it seemed to reset everything?
          // The user request "tracker will work even after closing app" implies persistence.
          // "Reset" button on stopwatch usually means "Reset current timer to 0".
          // If we want to clear ALL history, that's a different action (maybe in settings).
          // For now, let's make reset stop the timer and maybe clear the *current session* visual?
          // Actually, in the previous code:
          // reset: () => set({ isRunning: false, startTime: null, accumulatedTime: 0, lastProcessedTime: 0 })
          // It cleared accumulatedTime. So it was a "Reset this topic's time" or "Reset all time"?
          // Given the context of a "Stopwatch", reset usually resets the counter.
          // If we want to keep history, we shouldn't allow easy deletion via "Reset".
          // But the user might want to restart tracking for a topic.
          // Let's make `reset` only reset the *current session* logic (stop timer), but NOT clear history.
          // WAIT, if the user sees "10:00" and clicks Reset, they expect it to go to "00:00".
          // If we persist it, does it mean they deleted the 10 mins?
          // Let's assume "Reset" means "Delete time for this topic" for now to match previous behavior of `accumulatedTime: 0`.
        });
        
        const selectedTopicId = get().selectedTopicId;
        if (selectedTopicId) {
            set((state) => ({
                topicTimes: {
                    ...state.topicTimes,
                    [selectedTopicId]: 0
                }
            }));
        }
      },

      setTopic: (id) => set({ selectedTopicId: id }),
      setChapter: (name) => set({ chapter: name }),

      setElapsedTime: (seconds) => {
        const selectedTopicId = get().selectedTopicId;
        if (selectedTopicId) {
            set((state) => ({
                isRunning: false,
                startTime: null,
                topicTimes: {
                    ...state.topicTimes,
                    [selectedTopicId]: seconds
                }
            }));
        }
      },

      updateLastProcessedTime: (time) => set({ lastProcessedTime: time }),

      getTopicTime: (topicId) => {
        if (!topicId) return 0;
        return get().topicTimes[topicId] || 0;
      },

      getTotalTime: () => {
        const times = Object.values(get().topicTimes);
        return times.reduce((acc, time) => acc + time, 0);
      }
    }),
    {
      name: "time-track-storage",
      storage: createJSONStorage(() => localStorage),
      // Migration logic could go here but we are breaking changes as per plan
    }
  )
);
