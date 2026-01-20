import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmergencySupport = ({ emergencyData }) => {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-error" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium">Emergency Support</h3>
            <p className="text-sm text-muted-foreground">24/7 assistance and safety resources</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-success font-medium">Online</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="bg-error/5 border border-error/20 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Icon name="AlertTriangle" size={20} className="text-error" />
              <h4 className="font-medium text-error">Emergency Hotline</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">24/7 immediate assistance for urgent situations</p>
            <Button variant="destructive" className="w-full">
              <Icon name="Phone" size={16} />
              Call Now: {emergencyData?.hotline}
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Quick Actions</h4>
            {emergencyData?.quickActions?.map((action) => (
              <Button 
                key={action?.id}
                variant="outline" 
                className="w-full justify-start"
              >
                <Icon name={action?.icon} size={16} />
                {action?.title}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3">Current Location Status</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="text-sm font-medium text-foreground">{emergencyData?.currentLocation}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Safety Level</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${emergencyData?.safetyLevel === 'safe' ? 'bg-success' : 'bg-warning'}`}></div>
                  <span className="text-sm font-medium text-foreground capitalize">{emergencyData?.safetyLevel}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm text-muted-foreground">{emergencyData?.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Emergency Contacts</h4>
            <div className="space-y-2">
              {emergencyData?.contacts?.map((contact) => (
                <div 
                  key={contact?.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name={contact?.icon} size={16} className="text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground">{contact?.name}</h5>
                      <p className="text-sm text-muted-foreground">{contact?.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Icon name="Phone" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="MessageSquare" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-6">
        <h4 className="font-medium text-foreground mb-4">Travel Insurance</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} className="text-success" />
                <span className="font-medium text-foreground">Active Policy</span>
              </div>
              <span className="text-sm text-success">Valid</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Policy Number</span>
                <span className="text-foreground font-mono">{emergencyData?.insurance?.policyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coverage</span>
                <span className="text-foreground">{emergencyData?.insurance?.coverage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="text-foreground">{emergencyData?.insurance?.expiryDate}</span>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="FileText" size={16} className="text-primary" />
              <span className="font-medium text-foreground">Claims Center</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">File and track insurance claims</p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Icon name="Plus" size={16} />
                File New Claim
              </Button>
              <Button variant="ghost" size="sm" className="w-full">
                <Icon name="Eye" size={16} />
                Track Existing Claims
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="MapPin" size={20} className="text-primary" />
            <div>
              <h4 className="font-medium text-foreground">Location Sharing</h4>
              <p className="text-sm text-muted-foreground">Share your location with trusted contacts</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Icon name="Share2" size={16} />
            Manage Sharing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmergencySupport;