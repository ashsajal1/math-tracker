import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { FundState, Fund } from "./types";
import { useTransactionStore } from "./transactionStore";
import type { FundTransaction } from "./types";

const useFundStore = create<FundState>()(
  devtools(
    persist(
      (set, get) => ({
        funds: {},
        activeFundId: null,

      // Initialize transactions as an empty array to satisfy the FundState interface
      transactions: [],

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
          useTransactionStore.getState().addTransaction({
            fundId,
            amount: initialBalance,
            type: "deposit",
            note: "Initial balance",
          });
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

        set((state) => ({
          funds: {
            ...state.funds,
            [targetFundId]: {
              ...state.funds[targetFundId],
              balance: (state.funds[targetFundId]?.balance || 0) + amount,
            },
          },
        }));

        return useTransactionStore.getState().addTransaction({
          fundId: targetFundId,
          amount,
          type: "deposit",
          note,
        });
      },
      withdraw: (amount, note = "Withdrawal", fundId) => {
        const targetFundId = fundId || get().activeFundId;
        if (!targetFundId || amount <= 0) return;

        const fund = get().funds[targetFundId];
        if (!fund || amount > fund.balance) return;

        set((state) => ({
          funds: {
            ...state.funds,
            [targetFundId]: {
              ...fund,
              balance: fund.balance - amount,
            },
          },
        }));

        return useTransactionStore.getState().addTransaction({
          fundId: targetFundId,
          amount,
          type: "withdrawal",
          note,
        });
      },

      transfer: (amount, toFundId, note = "Transfer", fromFundId) => {
        const sourceFundId = fromFundId || get().activeFundId;
        if (!sourceFundId || !toFundId || sourceFundId === toFundId || amount <= 0) {
          return;
        }

        const sourceFund = get().funds[sourceFundId];
        const targetFund = get().funds[toFundId];

        if (!sourceFund || !targetFund) return;

        if (amount > sourceFund.balance) {
          // Handle insufficient funds by using debt
          const transferableAmount = sourceFund.balance;
          const debtAmount = amount - transferableAmount;
          
          // Update funds
          set((state) => ({
            funds: {
              ...state.funds,
              [sourceFundId]: {
                ...sourceFund,
                balance: 0,
              },
              [toFundId]: {
                ...targetFund,
                balance: targetFund.balance + transferableAmount,
              },
            },
          }));

          // Add transactions
          const tx1 = useTransactionStore.getState().addTransaction({
            fundId: sourceFundId,
            amount: transferableAmount,
            type: "withdrawal",
            note: `Partial transfer to ${targetFund.name} (Insufficient funds, created ৳${debtAmount} debt)`,
          });

          const tx2 = useTransactionStore.getState().addTransaction({
            fundId: toFundId,
            amount: transferableAmount,
            type: "deposit",
            note: `Partial transfer from ${sourceFund.name} (Insufficient funds)`,
          });

          const tx3 = useTransactionStore.getState().addTransaction({
            fundId: sourceFundId,
            amount: debtAmount,
            type: "withdrawal",
            note: `Debt created for transfer to ${targetFund.name}`,
            transferTo: toFundId,
          });

          return { fromId: tx1, toId: tx2, debtTxId: tx3 };
        } else {
          // Normal transfer when sufficient funds
          // Update funds
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
          }));

          // Add transfer transactions
          const tx1 = useTransactionStore.getState().addTransaction({
            fundId: sourceFundId,
            amount,
            type: "transfer",
            note: note || `Transfer to ${targetFund.name}`,
            transferTo: toFundId,
          });

          const tx2 = useTransactionStore.getState().addTransaction({
            fundId: toFundId,
            amount,
            type: "transfer",
            note: note || `Transfer from ${sourceFund.name}`,
            transferTo: sourceFundId,
          });

          return { fromId: tx1, toId: tx2 };
        }
      },

      deleteTransaction: (id) => {
        // Delegate to transaction store
        useTransactionStore.getState().deleteTransaction(id);
      },

      clearAll: () => {
        set({
          funds: {},
          activeFundId: null,
        });
        useTransactionStore.getState().clearAllTransactions();
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

      // These getters are now managed by the transaction store
      get globalBalance() {
        return useTransactionStore.getState().globalBalance;
      },

      get globalCost() {
        return useTransactionStore.getState().globalCost;
      },

      get debtBalance() {
        return useTransactionStore.getState().debtBalance;
      },

      getTransactionsByFund: (fundId) => {
        return useTransactionStore.getState().getTransactionsByFund(fundId);
      },

      getTransactionsByDateRange: (startDate, endDate, fundId) => {
        return useTransactionStore.getState().getTransactionsByDateRange(startDate, endDate, fundId);
      },

      getFundTransactions: (fundId) => {
        return useTransactionStore.getState().getTransactionsByFund(fundId);
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
        return useTransactionStore.getState().getTransactionsByCategory(category);
      },

      getCostTransactions: () => {
        return useTransactionStore.getState().getCostTransactions();
      },

      getTotalCostsByCategory: () => {
        return useTransactionStore.getState().getTotalCostsByCategory();
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
