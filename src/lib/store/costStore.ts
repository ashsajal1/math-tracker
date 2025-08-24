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
  fundId?: string;
}

// Define the store state and actions
type CostStore = {
  costData: CostData[];
  addCost: (costData: Omit<CostData, 'id' | 'date'>) => void;
  removeCost: (id: string) => void;
  removeLastCost: () => void;
  updateCost: (id: string, updates: Partial<Omit<CostData, 'id'>>) => void;
  getCostsByType: (type: ReasonType) => CostData[];
  getTotalCost: () => number;
  getCostByType: (reason: ReasonType) => number;
  clearAll: () => void;
};

// Create the store with persistence
export const useCostStore = create<CostStore>()(
  persist(
    (set, get) => ({
      costData: [],
      
      addCost: (costData) => {
        const partial = costData as Partial<CostData>;
        const newCost: CostData = {
          ...(partial as Omit<CostData, 'id'>),
          id: uuidv4(),
          date: partial.date ?? new Date().toISOString(),
        };
        
        set((state) => ({
          costData: [...state.costData, newCost],
        }));
      },
      
      removeCost: (id) => {
        set((state) => ({
          costData: state.costData.filter((cost) => cost.id !== id),
        }));
      },
      
      removeLastCost: () => {
        set((state) => ({
          costData: state.costData.length > 0 ? state.costData.slice(0, -1) : [],
        }));
      },
      
      updateCost: (id, updates) => {
        set((state) => {
          const costIndex = state.costData.findIndex((cost) => cost.id === id);
          if (costIndex === -1) return state;

          const newCostData = [...state.costData];
          const merged = {
            ...newCostData[costIndex],
            ...updates,
          } as CostData;

          newCostData[costIndex] = merged;
          return { costData: newCostData };
        });
      },
      
      getCostsByType: (type: ReasonType): CostData[] => {
        return get().costData.filter((cost: CostData) => cost.reason === type);
      },
      
      getTotalCost: (): number => {
        return get().costData.reduce((sum: number, cost: CostData) => sum + cost.cost, 0);
      },
      
      getCostByType: (reason: ReasonType): number => {
        return get()
          .costData
          .filter((cost: CostData) => cost.reason === reason)
          .reduce((sum: number, cost: CostData) => sum + cost.cost, 0);
      },
      
      clearAll: (): void => {
        // Note: This will not refund any funds as we're clearing everything
        set({ costData: [] });
      },
    }),
    {
      name: "cost-tracker-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Utility function to get all problem types
export const getAllProblemTypes = (): string[] => {
  const { costData } = useCostStore.getState();
  return Array.from(new Set(costData.map(cost => cost.reason)));
};

// Utility function to get costs by category
export const getCostForAllTypes = (): Record<string, number> => {
  const costs = useCostStore.getState().costData;
  return costs.reduce((acc: Record<string, number>, cost: CostData) => {
    acc[cost.reason] = (acc[cost.reason] || 0) + cost.cost;
    return acc;
  }, {});
};
