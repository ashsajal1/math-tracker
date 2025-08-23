import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Plus, Trash2, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useCostStore } from '@/lib/store/costStore';
import { format } from 'date-fns';

interface FundTransaction {
  id: string;
  amount: number;
  type: 'add' | 'withdraw';
  date: string;
  note: string;
}

export default function Profile() {
  const [funds, setFunds] = useState<number>(0);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<'add' | 'withdraw'>('add');
  const [note, setNote] = useState<string>('');
  const { costData } = useCostStore();

  // Load saved funds and transactions from localStorage on component mount
  useEffect(() => {
    const savedFunds = localStorage.getItem('userFunds');
    const savedTransactions = localStorage.getItem('fundTransactions');
    
    if (savedFunds) {
      setFunds(parseFloat(savedFunds));
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save funds and transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userFunds', funds.toString());
    localStorage.setItem('fundTransactions', JSON.stringify(transactions));
  }, [funds, transactions]);

  const handleTransaction = () => {
    if (!amount || amount <= 0) return;

    const transaction: FundTransaction = {
      id: Date.now().toString(),
      amount,
      type: transactionType,
      date: new Date().toISOString(),
      note: note || (transactionType === 'add' ? 'Funds added' : 'Funds withdrawn')
    };

    setTransactions(prev => [transaction, ...prev]);
    
    if (transactionType === 'add') {
      setFunds(prev => prev + amount);
    } else {
      setFunds(prev => Math.max(0, prev - amount));
    }

    // Reset form
    setAmount(0);
    setNote('');
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    // Update funds
    if (transaction.type === 'add') {
      setFunds(prev => Math.max(0, prev - transaction.amount));
    } else {
      setFunds(prev => prev + transaction.amount);
    }

    // Remove transaction
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Calculate total spent from cost data
  const totalSpent = costData.reduce((sum, item) => sum + item.cost, 0);
  const availableBalance = funds - totalSpent;

  // Export transactions to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Note'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        format(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
        tx.type === 'add' ? 'Deposit' : 'Withdrawal',
        tx.amount.toFixed(2),
        `"${tx.note}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `funding-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profile & Funding</h1>
          <p className="text-muted-foreground">Manage your funds and track expenses</p>
        </div>
        <Button variant="outline" onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export History
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Funds</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Wallet className="h-6 w-6 mr-2 text-primary" />
              ${funds.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {funds > 0 ? (
                <span>Available to spend</span>
              ) : (
                <span>No funds available</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <TrendingDown className="h-6 w-6 mr-2 text-destructive" />
              ${totalSpent.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {costData.length} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available Balance</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-success" />
              ${availableBalance.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {availableBalance < 0 ? 'Overdrawn' : 'Available to spend'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add/Withdraw Funds</CardTitle>
            <CardDescription>Manage your funding balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select 
                value={transactionType} 
                onValueChange={(value: 'add' | 'withdraw') => setTransactionType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Funds</SelectItem>
                  <SelectItem value="withdraw">Withdraw Funds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Monthly budget, Gift, etc."
              />
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={handleTransaction}
              disabled={!amount || amount <= 0 || (transactionType === 'withdraw' && amount > funds)}
            >
              <Plus className="h-4 w-4" />
              {transactionType === 'add' ? 'Add Funds' : 'Withdraw Funds'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your funding history</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">
                          {format(new Date(tx.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.type === 'add' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          }`}>
                            {tx.type === 'add' ? 'Deposit' : 'Withdrawal'}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          tx.type === 'add' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {tx.type === 'add' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {tx.note}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteTransaction(tx.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
