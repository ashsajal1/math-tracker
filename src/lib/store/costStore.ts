import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

type ReasonType = "Household" | "Transport" | "Food" | "Entertainment" | "Education" | "Health" | "Other";
export interface CostData {
  id: string;
  date: string;
  cost: number;
  reason: ReasonType;
  note?: string;
  fund?: string;
}

interface CostStore {
  costData: CostData[];
  addCost: (costData: Omit<CostData, 'id' | 'date'>) => void;
  removeCost: (id: string) => void;
  removeLastCost: () => void;
  updateCost: (id: string, updates: Partial<CostData>) => void;
  getCostsByType: (type: CostData) => CostData[];
  getTotalCost: () => number;
  getCostByType: (reason: string) => number;
  clearAll: () => void;
}

export const useCostStore = create<CostStore>()(
  persist(
    (set, get) => ({
      costData: [],

      addCost: (costData: Omit<CostData, 'id' | 'date'>) => {
        const newCostData: CostData = {
          id: uuidv4(),
          date: new Date().toISOString(),
          ...costData,
        };
        set((state) => ({
          costData: [...state.costData, newCostData],
        }));
      },

      removeCost: (id) => {
        set((state) => ({
          costData: state.costData.filter((p) => p.id !== id),
        }));
      },

      removeLastCost: () => {
        set((state) => {
          if (state.costData.length === 0) return state;
          const costData = [...state.costData];
          costData.pop();
          return { costData };
        });
      },

      updateCost: (id, updates) => {
        set((state) => ({
          costData: state.costData.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      getCostsByType: (type) => {
        return get().costData.filter(
          (costData) =>
            costData.cost === type.cost &&
            costData.reason === type.reason
        );
      },

      getTotalCost: () => {
        return get().costData.reduce((sum, costData) => sum + costData.cost, 0);
      },

      getCostByType: (reason) => {
        return get()
          .costData.filter((costData) => costData.reason === reason)
          .reduce((sum, costData) => sum + costData.cost, 0);
      },

      clearAll: () => {
        set({ costData: [] });
      },
    }),
    {
      name: "math-tracker-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);

// Utility function to get all problem types
export const getAllProblemTypes = (): string[] => ["Household", "Transport", "Food", "Entertainment", "Education", "Health", "Other"];

// Utility function to get points for all types
// Returns an object keyed by "<subject>:<topic>" with total points per type
export const getCostForAllTypes = (): Record<string, number> => {
  const store = useCostStore.getState();
  const types = getAllProblemTypes();
  const totals: Record<string, number> = {};
  for (const t of types) {
    const key = `${t}`;
    totals[key] = store.getCostByType(t);
  }
  return totals;
};
