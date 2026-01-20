import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LoyaltyProgram = ({ loyaltyData }) => {
  const getTierColor = (tier) => {
    switch (tier) {
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'platinum': return 'Crown';
      case 'gold': return 'Award';
      case 'silver': return 'Medal';
      default: return 'Star';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="Gift" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium">iSafari Rewards</h3>
            <p className="text-sm text-muted-foreground">Your loyalty program status</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(loyaltyData?.currentTier)}`}>
          <Icon name={getTierIcon(loyaltyData?.currentTier)} size={16} className="inline mr-1" />
          {loyaltyData?.currentTier} Member
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Points Balance</span>
              <span className="text-2xl font-bold text-foreground">{loyaltyData?.points?.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="TrendingUp" size={12} />
              <span>+{loyaltyData?.pointsEarned} earned this month</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Next Tier Progress</span>
              <span className="text-sm font-medium text-foreground">
                {loyaltyData?.progressToNext}/{loyaltyData?.nextTierRequirement}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${(loyaltyData?.progressToNext / loyaltyData?.nextTierRequirement) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loyaltyData?.nextTierRequirement - loyaltyData?.progressToNext} points to {loyaltyData?.nextTier}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3">Active Benefits</h4>
            <div className="space-y-2">
              {loyaltyData?.benefits?.map((benefit, index) => (
                <div key={`benefit-${benefit.substring(0, 20) || index}`} className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-success" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-6">
        <h4 className="font-medium text-foreground mb-4">Available Rewards</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loyaltyData?.availableRewards?.map((reward) => (
            <div key={reward?.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={reward?.icon} size={16} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{reward?.points} pts</span>
              </div>
              
              <h5 className="font-medium text-foreground mb-1">{reward?.title}</h5>
              <p className="text-xs text-muted-foreground mb-3">{reward?.description}</p>
              
              <Button 
                variant={reward?.canRedeem ? "default" : "outline"} 
                size="sm" 
                className="w-full"
                disabled={!reward?.canRedeem}
              >
                {reward?.canRedeem ? 'Redeem' : 'Insufficient Points'}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Calendar" size={20} className="text-primary" />
            <div>
              <h4 className="font-medium text-foreground">Annual Traveler Event</h4>
              <p className="text-sm text-muted-foreground">Exclusive access for Gold+ members</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert('Premium membership details will be implemented');
          }}>
            <Icon name="ExternalLink" size={16} />
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;