import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface Session {
  id: string;
  topicId: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
}

interface TimeTrackStore {
  isRunning: boolean;
  startTime: number | null; // Timestamp when the timer was started
  topicTimes: Record<string, number>; // Map of topicId -> accumulated seconds
  sessions: Session[]; // Log of all study sessions
  selectedTopicId: string | null;
  chapter: string;
  lastProcessedTime: number; // Total time (accumulated + current session) when points were last awarded
  accumulatedTime: number; // Time tracked in current session (including pauses)

  // Actions
  start: () => void;
  stop: () => void; // Pauses the timer
  reset: () => void; // Resets current timer without saving
  saveSession: () => void; // Stops, saves session, and resets
  setTopic: (id: string) => void;
  setChapter: (name: string) => void;
  setElapsedTime: (seconds: number) => void;
  updateLastProcessedTime: (time: number) => void;
  
  // Selectors
  getTopicTime: (topicId: string | null) => number;
  getTotalTime: () => number;
}

export const useTimeTrackStore = create<TimeTrackStore>()(
  persist(
    (set, get) => ({
      isRunning: false,
      startTime: null,
      accumulatedTime: 0,
      topicTimes: {},
      sessions: [],
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

        // When pausing, we just add to topicTimes temporarily? 
        // Or do we keep "accumulatedTime" for the CURRENT session separate from "topicTimes"?
        // In previous refactor, I removed `accumulatedTime` and updated `topicTimes` directly on stop.
        // This is fine for "Pause".
        
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
           set((state) => ({
            isRunning: false,
            startTime: null,
             topicTimes: {
                ...state.topicTimes,
                "unknown": (state.topicTimes["unknown"] || 0) + currentSessionTime
             }
          }));
        }
      },

      saveSession: () => {
        const state = get();
        // If running, stop first to get final time
        let currentSessionTime = 0;
        if (state.isRunning && state.startTime) {
            currentSessionTime = Math.floor((Date.now() - state.startTime) / 1000);
        }

        // We need to know the TOTAL duration of this "session" (including previous pauses if we consider them part of one session).
        // But `topicTimes` stores LIFETIME total.
        // The user wants to "Stop" and save.
        // Usually "Stop" means "I am done studying for now".
        // If they paused and resumed, that's one session? Or multiple?
        // If we treat "Start -> Stop" as one session, we need to track "current session accumulated time" separate from "lifetime topic time".
        // BUT, my previous refactor merged `accumulatedTime` into `topicTimes`.
        // So `topicTimes` is "Total Lifetime Time".
        // If I want to save a "Session", I need to know how much time was added *since the last reset/save*.
        // I don't have that info anymore if I merge directly into `topicTimes` on Pause.
        // CRITICAL: I need to bring back `accumulatedTime` (or `currentSessionDuration`) to track the *current* session's duration before it is committed to history.
        // OR, I just log `currentSessionTime` (from last Start) as a session?
        // If I Pause and Resume, I usually expect that to be one session.
        // So I should probably re-introduce `accumulatedTime` which tracks "Time in this active session (including pauses)".
        // And `topicTimes` should only be updated when I `saveSession`?
        // OR `topicTimes` updates live (for stats) but `sessions` logs chunks?
        // Let's go with: `topicTimes` is the source of truth for "Total Time".
        // `sessions` is a log.
        // When `saveSession` is called, we need to know "How long was this session?".
        // If I use `accumulatedTime` again, it solves this.
        // Let's re-introduce `accumulatedTime` to track the current "unsaved" session duration.
        // And `topicTimes` will be updated EITHER live OR on save.
        // Updating on save is safer for "Session" definition.
        // So:
        // Start: starts timer.
        // Pause: stops timer, adds to `accumulatedTime`.
        // Save/Stop: takes `accumulatedTime` (+ current if running), creates Session, adds to `topicTimes`, resets `accumulatedTime`.
        
        // REFACTORING BACK `accumulatedTime`:
        // This means `topicTimes` won't update until "Stop" is clicked?
        // That might be confusing if user goes to Stats page while Paused.
        // But "Stop" implies "Commit".
        // Let's do that. It's cleaner for "Sessions".
        
        const finalTime = state.accumulatedTime + currentSessionTime;
        if (finalTime === 0) {
            // Nothing to save, just reset
            set({ isRunning: false, startTime: null, accumulatedTime: 0 });
            return;
        }

        const selectedTopicId = state.selectedTopicId || "unknown";
        
        const newSession: Session = {
            id: uuidv4(),
            topicId: selectedTopicId,
            startTime: Date.now() - finalTime * 1000, // Approximate start time
            endTime: Date.now(),
            duration: finalTime
        };

        set((state) => ({
            isRunning: false,
            startTime: null,
            accumulatedTime: 0, // Reset current session
            sessions: [...state.sessions, newSession],
            topicTimes: {
                ...state.topicTimes,
                [selectedTopicId]: (state.topicTimes[selectedTopicId] || 0) + finalTime
            }
        }));
      },

      reset: () => {
        set({
          isRunning: false,
          startTime: null,
          accumulatedTime: 0,
          lastProcessedTime: 0,
        });
      },

      setTopic: (id) => set({ selectedTopicId: id }),
      setChapter: (name) => set({ chapter: name }),

      setElapsedTime: (seconds) => {
         // For manual edit, we probably just want to add to topicTimes directly?
         // Or update current session?
         // Let's update current session `accumulatedTime`.
         set({ accumulatedTime: seconds, isRunning: false, startTime: null });
      },

      updateLastProcessedTime: (time) => set({ lastProcessedTime: time }),

      getTopicTime: (topicId) => {
        if (!topicId) return 0;
        // Include current session time in display?
        // The UI usually combines `accumulatedTime` + `topicTimes[id]`?
        // No, `topicTimes` is historical. `accumulatedTime` is current.
        // So `getTopicTime` should probably return `topicTimes[id]`.
        // The UI will add `accumulatedTime` if it's the *active* topic.
        return get().topicTimes[topicId] || 0;
      },

      getTotalTime: () => {
        const times = Object.values(get().topicTimes);
        const historical = times.reduce((acc, time) => acc + time, 0);
        // Add current session?
        return historical + get().accumulatedTime;
      }
    }),
    {
      name: "time-track-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
