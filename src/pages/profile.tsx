import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Plus, Trash2, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useCostStore } from '@/lib/store/costStore';
import useFundStore from '@/lib/store/fundStore';
import { format } from 'date-fns';

export default function Profile() {
  const [amount, setAmount] = useState<number>(0);
  const [fundName, setFundName] = useState<string>('');
  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [note, setNote] = useState<string>('');
  const [showCreateFund, setShowCreateFund] = useState<boolean>(false);
  
  const { costData } = useCostStore();
  const { 
    deposit, 
    withdraw,
    deleteTransaction,
    getFundBalance,
    getTransactionsByFund,
    createFund,
    setActiveFund,
    activeFundId,
    funds
  } = useFundStore();
  
  // Get the active fund balance and transactions
  const fundBalance = activeFundId ? getFundBalance(activeFundId) : 0;
  const fundTransactions = activeFundId ? getTransactionsByFund(activeFundId) : [];
  
  // Check if there are any funds
  const hasFunds = Object.keys(funds || {}).length > 0;
  
  // Show create fund form if no funds exist
  useEffect(() => {
    if (!hasFunds) {
      setShowCreateFund(true);
    }
  }, [hasFunds]);
  
  const handleCreateFund = () => {
    if (!fundName.trim()) return;
    const newFundId = createFund(fundName, initialAmount, 'Main fund');
    setActiveFund(newFundId);
    setFundName('');
    setInitialAmount(0);
    setShowCreateFund(false);
  };

  const handleTransaction = () => {
    if (!amount || amount <= 0 || !activeFundId) return;

    if (transactionType === 'deposit') {
      deposit(amount, note || 'Deposit', activeFundId);
    } else {
      // Check if there's enough balance before withdrawing
      if (amount <= fundBalance) {
        withdraw(amount, note || 'Withdrawal', activeFundId);
      } else {
        alert('Insufficient funds for this withdrawal');
        return;
      }
    }

    // Reset form
    setAmount(0);
    setNote('');
  };

  // Calculate total spent from cost data
  const totalSpent = costData.reduce((sum: number, item: { cost: number }) => sum + item.cost, 0);
  const availableBalance = fundBalance - totalSpent;

  // Export transactions to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Note'];
    const csvContent = [
      headers.join(','),
      ...fundTransactions.map((tx) => [
        format(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
        tx.type === 'deposit' ? 'Deposit' : 'Withdrawal',
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

  if (showCreateFund) {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create Your First Fund</CardTitle>
            <CardDescription>Get started by creating a fund to manage your money</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fundName">Fund Name</Label>
              <Input
                id="fundName"
                value={fundName}
                onChange={(e) => setFundName(e.target.value)}
                placeholder="e.g., Personal, Business, Savings"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialAmount">Initial Amount ($)</Label>
              <Input
                id="initialAmount"
                type="number"
                min="0"
                step="0.01"
                value={initialAmount || ''}
                onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <Button 
              className="w-full gap-2" 
              onClick={handleCreateFund}
              disabled={!fundName.trim()}
            >
              <Plus className="h-4 w-4" />
              Create Fund
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profile & Funding</h1>
          <p className="text-muted-foreground">Manage your funds and track expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export History
          </Button>
          <Button variant="outline" onClick={() => setShowCreateFund(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Fund
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Funds</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Wallet className="h-6 w-6 mr-2 text-primary" />
              ${fundBalance.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {fundBalance > 0 ? (
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
                onValueChange={(value: 'deposit' | 'withdrawal') => setTransactionType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Add Funds</SelectItem>
                  <SelectItem value="withdrawal">Withdraw Funds</SelectItem>
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
              disabled={!amount || amount <= 0 || (transactionType === 'withdrawal' && amount > fundBalance) || !activeFundId}
            >
              <Plus className="h-4 w-4" />
              {transactionType === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your funding history</CardDescription>
          </CardHeader>
          <CardContent>
            {fundTransactions && fundTransactions.length === 0 ? (
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
                    {fundTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">
                          {format(new Date(tx.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.type === 'deposit' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          }`}>
                            {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          tx.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
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
