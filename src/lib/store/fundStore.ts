import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface FundTransaction {
  id: string;
  fundId: string;  // Reference to the fund
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  date: string;
  note: string;
  transferTo?: string; // For transfer transactions
}

export interface Fund {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: string;
  isActive: boolean;
  balance: number;
}

interface FundState {
  // State
  funds: Record<string, Fund>; // key is fund ID
  transactions: FundTransaction[];
  activeFundId: string | null;
  
  // Fund Management
  createFund: (name: string, initialBalance?: number, description?: string, category?: string) => string;
  updateFund: (id: string, updates: Partial<Omit<Fund, 'id' | 'balance' | 'createdAt'>>) => void;
  deleteFund: (id: string) => void;
  setActiveFund: (id: string) => void;
  
  // Transactions
  deposit: (amount: number, note?: string, fundId?: string) => string | undefined;
  withdraw: (amount: number, note?: string, fundId?: string) => string | undefined;
  transfer: (amount: number, toFundId: string, note?: string, fromFundId?: string) => { fromId: string; toId: string } | undefined;
  deleteTransaction: (id: string) => void;
  
  // Getters
  getFundBalance: (fundId?: string) => number;
  getTotalBalance: () => number;
  getTransactionsByFund: (fundId: string) => FundTransaction[];
  getTransactionsByDateRange: (startDate: Date, endDate: Date, fundId?: string) => FundTransaction[];
  getFundTransactions: (fundId: string) => FundTransaction[];
  getFundsByCategory: (category: string) => Fund[];
  getActiveFund: () => Fund | null;
}

const useFundStore = create<FundState>()(
  persist(
    (set, get) => ({
      funds: {},
      transactions: [],
      activeFundId: null,

      // Fund Management
      createFund: (name, initialBalance = 0, description = '', category = 'General') => {
        const fundId = uuidv4();
        const newFund: Fund = {
          id: fundId,
          name,
          description,
          category,
          balance: Math.max(0, initialBalance),
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          funds: { ...state.funds, [fundId]: newFund },
          activeFundId: state.activeFundId || fundId,
        }));

        if (initialBalance > 0) {
          const transaction: FundTransaction = {
            id: uuidv4(),
            fundId,
            amount: initialBalance,
            type: 'deposit',
            date: new Date().toISOString(),
            note: 'Initial balance',
          };

          set((state) => ({
            transactions: [transaction, ...state.transactions],
          }));
        }

        return fundId;
      },

      updateFund: (id, updates) => {
        set((state) => {
          const fund = state.funds[id];
          if (!fund) return state;

          return {
            funds: {
              ...state.funds,
              [id]: { ...fund, ...updates },
            },
          };
        });
      },

      deleteFund: (id) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _removedFund, ...remainingFunds } = state.funds;
          const isActiveFund = state.activeFundId === id;
          
          return {
            funds: remainingFunds,
            activeFundId: isActiveFund ? Object.keys(remainingFunds)[0] || null : state.activeFundId,
            transactions: state.transactions.filter(tx => tx.fundId !== id && tx.transferTo !== id),
          };
        });
      },

      setActiveFund: (id) => {
        set({ activeFundId: id });
      },

      // Transactions
  deposit: (amount, note = 'Deposit', fundId) => {
        const targetFundId = fundId || get().activeFundId;
        if (!targetFundId || amount <= 0) return;
        
  const depositTx: FundTransaction = {
          id: uuidv4(),
          fundId: targetFundId,
          amount,
          type: 'deposit',
          date: new Date().toISOString(),
          note,
        };

        set((state) => ({
          funds: {
            ...state.funds,
            [targetFundId]: {
              ...state.funds[targetFundId],
              balance: (state.funds[targetFundId]?.balance || 0) + amount,
            },
          },
          transactions: [depositTx, ...state.transactions],
        }));

        return depositTx.id;
      },

      withdraw: (amount, note = 'Withdrawal', fundId) => {
        const targetFundId = fundId || get().activeFundId;
        if (!targetFundId || amount <= 0) return;
        
        const fund = get().funds[targetFundId];
        if (!fund || amount > fund.balance) return;
        
        const withdrawTx: FundTransaction = {
          id: uuidv4(),
          fundId: targetFundId,
          amount,
          type: 'withdrawal',
          date: new Date().toISOString(),
          note,
        };

        set((state) => ({
          funds: {
            ...state.funds,
            [targetFundId]: {
              ...fund,
              balance: fund.balance - amount,
            },
          },
          transactions: [withdrawTx, ...state.transactions],
        }));

        return withdrawTx.id;
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transfer: (amount, toFundId, _note = 'Transfer', fromFundId) => {
        const sourceFundId = fromFundId || get().activeFundId;
        if (!sourceFundId || !toFundId || sourceFundId === toFundId || amount <= 0) return;
        
        const sourceFund = get().funds[sourceFundId];
        const targetFund = get().funds[toFundId];
        
        if (!sourceFund || !targetFund || amount > sourceFund.balance) return;
        
        const baseTransactionId = uuidv4();
        const timestamp = new Date().toISOString();
        
        // Create withdrawal from source
        const withdrawal: FundTransaction = {
          id: `${baseTransactionId}-from`,
          fundId: sourceFundId,
          amount,
          type: 'transfer',
          date: timestamp,
          note: `Transfer to ${targetFund.name}`,
          transferTo: toFundId,
        };
        
        // Create deposit to target
        const depositTx: FundTransaction = {
          id: `${baseTransactionId}-to`,
          fundId: toFundId,
          amount,
          type: 'transfer',
          date: timestamp,
          note: `Transfer from ${sourceFund.name}`,
          transferTo: sourceFundId,
        };

        set((state) => ({
          funds: {
            ...state.funds,
            [sourceFundId]: {
              ...sourceFund,
              balance: sourceFund.balance - amount,
            },
            [toFundId]: {
              ...targetFund,
              balance: targetFund.balance + amount,
            },
          },
          transactions: [withdrawal, depositTx, ...state.transactions],
        }));

        return { fromId: withdrawal.id, toId: depositTx.id };
      },

      deleteTransaction: (id) => {
        set((state) => {
          const transaction = state.transactions.find((t) => t.id === id);
          if (!transaction) return state;

          // Create a new state object
          const newState = { ...state };
          
          // Handle different transaction types
          if (transaction.type === 'transfer') {
            // For transfers, we need to find and remove both sides of the transaction
            const otherTransactionId = id.endsWith('-from') 
              ? id.replace('-from', '-to')
              : id.replace('-to', '-from');
              
            const otherTransaction = state.transactions.find(t => t.id === otherTransactionId);
            
            if (otherTransaction) {
              // Update the fund balances
              const fundId = transaction.fundId;
              const otherFundId = otherTransaction.fundId;
              const fund = state.funds[fundId];
              const otherFund = state.funds[otherFundId];
              
              if (fund && otherFund) {
                newState.funds = {
                  ...state.funds,
                  [fundId]: {
                    ...fund,
                    balance: fund.balance + transaction.amount,
                  },
                  [otherFundId]: {
                    ...otherFund,
                    balance: otherFund.balance - otherTransaction.amount,
                  },
                };
              }
              
              // Remove both transactions
              newState.transactions = state.transactions.filter(
                t => t.id !== id && t.id !== otherTransactionId
              );
            }
          } else {
            // For regular deposits/withdrawals
            const fundId = transaction.fundId;
            const fund = state.funds[fundId];
            
            if (fund) {
              const amount = transaction.amount;
              const newBalance = transaction.type === 'deposit'
                ? fund.balance - amount
                : fund.balance + amount;
                
              newState.funds = {
                ...state.funds,
                [fundId]: {
                  ...fund,
                  balance: Math.max(0, newBalance),
                },
              };
              
              newState.transactions = state.transactions.filter(t => t.id !== id);
            }
          }
          
          return newState;
        });
      },

      clearAll: () => {
        set({
          funds: {},
          transactions: [],
          activeFundId: null,
        });
      },

      // Getters
      getFundBalance: (fundId) => {
        const targetFundId = fundId || get().activeFundId;
        if (!targetFundId) return 0;
        return get().funds[targetFundId]?.balance || 0;
      },

      getTotalBalance: () => {
        return Object.values(get().funds).reduce(
          (sum, fund) => sum + fund.balance, 0
        );
      },

      getTransactionsByFund: (fundId) => {
        return get().transactions.filter(
          t => t.fundId === fundId || t.transferTo === fundId
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

      getFundTransactions: (fundId) => {
        return get().transactions.filter(tx => tx.fundId === fundId);
      },

      getFundsByCategory: (category) => {
        return Object.values(get().funds).filter(
          fund => fund.category === category
        );
      },

      getActiveFund: () => {
        const { activeFundId, funds } = get();
        return activeFundId ? funds[activeFundId] : null;
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