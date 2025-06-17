import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type MathProblemType = 'integration' | 'differentiation' | 'trigonometric' | 'mechanics' | 'physics';

export interface MathProblem {
  id: string;
  date: string; // ISO date string
  type: MathProblemType;
  points: number;
}

interface MathStore {
  problems: MathProblem[];
  addProblem: (type: MathProblemType, points?: number) => void;
  removeProblem: (id: string) => void;
  removeLastProblem: () => void;
  updateProblem: (id: string, updates: Partial<MathProblem>) => void;
  getProblemsByType: (type: MathProblemType) => MathProblem[];
  getTotalPoints: () => number;
  getPointsByType: (type: MathProblemType) => number;
  clearAll: () => void;
}

export const useMathStore = create<MathStore>()(
  persist(
    (set, get) => ({
      problems: [],
      
      addProblem: (type, points = 5) => {
        const newProblem: MathProblem = {
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString(),
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
      
      getProblemsByType: (type) => {
        return get().problems.filter((problem) => problem.type === type);
      },
      
      getTotalPoints: () => {
        return get().problems.reduce((sum, problem) => sum + problem.points, 0);
      },
      
      getPointsByType: (type) => {
        return get()
          .problems
          .filter((problem) => problem.type === type)
          .reduce((sum, problem) => sum + problem.points, 0);
      },
      
      clearAll: () => {
        set({ problems: [] });
      },
    }),
    {
      name: 'math-tracker-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);

// Utility function to get all problem types
export const getAllProblemTypes = (): MathProblemType[] => [
  'integration',
  'differentiation',
  'trigonometric',
  'mechanics',
  'physics',
];

// Utility function to get points for all types
export const getPointsForAllTypes = (): Record<MathProblemType, number> => {
  const store = useMathStore.getState();
  return {
    integration: store.getPointsByType('integration'),
    differentiation: store.getPointsByType('differentiation'),
    trigonometric: store.getPointsByType('trigonometric'),
    mechanics: store.getPointsByType('mechanics'),
    physics: store.getPointsByType('physics'),
  };
};
