import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export type MathProblemType = {
  subject: string;
  topic: string;
};

export interface MathProblem {
  id: string;
  date: string; // ISO date string
  type: MathProblemType;
  points: number;
}

interface MathStore {
  problems: MathProblem[];
  addProblem: (
    type: MathProblemType,
    points?: number,
    dateISO?: string
  ) => void;
  removeProblem: (id: string) => void;
  removeLastProblem: () => void;
  updateProblem: (id: string, updates: Partial<MathProblem>) => void;
  getTotalPoints: () => number;
  getPointsByType: (type: MathProblemType) => number;
  clearAll: () => void;
}

export const useMathStore = create<MathStore>()(
  persist(
    (set, get) => ({
      problems: [],

      addProblem: (type, points = 5, dateISO?: string) => {
        const newProblem: MathProblem = {
          id: uuidv4(),
          date: dateISO ?? new Date().toISOString(),
          type,
          points,
        };
        set((state) => ({
          problems: [...state.problems, newProblem],
        }));
      },

      removeProblem: (id) => {
        set((state) => ({
          problems: state.problems.filter((p) => p.id !== id),
        }));
      },

      removeLastProblem: () => {
        set((state) => {
          if (state.problems.length === 0) return state;
          const problems = [...state.problems];
          problems.pop();
          return { problems };
        });
      },

      updateProblem: (id, updates) => {
        set((state) => ({
          problems: state.problems.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      getTotalPoints: () => {
        return get().problems.reduce((sum, problem) => sum + problem.points, 0);
      },

      getPointsByType: (type: MathProblemType) => {
        return get().problems.filter(p => p.type.subject === type.subject && p.type.topic === type.topic).reduce((sum, problem) => sum + problem.points, 0);
      },

      clearAll: () => {
        set({ problems: [] });
      },
    }),
    {
      name: "math-tracker-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
