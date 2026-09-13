import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface Budget {
  id: string;
  name: string;
  totalAmount: number;
  expenses: Expense[];
}

const Dashboard = () => {
  const { user, loading: authLoading, getAuthHeaders } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({ name: '', totalAmount: '' });
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [editBudgetData, setEditBudgetData] = useState({ id: '', name: '', totalAmount: '' });
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  const fetchBudgets = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch('/api/budgets', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }

      const data: Budget[] = await response.json();
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.name || !newBudget.totalAmount || !user) return;

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newBudget.name,
          totalAmount: parseFloat(newBudget.totalAmount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create budget');
      }

      setBudgets([data, ...budgets]);
      setNewBudget({ name: '', totalAmount: '' });
      setShowAddBudget(false);
    } catch (error: any) {
      console.error('Error creating budget:', error);
      alert(error.message || 'Failed to create budget');
    }
  };

  const handleEditBudget = async () => {
    if (!editBudgetData.id || !editBudgetData.name || !editBudgetData.totalAmount) return;

    try {
      const response = await fetch(`/api/budgets/${editBudgetData.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editBudgetData.name,
          totalAmount: parseFloat(editBudgetData.totalAmount),
        }),
      });

      const updated = await response.json();

      if (!response.ok) {
        throw new Error(updated.msg || 'Failed to update budget');
      }

      setBudgets(budgets.map((b) => (b.id === updated.id ? updated : b)));
      setShowEditBudget(false);
      setEditBudgetData({ id: '', name: '', totalAmount: '' });
    } catch (error: any) {
      console.error('Error updating budget:', error);
      alert(error.message || 'Failed to update budget');
    }
  };

  const handleAddExpense = async () => {
    if (!selectedBudget || !newExpense.category || !newExpense.amount) return;

    try {
      const response = await fetch(`/api/budgets/${selectedBudget.id}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          category: newExpense.category,
          amount: parseFloat(newExpense.amount),
          description: newExpense.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create expense');
      }

      // Backend returns { expense, budget }
      const updatedBudget = data.budget || {
        ...selectedBudget,
        expenses: [data.expense, ...selectedBudget.expenses],
      };

      setBudgets(budgets.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)));
      setNewExpense({ category: '', amount: '', description: '' });
      setShowAddExpense(false);
    } catch (error: any) {
      console.error('Error creating expense:', error);
      alert(error.message || 'Failed to create expense');
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Failed to delete budget');
      }

      setBudgets(budgets.filter((b) => b.id !== budgetId));
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      alert(error.message || 'Failed to delete budget');
    }
  };

  const calculateTotalExpenses = (expenses: Expense[] = []) => {
    return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
  };

  const calculateRemainingAmount = (budget: Budget) => {
    const totalExpenses = calculateTotalExpenses(budget.expenses);
    return budget.totalAmount - totalExpenses;
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Budgets</h1>
            {user?.name && <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddBudget(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Budget
          </motion.button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading budgets from MongoDB...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-medium text-gray-800 mb-2">No budgets yet</h3>
            <p className="text-gray-500 mb-6">Create your first budget to start tracking your spending with MongoDB!</p>
            <button
              onClick={() => setShowAddBudget(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <motion.div
                key={budget.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{budget.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        title="Edit Budget"
                        onClick={() => {
                          setEditBudgetData({
                            id: budget.id,
                            name: budget.name,
                            totalAmount: budget.totalAmount.toString(),
                          });
                          setShowEditBudget(true);
                        }}
                        className="text-purple-600 hover:text-purple-800 p-1"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        title="Delete Budget"
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Budget:</span>
                      <span className="font-medium">₹{budget.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Expenses:</span>
                      <span className="font-medium">₹{calculateTotalExpenses(budget.expenses).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Remaining:</span>
                      <span
                        className={`font-medium ${
                          calculateRemainingAmount(budget) < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        ₹{calculateRemainingAmount(budget).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSelectedBudget(budget);
                      setShowAddExpense(true);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors font-medium text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </button>

                  {budget.expenses && budget.expenses.length > 0 && (
                    <div className="mt-4 border-t pt-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Expenses</h4>
                      <div className="space-y-2">
                        {budget.expenses.slice(0, 3).map((expense) => (
                          <div
                            key={expense.id}
                            className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="font-medium text-gray-800">{expense.category}</p>
                              {expense.description && (
                                <p className="text-gray-500 text-xs">{expense.description}</p>
                              )}
                            </div>
                            <span className="font-medium text-gray-900">₹{expense.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Budget Modal */}
        {showAddBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Budget</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Monthly Groceries"
                    value={newBudget.name}
                    onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 10000"
                    value={newBudget.totalAmount}
                    onChange={(e) => setNewBudget({ ...newBudget, totalAmount: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddBudget(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBudget}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium text-sm"
                >
                  Save Budget
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Budget Modal */}
        {showEditBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Budget</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget Name</label>
                  <input
                    type="text"
                    required
                    value={editBudgetData.name}
                    onChange={(e) => setEditBudgetData({ ...editBudgetData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editBudgetData.totalAmount}
                    onChange={(e) => setEditBudgetData({ ...editBudgetData, totalAmount: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditBudget(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditBudget}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium text-sm"
                >
                  Update Budget
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showAddExpense && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            >
              <h2 className="text-xl font-bold mb-1 text-gray-900">Add Expense</h2>
              <p className="text-sm text-gray-500 mb-4">Adding expense to: <span className="font-semibold text-purple-600">{selectedBudget.name}</span></p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Food, Travel, Utilities"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 500"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Dinner with friends"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpense}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium text-sm"
                >
                  Add Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;