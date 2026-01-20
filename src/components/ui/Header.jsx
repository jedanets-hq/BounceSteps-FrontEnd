import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();

  // Navigation items for travelers
  const travelerNavItems = [
    { name: 'Home', href: '/', icon: 'Home', id: 'traveler-home', requiresAuth: false },
    { name: 'Destinations', href: '/destination-discovery', icon: 'MapPin', id: 'traveler-destinations', requiresAuth: true },
    { name: 'Plan Journey', href: '/journey-planner', icon: 'Map', id: 'traveler-journey', requiresAuth: true },
    { name: 'Dashboard', href: '/traveler-dashboard', icon: 'LayoutDashboard', id: 'traveler-dashboard', requiresAuth: true }
  ];

  // Navigation items for service providers
  const getProviderNavigation = () => [
    { name: 'Home', path: '/', icon: 'Home', id: 'nav-home', requiresAuth: false },
    { name: 'Dashboard', path: '/service-provider-dashboard', icon: 'LayoutDashboard', id: 'nav-dashboard', requiresAuth: true },
    { name: 'My Services', path: '/service-provider-dashboard', icon: 'Package', id: 'nav-services', requiresAuth: true },
    { name: 'Bookings', path: '/service-provider-dashboard', icon: 'Calendar', id: 'nav-bookings', requiresAuth: true }
  ];

  const navigationItems = user?.userType === 'service_provider' ? getProviderNavigation() : travelerNavItems;

  // Handle navigation click
  const handleNavClick = (e, item) => {
    e.preventDefault();
    
    // If requires auth and user not logged in, redirect to login
    if (item.requiresAuth && !user) {
      navigate('/login');
      return;
    }
    
    // Navigate to the path
    navigate(item.path || item.href);
  };

  const getTravelerMoreMenu = () => [
    { name: 'About iSafari Global', path: '/about', icon: 'Info', id: 'traveler-more-about' },
  ];

  const getProviderMoreMenu = () => [
    { name: 'Analytics', path: '/dashboard', icon: 'BarChart', id: 'more-analytics' },
    { name: 'Earnings', path: '/dashboard', icon: 'DollarSign', id: 'more-earnings' },
    { name: 'About iSafari Global', path: '/about', icon: 'Info', id: 'more-about' },
  ];

  const moreMenuItems = user?.userType === 'provider' ? getProviderMoreMenu() : getTravelerMoreMenu();

  const isActivePath = (path) => location?.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/assets/images/isafari-logo.png" 
              alt="iSafari Global" 
              className="h-10 w-auto"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
              onError={(e) => {
                // Fallback to text logo if image fails
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <button
                key={item?.id || item?.path || item?.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath(item?.path || item?.href)
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item?.icon && <Icon name={item?.icon} size={16} />}
                <span>{item?.name}</span>
              </button>
            ))}

            {/* More Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200">
                <Icon name="MoreHorizontal" size={16} />
                <span>More</span>
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-warm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <div className="py-2">
                  {moreMenuItems?.map((item) => (
                    <button
                      key={item?.id || item?.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item?.path);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 ${
                        isActivePath(item?.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-popover-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={item?.icon} size={16} />
                      <span>{item?.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* CTA Button and Theme Toggle */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <Icon name={isDark ? 'Sun' : 'Moon'} size={20} />
            </button>
            
            {isAuthenticated && (
              <>
                {/* Cart Button for logged in users */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                  title="Shopping Cart"
                >
                  <Icon name="ShoppingCart" size={20} />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  )}
                </button>
                
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden xl:inline">{user?.firstName}</span>
                    <Icon name="ChevronDown" size={16} />
                  </button>
                  
                  <div className="absolute top-full right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-warm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <p className="text-xs text-primary mt-1">
                          {user?.userType === 'traveler' ? '🧳 Traveler' : '🏢 Service Provider'}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                      >
                        <Icon name="User" size={16} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to={user?.userType === 'traveler' ? '/traveler-dashboard' : '/service-provider-dashboard'}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                      >
                        <Icon name="LayoutDashboard" size={16} />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Icon name="LogOut" size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {user?.userType === 'service_provider' && (
                  <Link to="/provider-partnership-portal">
                    <Button size="sm" onClick={(e) => e.stopPropagation()}>
                      <Icon name="Plus" size={16} />
                      Add Service
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-2">
              {[...navigationItems, ...moreMenuItems]?.map((item) => (
                <Link
                  key={item?.id || item?.path || item?.href}
                  to={item?.path || item?.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.name}</span>
                </Link>
              ))}
              
              {/* Theme Toggle for Mobile */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                >
                  <Icon name={isDark ? 'Sun' : 'Moon'} size={18} />
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
              
              {isAuthenticated && (
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.userType === 'traveler' ? '🧳 Traveler' : '🏢 Service Provider'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;