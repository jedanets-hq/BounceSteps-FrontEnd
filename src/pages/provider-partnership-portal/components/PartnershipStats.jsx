import React from 'react';
import Icon from '../../../components/AppIcon';

const PartnershipStats = () => {
  const stats = [
    {
      id: 1,
      title: "Active Partners",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: "Users",
      color: "text-success"
    },
    {
      id: 2,
      title: "Monthly Revenue",
      value: "$1.2M",
      change: "+8.3%",
      trend: "up",
      icon: "DollarSign",
      color: "text-primary"
    },
    {
      id: 3,
      title: "Avg Rating",
      value: "4.8",
      change: "+0.2",
      trend: "up",
      icon: "Star",
      color: "text-warning"
    },
    {
      id: 4,
      title: "Bookings",
      value: "15,234",
      change: "+18.7%",
      trend: "up",
      icon: "Calendar",
      color: "text-secondary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats?.map((stat) => (
        <div key={stat?.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-muted ${stat?.color}`}>
              <Icon name={stat?.icon} size={24} />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${stat?.color}`}>
              <Icon name={stat?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={16} />
              <span>{stat?.change}</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stat?.value}</h3>
            <p className="text-muted-foreground text-sm">{stat?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartnershipStats;