import React, { useState } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';

const ExpenseTrackerModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Accommodation', amount: 150, description: 'Hotel booking - Night 1', date: '2024-03-15', trip: 'Santorini Trip' },
    { id: 2, category: 'Transportation', amount: 45, description: 'Airport taxi', date: '2024-03-15', trip: 'Santorini Trip' },
    { id: 3, category: 'Food', amount: 35, description: 'Dinner at local restaurant', date: '2024-03-15', trip: 'Santorini Trip' },
    { id: 4, category: 'Activities', amount: 80, description: 'Sunset cruise tour', date: '2024-03-16', trip: 'Santorini Trip' },
    { id: 5, category: 'Shopping', amount: 25, description: 'Souvenirs', date: '2024-03-16', trip: 'Santorini Trip' }
  ]);

  const categories = [
    { id: 'accommodation', name: 'Accommodation', icon: 'Home', color: 'bg-blue-500' },
    { id: 'transportation', name: 'Transportation', icon: 'Car', color: 'bg-green-500' },
    { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: 'bg-yellow-500' },
    { id: 'activities', name: 'Activities', icon: 'Camera', color: 'bg-purple-500' },
    { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'bg-pink-500' },
    { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-500' }
  ];

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description) {
      alert('Please fill all required fields');
      return;
    }

    const expense = {
      id: Date.now(),
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      trip: 'Current Trip'
    };

    setExpenses(prev => [expense, ...prev]);
    setNewExpense({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowAddExpense(false);
  };

  const getTotalByCategory = () => {
    const totals = {};
    expenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'PieChart' },
    { id: 'expenses', name: 'All Expenses', icon: 'List' },
    { id: 'analytics', name: 'Analytics', icon: 'BarChart' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        const categoryTotals = getTotalByCategory();
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon name="DollarSign" size={24} className="text-primary" />
                  <div>
                    <p className="text-2xl font-bold">${getTotalExpenses()}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-100 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon name="TrendingUp" size={24} className="text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{expenses.length}</p>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-100 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon name="Calendar" size={24} className="text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">${(getTotalExpenses() / 7).toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground">Daily Average</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {categories.map((category) => {
                  const total = categoryTotals[category.name] || 0;
                  const percentage = total > 0 ? (total / getTotalExpenses() * 100).toFixed(1) : 0;
                  return (
                    <div key={category.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                        <Icon name={category.icon} size={16} className="text-muted-foreground" />
                        <span>{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${total}</p>
                        <p className="text-sm text-muted-foreground">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Expenses</h3>
              <Button onClick={() => setShowAddExpense(true)}>
                <Icon name="Plus" size={16} />
                Add Expense
              </Button>
            </div>

            {/* Add Expense Form */}
            {showAddExpense && (
              <div className="border border-border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-3">Add New Expense</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount ($)</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      placeholder="What did you spend on?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddExpense(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddExpense}>
                    Add Expense
                  </Button>
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      categories.find(cat => cat.name === expense.category)?.color || 'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{expense.category} • {expense.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${expense.amount}</p>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Spending Analytics</h3>
            
            {/* Monthly Trend */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-4">Monthly Spending Trend</h4>
              <div className="space-y-3">
                {['January', 'February', 'March'].map((month, index) => {
                  const amount = [450, 380, 335][index];
                  const percentage = (amount / 450 * 100);
                  return (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-sm">{month}</span>
                      <div className="flex items-center space-x-3 flex-1 mx-4">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">${amount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Budget Comparison */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-4">Budget vs Actual</h4>
              <div className="space-y-4">
                {[
                  { category: 'Accommodation', budget: 200, actual: 150 },
                  { category: 'Food', budget: 100, actual: 135 },
                  { category: 'Transportation', budget: 80, actual: 45 },
                  { category: 'Activities', budget: 120, actual: 80 }
                ].map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span>${item.actual} / ${item.budget}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.actual > item.budget ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(item.actual / item.budget * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Expense Tracker</h2>
            <p className="text-muted-foreground">Track and manage your travel expenses</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTrackerModal;
