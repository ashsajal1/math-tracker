import { useState } from 'react';
import { CostData, useCostStore } from '@/lib/store/costStore';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ReasonType = "Household" | "Transport" | "Food" | "Entertainment" | "Education" | "Health" | "Other";

interface EditableCost extends Omit<CostData, 'date' | 'cost'> {
  date: string;
  cost: string;
  isEditing: boolean;
}

export default function History() {
  const { costData, updateCost, removeCost } = useCostStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editableCost, setEditableCost] = useState<Partial<EditableCost> | null>(null);
  const [newCost, setNewCost] = useState<Omit<CostData, 'id' | 'date'>>({ 
    reason: 'Food', 
    cost: 0,
    note: ''
  });

  const startEditing = (cost: CostData) => {
    setEditingId(cost.id);
    setEditableCost({
      ...cost,
      cost: cost.cost.toString(),
      isEditing: true
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditableCost(null);
  };

  const saveChanges = () => {
    if (!editableCost || !editingId) return;
    
    updateCost(editingId, {
      ...editableCost,
      cost: parseFloat(editableCost.cost as string) || 0,
    });
    
    cancelEditing();
  };

  const handleAddCost = () => {
    useCostStore.getState().addCost({
      ...newCost,
      cost: parseFloat(newCost.cost as unknown as string) || 0,
      reason: newCost.reason as ReasonType
    });
    
    // Reset form
    setNewCost({ 
      reason: 'Food', 
      cost: 0,
      note: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableCost) return;
    const { name, value } = e.target;
    setEditableCost({ ...editableCost, [name]: value });
  };

  const handleNewCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCost(prev => ({ ...prev, [name]: value }));
  };

  const handleReasonChange = (value: string) => {
    if (!editableCost) return;
    setEditableCost({ ...editableCost, reason: value as ReasonType });
  };

  const handleNewReasonChange = (value: string) => {
    setNewCost(prev => ({ ...prev, reason: value as ReasonType }));
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Expense History</h1>
        
        {/* Add New Expense */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">Add New Expense</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select 
                value={newCost.reason} 
                onValueChange={handleNewReasonChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {['Food', 'Transport', 'Household', 'Entertainment', 'Education', 'Health', 'Other'].map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="number"
              name="cost"
              value={newCost.cost}
              onChange={handleNewCostChange}
              placeholder="Amount"
              className="flex-1"
            />
            <Input
              name="note"
              value={newCost.note}
              onChange={handleNewCostChange}
              placeholder="Note (optional)"
              className="flex-1"
            />
            <Button 
              onClick={handleAddCost}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 font-semibold border-b dark:border-gray-700">
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-3">Note</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          {costData.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No expenses recorded yet.
            </div>
          ) : (
            [...costData].reverse().map((cost) => (
              <div 
                key={cost.id} 
                className="grid grid-cols-12 gap-4 p-4 items-center border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {editingId === cost.id && editableCost ? (
                  <>
                    <div className="col-span-3">
                      {format(new Date(cost.date), 'MMM d, yyyy')}
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={editableCost.reason} 
                        onValueChange={handleReasonChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Food', 'Transport', 'Household', 'Entertainment', 'Education', 'Health', 'Other'].map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        name="note"
                        value={editableCost.note || ''}
                        onChange={handleInputChange}
                        placeholder="Note (optional)"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        name="cost"
                        value={editableCost.cost}
                        onChange={handleInputChange}
                        className="text-right"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={saveChanges}
                        className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={cancelEditing}
                        className="text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-3 text-sm text-gray-600 dark:text-gray-300">
                      {format(new Date(cost.date), 'MMM d, yyyy')}
                    </div>
                    <div className="col-span-2 font-medium">
                      {cost.reason}
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 truncate">
                      {cost.note || '-'}
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      ${parseFloat(cost.cost.toString()).toFixed(2)}
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startEditing(cost)}
                        className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeCost(cost.id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
