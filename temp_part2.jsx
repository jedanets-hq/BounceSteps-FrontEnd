      case 'documents':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">Travel Documents</h2>
              <Button variant="default" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Opening document upload...');
              }}>
                <Icon name="Upload" size={16} />
                Upload Document
              </Button>
            </div>
            <DocumentStorage documents={documents} onUploadDocuments={handleUploadDocuments} />
          </div>
        );

      case 'rewards':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">iSafari Rewards</h2>
              <Button variant="outline" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Opening rewards program details...');
              }}>
                <Icon name="ExternalLink" size={16} />
                Program Details
              </Button>
            </div>
            <LoyaltyProgram loyaltyData={loyaltyData} />
          </div>
        );

      case 'expenses':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">Expense Tracker</h2>
              <Button variant="default" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Opening expense tracker...');
              }}>
                <Icon name="Plus" size={16} />
                Add Expense
              </Button>
            </div>
            <ExpenseTracker expenses={expenseData} onOpenExpenseTracker={handleOpenExpenseTracker} />
          </div>
        );

      case 'support':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">Emergency Support</h2>
              <Button variant="destructive" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Connecting to emergency support: +1-800-ISAFARI');
              }}>
                <Icon name="Phone" size={16} />
                Emergency Call
              </Button>
            </div>
            <EmergencySupport emergencyData={emergencyData} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Header with Integrated Tabs */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/assets/images/isafari-logo.png" 
                alt="iSafari Global" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="flex items-center space-x-2" style={{display: 'none'}}>
                <div className="text-2xl font-bold text-blue-500">i</div>
                <div className="text-xl font-light text-gray-400">Safari</div>
                <div className="text-blue-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Tabs - Aligned with Header */}
            <nav className="hidden lg:flex items-center space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span className="whitespace-nowrap">{tab.name}</span>
                </button>
              ))}
            </nav>

            {/* Right Side - Mobile Menu Button Only */}
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Icon name={showMobileMenu ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-sm">
              <div className="px-4 py-3 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveTab(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
                    <span>{tab.name}</span>
                  </button>
                ))}
                
                {/* Mobile Sign Out */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm('Are you sure you want to sign out?')) {
                      logout();
                    }
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 mt-2 border-t border-border pt-3"
                >
                  <Icon name="LogOut" size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        {/* Logout Button */}
        
        {/* AI Assistant Button */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAIChat(true);
          }}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          title="AI Travel Assistant"
        >
          <Icon name="Bot" size={24} />
        </Button>
        
        {/* Notifications Button */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowNotifications(true);
          }}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg relative"
          title="View Notifications"
        >
          <Icon name="Bell" size={24} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>
        
        {/* Messages Button */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedProvider({ id: 1, name: 'Safari Lodge Provider' });
            setShowProviderChat(true);
          }}
          className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg relative"
          title="Messages with Providers"
        >
          <Icon name="MessageCircle" size={24} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            2
          </span>
        </Button>
      </div>

      {/* Chat and Notification Modals */}
      <ChatSystem
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        chatType="ai"
      />
      
      <ChatSystem
        isOpen={showProviderChat}
        onClose={() => setShowProviderChat(false)}
        chatType="customer"
        recipientId={selectedProvider?.id}
        recipientName={selectedProvider?.name}
      />
      
      <NotificationSystem
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userType="traveler"
      />

      {/* Enhanced Modal Components */}
      <TripDetailsModal
        trip={selectedTrip}
        isOpen={showTripDetails}
        onClose={() => setShowTripDetails(false)}
      />

      <DocumentUploadModal
        isOpen={showDocumentUpload}
        onClose={() => setShowDocumentUpload(false)}
      />

      <ExpenseTrackerModal
        isOpen={showExpenseTracker}
        onClose={() => setShowExpenseTracker(false)}
      />
    </div>
  );
};

export default TravelerDashboard;