import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface FundTransaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string;
  note: string;
}

interface FundState {
  // State
  balance: number;
  transactions: FundTransaction[];
  
  // Actions
  deposit: (amount: number, note?: string) => void;
  withdraw: (amount: number, note?: string) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;
  
  // Getters
  getTotalDeposits: () => number;
  getTotalWithdrawals: () => number;
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => FundTransaction[];
  getBalanceAtDate: (date: Date) => number;
}

const useFundStore = create<FundState>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],

      deposit: (amount, note = 'Deposit') => {
        if (amount <= 0) return;
        
        const transaction: FundTransaction = {
          id: uuidv4(),
          amount,
          type: 'deposit',
          date: new Date().toISOString(),
          note,
        };

        set((state) => ({
          balance: state.balance + amount,
          transactions: [transaction, ...state.transactions],
        }));
      },

      withdraw: (amount, note = 'Withdrawal') => {
        if (amount <= 0 || amount > get().balance) return;
        
        const transaction: FundTransaction = {
          id: uuidv4(),
          amount,
          type: 'withdrawal',
          date: new Date().toISOString(),
          note,
        };

        set((state) => ({
          balance: state.balance - amount,
          transactions: [transaction, ...state.transactions],
        }));
      },

      deleteTransaction: (id) => {
        set((state) => {
          const transaction = state.transactions.find((t) => t.id === id);
          if (!transaction) return state;

          const newBalance = 
            transaction.type === 'deposit'
              ? state.balance - transaction.amount
              : state.balance + transaction.amount;

          return {
            balance: Math.max(0, newBalance), // Ensure balance doesn't go negative
            transactions: state.transactions.filter((t) => t.id !== id),
          };
        });
      },

      clearAll: () => {
        set({
          balance: 0,
          transactions: [],
        });
      },

      // Getters
      getTotalDeposits: () => {
        return get().transactions
          .filter((t) => t.type === 'deposit')
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getTotalWithdrawals: () => {
        return get().transactions
          .filter((t) => t.type === 'withdrawal')
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getTransactionsByDateRange: (startDate, endDate) => {
        return get().transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      },

      getBalanceAtDate: (date) => {
        return get().transactions
          .filter((t) => new Date(t.date) <= date)
          .reduce((balance, t) => {
            return t.type === 'deposit' 
              ? balance + t.amount 
              : balance - t.amount;
          }, 0);
      },
    }),
    {
      name: 'fund-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      version: 1,
    }
  )
);

export default useFundStore;