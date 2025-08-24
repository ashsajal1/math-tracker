import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import useFundStore from "./fundStore";

type ReasonType = "Household" | "Transport" | "Food" | "Entertainment" | "Education" | "Health" | "Other";

export interface CostData {
  id: string;
  date: string;
  cost: number;
  reason: ReasonType;
  note?: string;
  fundId?: string;
  transactionId?: string;
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
        // Check if we have sufficient funds if fundId is provided
        let txId: string | undefined = undefined;
        if (costData.fundId) {
          const fundBalance = useFundStore.getState().getFundBalance(costData.fundId);
          if (fundBalance < costData.cost) {
            alert('Insufficient funds in the selected account');
            return;
          }

          // Deduct from fund and capture the transaction id so we can rollback on delete
          txId = useFundStore.getState().withdraw(
            costData.cost,
            `Expense: ${costData.reason}`,
            costData.fundId
          );
        }
        
        const partial = costData as Partial<CostData>;
        const newCost: CostData = {
          ...(partial as Omit<CostData, 'id'>),
          id: uuidv4(),
          date: partial.date ?? new Date().toISOString(),
          transactionId: txId,
        };
        
        set((state) => ({
          costData: [...state.costData, newCost],
        }));
      },
      
      removeCost: (id) => {
        const costToRemove = get().costData.find(cost => cost.id === id);

        if (costToRemove?.fundId) {
          // Prefer removing the original fund transaction so history and balances stay consistent
          if (costToRemove.transactionId) {
            useFundStore.getState().deleteTransaction(costToRemove.transactionId);
          } else {
            // Fallback to a refund deposit if we don't have the transaction id
            useFundStore.getState().deposit(
              costToRemove.cost,
              `Refund: ${costToRemove.reason}`,
              costToRemove.fundId
            );
          }
        }

        set((state) => ({
          costData: state.costData.filter((cost) => cost.id !== id),
        }));
      },
      
      removeLastCost: () => {
        const lastCost = get().costData[get().costData.length - 1];

        if (lastCost?.fundId) {
          if (lastCost.transactionId) {
            useFundStore.getState().deleteTransaction(lastCost.transactionId);
          } else {
            useFundStore.getState().deposit(
              lastCost.cost,
              `Refund: ${lastCost.reason}`,
              lastCost.fundId
            );
          }
        }

        set((state) => ({
          costData: state.costData.length > 0 ? state.costData.slice(0, -1) : [],
        }));
      },
      
      updateCost: (id, updates) => {
        const oldCost = get().costData.find(cost => cost.id === id);

        set((state) => {
          const costIndex = state.costData.findIndex((cost) => cost.id === id);
          if (costIndex === -1) return state;

          const newCostData = [...state.costData];
          const merged = {
            ...newCostData[costIndex],
            ...updates,
          } as CostData;

          // If fund/cost changed, remove old fund transaction (if any) then create a new one
          if (oldCost && (oldCost.cost !== merged.cost || oldCost.fundId !== merged.fundId)) {
            // Remove old transaction if we have it
            if (oldCost.transactionId) {
              useFundStore.getState().deleteTransaction(oldCost.transactionId);
              merged.transactionId = undefined;
            } else if (oldCost.fundId) {
              // fallback refund
              useFundStore.getState().deposit(
                oldCost.cost,
                `Refund: ${oldCost.reason}`,
                oldCost.fundId
              );
            }

            // Deduct new amount if fund is specified
            if (merged.fundId) {
              const txId = useFundStore.getState().withdraw(
                merged.cost,
                `Expense: ${merged.reason}`,
                merged.fundId
              );
              merged.transactionId = txId || undefined;
            }
          }

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
