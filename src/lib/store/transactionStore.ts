import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { FundTransaction, TransactionState } from "./types";

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      globalBalance: 0,
      globalCost: 0,
      debtBalance: 0,

      addTransaction: (transaction) => {
        const newTransaction: FundTransaction = {
          ...transaction,
          id: uuidv4(),
          date: new Date().toISOString(),
        };

        set((state) => {
          const newState = { ...state };
          
          // Update global balance and cost based on transaction type
          if (newTransaction.type === 'deposit') {
            newState.globalBalance += newTransaction.amount;
          } else if (newTransaction.type === 'withdrawal' || newTransaction.type === 'cost') {
            newState.globalBalance = Math.max(0, state.globalBalance - newTransaction.amount);
            newState.globalCost += newTransaction.amount;
          }
          // Transfers don't affect global balance as money stays in the system

          return {
            ...newState,
            transactions: [newTransaction, ...state.transactions],
          };
        });

        return newTransaction.id;
      },

      deleteTransaction: (id) => {
        set((state) => {
          const transaction = state.transactions.find((t) => t.id === id);
          if (!transaction) return state;

          const newState = { ...state };

          // Update global balance and cost based on transaction type
          if (transaction.type === 'deposit') {
            newState.globalBalance = Math.max(0, state.globalBalance - transaction.amount);
          } else if (transaction.type === 'withdrawal' || transaction.type === 'cost') {
            newState.globalBalance += transaction.amount;
            newState.globalCost = Math.max(0, state.globalCost - transaction.amount);
          }

          // Handle transfer pairs
          if (transaction.type === 'transfer') {
            const otherTransactionId = id.endsWith('-from')
              ? id.replace('-from', '-to')
              : id.replace('-to', '-from');

            return {
              ...newState,
              transactions: state.transactions.filter(
                (t) => t.id !== id && t.id !== otherTransactionId
              ),
            };
          }

          return {
            ...newState,
            transactions: state.transactions.filter((t) => t.id !== id),
          };
        });
      },

      getTransactionsByFund: (fundId) => {
        return get().transactions.filter(
          (t) => t.fundId === fundId || t.transferTo === fundId
        );
      },

      getTransactionsByDateRange: (startDate, endDate, fundId) => {
        const transactions = fundId
          ? get().getTransactionsByFund(fundId)
          : get().transactions;

        return transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      },

      getTransactionsByCategory: (category) => {
        return get().transactions.filter(
          (t) => t.category === category && (t.type === 'cost' || t.type === 'withdrawal')
        );
      },

      getCostTransactions: () => {
        return get().transactions.filter((t) => t.type === 'cost');
      },

      getTotalCostsByCategory: () => {
        const costs = get().transactions.filter(
          (t) => t.type === 'cost' || t.type === 'withdrawal'
        );
        
        return costs.reduce((acc, curr) => {
          const category = curr.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + curr.amount;
          return acc;
        }, {} as Record<string, number>);
      },

      clearAllTransactions: () => {
        set({
          transactions: [],
          globalBalance: 0,
          globalCost: 0,
          debtBalance: 0,
        });
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
