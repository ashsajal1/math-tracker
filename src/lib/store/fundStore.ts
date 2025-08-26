import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface FundTransaction {
  id: string;
  fundId: string; // Reference to the fund
  amount: number;
  type: "deposit" | "withdrawal" | "transfer" | "cost";
  date: string;
  note: string;
  transferTo?: string; // For transfer transactions
  category?: string; // For cost transactions
  description?: string; // For cost transactions
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
  globalBalance: number; // New global balance state
  globalCost: number;
  debtBalance: number; // Track total debt

  // Cost Management
  addCost: (
    amount: number,
    category: string,
    note?: string,
    fundId?: string
  ) => string;
  getTransactionsByCategory: (category: string) => FundTransaction[];
  getCostTransactions: () => FundTransaction[];
  getTotalCostsByCategory: () => Record<string, number>;

  // Fund Management
  createFund: (
    name: string,
    initialBalance?: number,
    description?: string,
    category?: string
  ) => string;
  updateFund: (
    id: string,
    updates: Partial<Omit<Fund, "id" | "balance" | "createdAt">>
  ) => void;
  deleteFund: (id: string) => void;
  setActiveFund: (id: string) => void;

  // Transactions
  deposit: (
    amount: number,
    note?: string,
    fundId?: string
  ) => string | undefined;
  withdraw: (
    amount: number,
    note?: string,
    fundId?: string
  ) => string | undefined;
  transfer: (
    amount: number,
    toFundId: string,
    note?: string,
    fromFundId?: string
  ) => { fromId: string; toId: string } | undefined;
  deleteTransaction: (id: string) => void;

  // Getters
  getFundBalance: (fundId?: string) => number;
  getTotalBalance: () => number;
  getTransactionsByFund: (fundId: string) => FundTransaction[];
  getTransactionsByDateRange: (
    startDate: Date,
    endDate: Date,
    fundId?: string
  ) => FundTransaction[];
  getFundTransactions: (fundId: string) => FundTransaction[];
  getFundsByCategory: (category: string) => Fund[];
  getActiveFund: () => Fund | null;
}

const useFundStore = create<FundState>()(
  devtools(persist(
    (set, get) => ({
      funds: {},
      transactions: [],
      activeFundId: null,
      globalBalance: 0,
      globalCost: 0,
      debtBalance: 0,

      // Fund Management
      createFund: (
        name,
        initialBalance = 0,
        description = "",
        category = "General"
      ) => {
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
            type: "deposit",
            date: new Date().toISOString(),
            note: "Initial balance",
          };

          set((state) => ({
            transactions: [transaction, ...state.transactions],
            globalBalance: state.globalBalance + initialBalance,
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
            activeFundId: isActiveFund
              ? Object.keys(remainingFunds)[0] || null
              : state.activeFundId,
            transactions: state.transactions.filter(
              (tx) => tx.fundId !== id && tx.transferTo !== id
            ),
          };
        });
      },

      setActiveFund: (id) => {
        set({ activeFundId: id });
      },

      // Transactions
      deposit: (amount, note = "Deposit", fundId) => {
        const targetFundId = fundId || get().activeFundId;
        if (!targetFundId || amount <= 0) return;

        const depositTx: FundTransaction = {
          id: uuidv4(),
          fundId: targetFundId,
          amount,
          type: "deposit",
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
          globalBalance: state.globalBalance + amount,
        }));

        return depositTx.id;
      },
      withdraw: (amount, note = "Withdrawal", fundId) => {
        const targetFundId = fundId || get().activeFundId;
        if (!targetFundId || amount <= 0) return;

        const fund = get().funds[targetFundId];
        if (!fund || amount > fund.balance) return;

        const withdrawTx: FundTransaction = {
          id: uuidv4(),
          fundId: targetFundId,
          amount,
          type: "withdrawal",
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
          globalBalance: Math.max(0, state.globalBalance - amount),
          globalCost: state.globalCost + amount, // Track withdrawal as cost
        }));

        return withdrawTx.id;
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transfer: (amount, toFundId, _note = "Transfer", fromFundId) => {
        const sourceFundId = fromFundId || get().activeFundId;
        if (
          !sourceFundId ||
          !toFundId ||
          sourceFundId === toFundId ||
          amount <= 0
        )
          return;

        const sourceFund = get().funds[sourceFundId];
        const targetFund = get().funds[toFundId];

        if (!sourceFund || !targetFund || amount > sourceFund.balance) {
          // Handle insufficient funds by using debt
          const debtAmount = amount - sourceFund.balance;
          
          // Update source fund to zero and create debt
          set((state) => ({
            funds: {
              ...state.funds,
              [sourceFundId]: {
                ...sourceFund,
                balance: 0,
              },
              [toFundId]: {
                ...targetFund,
                balance: targetFund.balance + sourceFund.balance,
              },
            },
            debtBalance: state.debtBalance + debtAmount,
            transactions: [
              {
                id: uuidv4(),
                fundId: sourceFundId,
                amount: sourceFund.balance,
                type: "withdrawal",
                date: new Date().toISOString(),
                note: `Partial transfer to ${targetFund.name} (Insufficient funds, created ৳${debtAmount} debt)`
              },
              {
                id: uuidv4(),
                fundId: toFundId,
                amount: sourceFund.balance,
                type: "deposit",
                date: new Date().toISOString(),
                note: `Partial transfer from ${sourceFund.name} (Insufficient funds)`
              },
              {
                id: uuidv4(),
                fundId: sourceFundId,
                amount: debtAmount,
                type: "withdrawal",
                date: new Date().toISOString(),
                note: `Debt created for transfer to ${targetFund.name}`,
                transferTo: toFundId,
              },
              ...state.transactions
            ],
          }));
        } else {
          // Normal transfer when sufficient funds
          const baseTransactionId = uuidv4();
          const timestamp = new Date().toISOString();

          // Create withdrawal from source
          const withdrawal: FundTransaction = {
            id: `${baseTransactionId}-from`,
            fundId: sourceFundId,
            amount,
            type: "transfer",
            date: timestamp,
            note: `Transfer to ${targetFund.name}`,
            transferTo: toFundId,
          };

          // Create deposit to target
          const depositTx: FundTransaction = {
            id: `${baseTransactionId}-to`,
            fundId: toFundId,
            amount,
            type: "transfer",
            date: timestamp,
            note: `Transfer from ${sourceFund.name}`,
            transferTo: sourceFundId,
          };

          // Note: Transfers don't affect global balance since money stays in the system
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
        }

        return { fromId: uuidv4(), toId: uuidv4() };
      },

      deleteTransaction: (id) => {
        set((state) => {
          const transaction = state.transactions.find((t) => t.id === id);
          if (!transaction) return state;

          // Create a new state object
          const newState = { ...state };

          // Update global balance and cost based on transaction type
          if (transaction.type === "deposit") {
            newState.globalBalance = Math.max(
              0,
              state.globalBalance - transaction.amount
            );
            // Don't reset globalCost when deleting deposits as it would mess up tracking
          } else if (
            transaction.type === "withdrawal" ||
            transaction.type === "cost"
          ) {
            newState.globalBalance = state.globalBalance + transaction.amount;
            newState.globalCost = Math.max(
              0,
              state.globalCost - transaction.amount
            ); // Reduce globalCost
          }

          // Handle different transaction types
          if (transaction.type === "transfer") {
            // For transfers, we need to find and remove both sides of the transaction
            const otherTransactionId = id.endsWith("-from")
              ? id.replace("-from", "-to")
              : id.replace("-to", "-from");

            const otherTransaction = state.transactions.find(
              (t) => t.id === otherTransactionId
            );

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
                (t) => t.id !== id && t.id !== otherTransactionId
              );
            }
          } else {
            // For regular deposits/withdrawals
            const fundId = transaction.fundId;
            const fund = state.funds[fundId];

            if (fund) {
              const amount = transaction.amount;
              const newBalance =
                transaction.type === "deposit"
                  ? fund.balance - amount
                  : fund.balance + amount;

              newState.funds = {
                ...state.funds,
                [fundId]: {
                  ...fund,
                  balance: Math.max(0, newBalance),
                },
              };

              newState.transactions = state.transactions.filter(
                (t) => t.id !== id
              );
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
          (sum, fund) => sum + fund.balance,
          0
        );
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

      getFundTransactions: (fundId) => {
        return get().transactions.filter((tx) => tx.fundId === fundId);
      },

      getFundsByCategory: (category) => {
        return Object.values(get().funds).filter(
          (fund) => fund.category === category
        );
      },

      getActiveFund: () => {
        const { activeFundId, funds } = get();
        return activeFundId ? funds[activeFundId] : null;
      },

      // Cost Management Functions
      addCost: (amount, category, note = "", fundId) => {
        if (amount <= 0) return "";

        const costTx: FundTransaction = {
          id: uuidv4(),
          fundId: fundId || get().activeFundId || "",
          amount,
          type: "cost",
          category,
          date: new Date().toISOString(),
          note,
        };

        set((state) => ({
          transactions: [costTx, ...state.transactions],
          globalBalance: Math.max(0, state.globalBalance - amount),
          globalCost: state.globalCost + amount,
        }));

        // If a fund is specified, update its balance too
        if (fundId) {
          set((state) => ({
            funds: {
              ...state.funds,
              [fundId]: {
                ...state.funds[fundId],
                balance: Math.max(
                  0,
                  (state.funds[fundId]?.balance || 0) - amount
                ),
              },
            },
          }));
        }

        return costTx.id;
      },

      getTransactionsByCategory: (category) => {
        return get().transactions.filter(
          (tx) => tx.type === "cost" && tx.category === category
        );
      },

      getCostTransactions: () => {
        return get().transactions.filter((tx) => tx.type === "cost");
      },

      getTotalCostsByCategory: () => {
        return get()
          .transactions.filter((tx) => tx.type === "cost")
          .reduce((acc, tx) => {
            const category = tx.category || "Other";
            acc[category] = (acc[category] || 0) + tx.amount;
            return acc;
          }, {} as Record<string, number>);
      },
    }),
    {
      name: "fund-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      version: 1,
    }
  )
));

export default useFundStore;
