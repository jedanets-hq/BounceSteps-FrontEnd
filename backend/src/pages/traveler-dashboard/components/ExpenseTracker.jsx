import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExpenseTracker = ({ expenses, onOpenExpenseTracker }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const periods = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'accommodation': return 'Building';
      case 'transportation': return 'Plane';
      case 'food': return 'Utensils';
      case 'activities': return 'MapPin';
      case 'shopping': return 'ShoppingBag';
      default: return 'DollarSign';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'accommodation': return 'text-blue-600 bg-blue-100';
      case 'transportation': return 'text-green-600 bg-green-100';
      case 'food': return 'text-orange-600 bg-orange-100';
      case 'activities': return 'text-purple-600 bg-purple-100';
      case 'shopping': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="PieChart" size={20} className="text-success" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium">Expense Tracker</h3>
            <p className="text-sm text-muted-foreground">Track and categorize your travel expenses</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e?.target?.value)}
            className="px-3 py-1 border border-border rounded-lg text-sm bg-background"
          >
            {currencies?.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} />
            Export
          </Button>
        </div>
      </div>
      <div className="flex space-x-2 mb-6">
        {periods?.map((period) => (
          <button
            key={period?.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedPeriod(period?.id);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedPeriod === period?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {period?.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-medium text-foreground mb-4">Expense Summary</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="text-xl font-bold text-foreground">${expenses?.total?.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Average per Trip</span>
              <span className="text-lg font-medium text-foreground">${expenses?.averagePerTrip?.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Budget Remaining</span>
              <span className={`text-lg font-medium ${expenses?.budgetRemaining > 0 ? 'text-success' : 'text-error'}`}>
                ${Math.abs(expenses?.budgetRemaining)?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-4">Category Breakdown</h4>
          <div className="space-y-3">
            {expenses?.categories?.map((category) => (
              <div key={category?.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getCategoryColor(category?.name)}`}>
                      <Icon name={getCategoryIcon(category?.name)} size={12} />
                    </div>
                    <span className="text-sm text-foreground capitalize">{category?.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">${category?.amount?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category?.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">Recent Transactions</h4>
          <Button variant="ghost" size="sm" onClick={onOpenExpenseTracker}>
            <Icon name="Plus" size={16} />
            Add Expense
          </Button>
        </div>
        
        <div className="space-y-3">
          {expenses?.recentTransactions?.map((transaction) => (
            <div key={transaction?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(transaction?.category)}`}>
                  <Icon name={getCategoryIcon(transaction?.category)} size={16} />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">{transaction?.description}</h5>
                  <p className="text-sm text-muted-foreground">{transaction?.date} • {transaction?.location}</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="font-medium text-foreground">${transaction?.amount}</span>
                <p className="text-xs text-muted-foreground">{transaction?.currency}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onOpenExpenseTracker}
          >
            <Icon name="Eye" size={16} />
            View All Transactions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;