import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type MathProblemType = 'integration' | 'differentiation' | 'trigonometric' | 'mechanics' | 'physics' | 'ict' | 'others';

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
          id: uuidv4(),
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
    ict: store.getPointsByType('ict'),
    others: store.getPointsByType('others'),
  };
};
