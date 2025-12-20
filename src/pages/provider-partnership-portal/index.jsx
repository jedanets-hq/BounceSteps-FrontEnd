import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import DebugLogger from '../../components/DebugLogger';
import PartnershipStats from './components/PartnershipStats';
import OnboardingProgress from './components/OnboardingProgress';
import PartnerDashboard from './components/PartnerDashboard';
import ExperienceBuilder from './components/ExperienceBuilder';
import QualityAssurance from './components/QualityAssurance';
import TrainingResources from './components/TrainingResources';

const ProviderPartnershipPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Force re-render when activeTab changes
  const handleTabChange = (tabId) => {
    console.log('Changing tab to:', tabId);
    setActiveTab(tabId);
  };
  const [isOnboarding, setIsOnboarding] = useState(false);

  const navigationTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: 'BarChart3' },
    { id: 'experiences', name: 'Experience Builder', icon: 'Package' },
    { id: 'quality', name: 'Quality Assurance', icon: 'Award' },
    { id: 'training', name: 'Training', icon: 'GraduationCap' },
    { id: 'analytics', name: 'Analytics', icon: 'TrendingUp' },
    { id: 'profile', name: 'My Profile', icon: 'User' },
    { id: 'support', name: 'Support', icon: 'MessageCircle' }
  ];

  const partnerInfo = {
    name: "Safari Adventures Kenya",
    type: "Tour Operator",
    location: "Nairobi, Kenya",
    joinDate: "March 2024",
    status: "Verified Partner",
    rating: 4.8,
    totalBookings: 158
  };



  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'Sarah Johnson requested Maasai Village Experience for Jan 15',
      time: '2 hours ago',
      urgent: true
    },
    {
      id: 2,
      type: 'review',
      title: 'New Review Received',
      message: 'Michael Chen left a 5-star review for your safari tour',
      time: '5 hours ago',
      urgent: false
    },
    {
      id: 3,
      type: 'system',
      title: 'Training Module Available',
      message: 'New sustainability training module is now available',
      time: '1 day ago',
      urgent: false
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PartnerDashboard />;
      case 'experiences':
        return <ExperienceBuilder />;
      case 'quality':
        return <QualityAssurance />;
      case 'training':
        return <TrainingResources />;
      case 'analytics':
        return (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground mb-4">Detailed performance metrics and insights coming soon</p>
            <Button variant="outline" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert('Requesting early access...');
            }}>
              Request Early Access
            </Button>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">My Profile & Business Settings</h2>
              <Button variant="outline" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Exporting business profile...');
              }}>
                <Icon name="Download" size={16} />
                Export Profile
              </Button>
            </div>
            
            {/* Business Profile Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Business Information</h3>
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Building" size={32} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                      <p className="text-foreground">{partnerInfo?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                      <p className="text-foreground">{partnerInfo?.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="text-foreground">{partnerInfo?.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                      <p className="text-foreground">{partnerInfo?.joinDate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Rating</label>
                      <p className="text-foreground">{partnerInfo?.rating} stars</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Bookings</label>
                      <p className="text-foreground">{partnerInfo?.totalBookings}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-6">
                    <Button variant="outline" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      alert('Edit profile functionality coming soon!');
                    }}>
                      <Icon name="Edit" size={16} />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Business Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive booking and review notifications</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Auto-Accept Bookings</h4>
                    <p className="text-sm text-muted-foreground">Automatically accept qualifying bookings</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Payment Settings</h4>
                    <p className="text-sm text-muted-foreground">Manage payment methods and preferences</p>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Partner Support</h3>
            <p className="text-muted-foreground mb-4">Get help from our dedicated partner success team</p>
            <div className="flex items-center justify-center space-x-4">
              <Button variant="default" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Starting chat with support...');
              }}>
                <Icon name="MessageCircle" size={16} />
                Start Chat
              </Button>
              <Button variant="outline" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Scheduling call with support...');
              }}>
                <Icon name="Phone" size={16} />
                Schedule Call
              </Button>
            </div>
          </div>
        );
      default:
        return <PartnerDashboard />;
    }
  };

  return (
    <>
      <DebugLogger message="Provider Portal Active Tab" data={activeTab} />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Partner Header */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Building" size={32} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-foreground">{partnerInfo?.name}</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success">
                      <Icon name="CheckCircle" size={14} className="mr-1" />
                      {partnerInfo?.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Icon name="MapPin" size={14} />
                      <span>{partnerInfo?.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} />
                      <span>Joined {partnerInfo?.joinDate}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-warning fill-current" />
                      <span>{partnerInfo?.rating} rating</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="Users" size={14} />
                      <span>{partnerInfo?.totalBookings} bookings</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  alert('Opening settings...');
                }}>
                  <Icon name="Settings" size={16} />
                  Settings
                </Button>
                <Button onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('New Experience button clicked');
                  setActiveTab('experiences');
                  alert('Switching to Experience Builder...');
                }}>
                  <Icon name="Plus" size={16} />
                  New Experience
                </Button>
              </div>
            </div>
          </div>

          {/* Show onboarding if not completed */}
          {isOnboarding && (
            <div className="mb-8">
              <OnboardingProgress />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Stats Overview */}
              <PartnershipStats />

              {/* Navigation Tabs */}
              <div className="bg-card border border-border rounded-lg">
                <div className="border-b border-border">
                  <nav className="flex space-x-1 p-1">
                    {navigationTabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTabChange(tab?.id);
                        }}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon name={tab?.icon} size={16} />
                        <span className="hidden sm:inline">{tab?.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                <div className="p-6">
                  {renderTabContent()}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Notifications */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                  <Button variant="ghost" size="sm">
                    <Icon name="MoreHorizontal" size={16} />
                  </Button>
                </div>
                <div className="space-y-4">
                  {notifications?.map((notification) => (
                    <div key={notification?.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${notification?.urgent ? 'bg-error/10' : 'bg-primary/10'}`}>
                        <Icon 
                          name={notification?.type === 'booking' ? 'Calendar' : notification?.type === 'review' ? 'Star' : 'Bell'} 
                          size={16} 
                          className={notification?.urgent ? 'text-error' : 'text-primary'} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">{notification?.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification?.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification?.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" fullWidth className="mt-4" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Create modal overlay
                  const modalOverlay = document.createElement('div');
                  modalOverlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  `;
                  
                  // Create modal content
                  const modalContent = document.createElement('div');
                  modalContent.style.cssText = `
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    max-width: 700px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                  `;
                  
                  modalContent.innerHTML = `
                    <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                      <h1 style="color: #1f2937; font-size: 28px; font-weight: 600; margin: 0 0 8px 0;">🔔 All Notifications</h1>
                      <p style="color: #6b7280; font-size: 16px; margin: 0;">Stay updated with your partnership activities</p>
                    </div>
                    
                    <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #dc2626; background: #fef2f2;">
                      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <h3 style="font-weight: 600; color: #374151; margin: 0;">New Booking Request</h3>
                        <span style="font-size: 12px; color: #6b7280;">2 hours ago</span>
                      </div>
                      <p style="color: #4b5563; margin: 0; line-height: 1.5;">Sarah Johnson requested Maasai Village Experience for Jan 15. Please review and respond within 24 hours.</p>
                      <button style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-top: 10px;" onclick="this.style.background='#dcfce7'; this.textContent='✓ Marked as Read';">Mark as Read</button>
                    </div>
                    
                    <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #16a34a; background: #f0fdf4;">
                      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <h3 style="font-weight: 600; color: #374151; margin: 0;">New Review Received</h3>
                        <span style="font-size: 12px; color: #6b7280;">4 hours ago</span>
                      </div>
                      <p style="color: #4b5563; margin: 0; line-height: 1.5;">Michael Chen left a 5-star review: "Amazing safari experience! Highly recommend this provider."</p>
                      <button style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-top: 10px;" onclick="this.style.background='#dcfce7'; this.textContent='✓ Marked as Read';">Mark as Read</button>
                    </div>
                    
                    <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #2563eb; background: #eff6ff;">
                      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <h3 style="font-weight: 600; color: #374151; margin: 0;">Training Module Available</h3>
                        <span style="font-size: 12px; color: #6b7280;">1 day ago</span>
                      </div>
                      <p style="color: #4b5563; margin: 0; line-height: 1.5;">New sustainability training module is now available. Complete it to earn your eco-tourism certification.</p>
                      <button style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-top: 10px;" onclick="this.style.background='#dcfce7'; this.textContent='✓ Marked as Read';">Mark as Read</button>
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: center; margin-top: 30px;">
                      <button style="padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; background: #3b82f6; color: white;" onclick="document.querySelectorAll('button').forEach(btn => { if (btn.textContent === 'Mark as Read') { btn.style.background='#dcfce7'; btn.textContent='✓ Marked as Read'; } }); alert('✅ All notifications marked as read!');">Mark All Read</button>
                      <button style="padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; background: #6b7280; color: white;" onclick="document.body.removeChild(document.querySelector('[style*=\"z-index: 9999\"]'));">Close</button>
                    </div>
                  `;
                  
                  modalOverlay.appendChild(modalContent);
                  document.body.appendChild(modalOverlay);
                  
                  // Close modal when clicking overlay
                  modalOverlay.addEventListener('click', (event) => {
                    if (event.target === modalOverlay) {
                      document.body.removeChild(modalOverlay);
                    }
                  });
                }}>
                  View All Notifications
                </Button>
              </div>

              {/* Help & Resources */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Help & Resources</h3>
                <div className="space-y-3">
                  <button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Create modal overlay
                    const modalOverlay = document.createElement('div');
                    modalOverlay.style.cssText = `
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: rgba(0, 0, 0, 0.5);
                      z-index: 9999;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    `;
                    
                    const modalContent = document.createElement('div');
                    modalContent.style.cssText = `
                      background: white;
                      padding: 40px;
                      border-radius: 12px;
                      max-width: 800px;
                      width: 90%;
                      max-height: 80vh;
                      overflow-y: auto;
                      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    `;
                    
                    modalContent.innerHTML = `
                      <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="color: #1f2937; font-size: 28px; font-weight: 600; margin: 0 0 8px 0;">📖 Partner Guide</h1>
                        <p style="color: #6b7280; font-size: 16px; margin: 0;">Complete guide to maximize your partnership success</p>
                      </div>
                      
                      <div style="margin-bottom: 30px;">
                        <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">Getting Started</h2>
                        <ul style="line-height: 1.8; color: #4b5563; list-style-type: disc; padding-left: 20px;">
                          <li>Complete your business profile with accurate information</li>
                          <li>Upload high-quality photos of your services</li>
                          <li>Set competitive pricing for your offerings</li>
                          <li>Verify your account for increased trust</li>
                        </ul>
                      </div>
                      
                      <div style="margin-bottom: 30px;">
                        <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">Best Practices</h2>
                        <ul style="line-height: 1.8; color: #4b5563; list-style-type: disc; padding-left: 20px;">
                          <li>Respond to booking requests within 2 hours</li>
                          <li>Maintain a 4.5+ star rating for better visibility</li>
                          <li>Update availability calendar regularly</li>
                          <li>Provide detailed service descriptions</li>
                          <li>Offer competitive pricing during peak seasons</li>
                        </ul>
                      </div>
                      
                      <div style="margin-bottom: 30px;">
                        <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">Payment & Earnings</h2>
                        <ul style="line-height: 1.8; color: #4b5563; list-style-type: disc; padding-left: 20px;">
                          <li>Payments are processed within 24-48 hours</li>
                          <li>Platform fee: 8% per successful booking</li>
                          <li>Weekly payouts to your registered account</li>
                          <li>Track earnings in your dashboard analytics</li>
                        </ul>
                      </div>
                      
                      <button style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600;" onclick="document.body.removeChild(document.querySelector('[style*=\"z-index: 9999\"]'));">Close Guide</button>
                    `;
                    
                    modalOverlay.appendChild(modalContent);
                    document.body.appendChild(modalOverlay);
                    
                    modalOverlay.addEventListener('click', (event) => {
                      if (event.target === modalOverlay) {
                        document.body.removeChild(modalOverlay);
                      }
                    });
                  }} className="flex items-center space-x-3 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left">
                    <Icon name="FileText" size={16} />
                    <span>Partner Guide</span>
                  </button>
                  <button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Create modal overlay
                    const modalOverlay = document.createElement('div');
                    modalOverlay.style.cssText = `
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: rgba(0, 0, 0, 0.5);
                      z-index: 9999;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    `;
                    
                    const modalContent = document.createElement('div');
                    modalContent.style.cssText = `
                      background: white;
                      padding: 40px;
                      border-radius: 12px;
                      max-width: 900px;
                      width: 90%;
                      max-height: 80vh;
                      overflow-y: auto;
                      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    `;
                    
                    modalContent.innerHTML = `
                      <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="color: #1f2937; font-size: 28px; font-weight: 600; margin: 0 0 8px 0;">🎥 Video Tutorials</h1>
                        <p style="color: #6b7280; font-size: 16px; margin: 0;">Learn from comprehensive video guides</p>
                      </div>
                      
                      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                          <div style="width: 100%; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; color: white; font-size: 24px;">
                            ▶️
                          </div>
                          <h3 style="margin: 0 0 10px 0; color: #374151;">Setting Up Your Profile</h3>
                          <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Learn how to create an attractive business profile that converts visitors to customers.</p>
                          <button onclick="alert('Playing video: Setting Up Your Profile');" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Watch Now</button>
                        </div>
                        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                          <div style="width: 100%; height: 150px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; color: white; font-size: 24px;">
                            ▶️
                          </div>
                          <h3 style="margin: 0 0 10px 0; color: #374151;">Managing Bookings</h3>
                          <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Master the booking system to maximize your revenue and customer satisfaction.</p>
                          <button onclick="alert('Playing video: Managing Bookings');" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Watch Now</button>
                        </div>
                        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                          <div style="width: 100%; height: 150px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; color: white; font-size: 24px;">
                            ▶️
                          </div>
                          <h3 style="margin: 0 0 10px 0; color: #374151;">Photography Tips</h3>
                          <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Take stunning photos that showcase your services and attract more bookings.</p>
                          <button onclick="alert('Playing video: Photography Tips');" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Watch Now</button>
                        </div>
                        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                          <div style="width: 100%; height: 150px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; color: white; font-size: 24px;">
                            ▶️
                          </div>
                          <h3 style="margin: 0 0 10px 0; color: #374151;">Customer Communication</h3>
                          <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Best practices for communicating with customers and handling inquiries.</p>
                          <button onclick="alert('Playing video: Customer Communication');" style="background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Watch Now</button>
                        </div>
                      </div>
                      
                      <button style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; width: 100%; margin-top: 20px; font-weight: 600;" onclick="document.body.removeChild(document.querySelector('[style*=\"z-index: 9999\"]'));">Close Tutorials</button>
                    `;
                    
                    modalOverlay.appendChild(modalContent);
                    document.body.appendChild(modalOverlay);
                    
                    modalOverlay.addEventListener('click', (event) => {
                      if (event.target === modalOverlay) {
                        document.body.removeChild(modalOverlay);
                      }
                    });
                  }} className="flex items-center space-x-3 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left">
                    <Icon name="Video" size={16} />
                    <span>Video Tutorials</span>
                  </button>
                  <button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Create modal overlay
                    const modalOverlay = document.createElement('div');
                    modalOverlay.style.cssText = `
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: rgba(0, 0, 0, 0.5);
                      z-index: 9999;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    `;
                    
                    const modalContent = document.createElement('div');
                    modalContent.style.cssText = `
                      background: white;
                      padding: 40px;
                      border-radius: 12px;
                      max-width: 800px;
                      width: 90%;
                      max-height: 80vh;
                      overflow-y: auto;
                      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    `;
                    
                    modalContent.innerHTML = `
                      <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="color: #1f2937; font-size: 28px; font-weight: 600; margin: 0 0 8px 0;">👥 Partner Community</h1>
                        <p style="color: #6b7280; font-size: 16px; margin: 0;">Connect with fellow partners and share experiences</p>
                      </div>
                      
                      <div style="margin-bottom: 30px;">
                        <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">Recent Discussions</h2>
                        <div style="space-y: 15px;">
                          <div style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px;">
                            <h3 style="margin: 0 0 5px 0; color: #374151;">💡 Tips for Peak Season Pricing</h3>
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Discussion about optimal pricing strategies during high-demand periods...</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <small style="color: #9ca3af;">Started by John Safari • 23 replies</small>
                              <button onclick="alert('Joining discussion...');" style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 5px 15px; border-radius: 4px; cursor: pointer;">Join</button>
                            </div>
                          </div>
                          <div style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px;">
                            <h3 style="margin: 0 0 5px 0; color: #374151;">📸 Photo Contest: Best Safari Shots</h3>
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Share your best safari photos and win marketing credits...</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <small style="color: #9ca3af;">Started by iSafari Team • 45 replies</small>
                              <button onclick="alert('Joining contest...');" style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 5px 15px; border-radius: 4px; cursor: pointer;">Participate</button>
                            </div>
                          </div>
                          <div style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px;">
                            <h3 style="margin: 0 0 5px 0; color: #374151;">🤝 Partner Collaboration Opportunities</h3>
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Connect with other partners for joint packages and referrals...</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <small style="color: #9ca3af;">Started by Maria Tours • 12 replies</small>
                              <button onclick="alert('Joining discussion...');" style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 5px 15px; border-radius: 4px; cursor: pointer;">Join</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div style="text-align: center;">
                        <button onclick="alert('Creating new discussion...');" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Start Discussion</button>
                        <button onclick="document.body.removeChild(document.querySelector('[style*=\"z-index: 9999\"]'));" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer;">Close Community</button>
                      </div>
                    `;
                    
                    modalOverlay.appendChild(modalContent);
                    document.body.appendChild(modalOverlay);
                    
                    modalOverlay.addEventListener('click', (event) => {
                      if (event.target === modalOverlay) {
                        document.body.removeChild(modalOverlay);
                      }
                    });
                  }} className="flex items-center space-x-3 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left">
                    <Icon name="Users" size={16} />
                    <span>Partner Community</span>
                  </button>
                  <button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Create modal overlay
                    const modalOverlay = document.createElement('div');
                    modalOverlay.style.cssText = `
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: rgba(0, 0, 0, 0.5);
                      z-index: 9999;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    `;
                    
                    const modalContent = document.createElement('div');
                    modalContent.style.cssText = `
                      background: white;
                      padding: 40px;
                      border-radius: 12px;
                      max-width: 600px;
                      width: 90%;
                      max-height: 80vh;
                      overflow-y: auto;
                      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    `;
                    
                    modalContent.innerHTML = `
                      <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="color: #1f2937; font-size: 28px; font-weight: 600; margin: 0 0 8px 0;">💬 Contact Support</h1>
                        <p style="color: #6b7280; font-size: 16px; margin: 0;">Get help from our support team</p>
                      </div>
                      
                      <form>
                        <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Subject</label>
                          <select style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 5px; background: white;">
                            <option>General Inquiry</option>
                            <option>Technical Issue</option>
                            <option>Billing Question</option>
                            <option>Account Verification</option>
                            <option>Partnership Opportunity</option>
                          </select>
                        </div>
                        <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Priority</label>
                          <select style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 5px; background: white;">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Urgent</option>
                          </select>
                        </div>
                        <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Message</label>
                          <textarea rows="6" placeholder="Describe your issue or question in detail..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 5px; resize: vertical; background: white;"></textarea>
                        </div>
                        <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Attach Files (Optional)</label>
                          <input type="file" multiple style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 5px; background: white;">
                        </div>
                        <button type="button" onclick="alert('Support ticket submitted successfully! We will respond within 24 hours.'); document.body.removeChild(document.querySelector('[style*=\"z-index: 9999\"]'));" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; width: 100%; margin-bottom: 10px; font-weight: 600;">Submit Ticket</button>
                        <button type="button" onclick="document.body.removeChild(document.querySelector('[style*=\"z-index: 9999\"]'));" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600;">Cancel</button>
                      </form>
                    `;
                    
                    modalOverlay.appendChild(modalContent);
                    document.body.appendChild(modalOverlay);
                    
                    modalOverlay.addEventListener('click', (event) => {
                      if (event.target === modalOverlay) {
                        document.body.removeChild(modalOverlay);
                      }
                    });
                  }} className="flex items-center space-x-3 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left">
                    <Icon name="MessageCircle" size={16} />
                    <span>Contact Support</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderPartnershipPortal;