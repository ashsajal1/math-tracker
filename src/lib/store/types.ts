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

export interface FundState {
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
