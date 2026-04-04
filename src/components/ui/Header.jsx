import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useMessages } from '../../contexts/MessageContext';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../AppIcon';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const { unreadCount } = useMessages();
  const { toggleTheme, isDark } = useTheme();

  const travelerNavItems = [
    { name: 'Index',        href: '/',                      icon: 'Home',            id: 'tv-home',         requiresAuth: false },
    { name: 'Destinations', href: '/destination-discovery', icon: 'MapPin',          id: 'tv-destinations', requiresAuth: true  },
    { name: 'Plan Journey', href: '/journey-planner',       icon: 'Map',             id: 'tv-journey',      requiresAuth: true  },
    { name: 'Dashboard',    href: '/traveler-dashboard',    icon: 'LayoutDashboard', id: 'tv-dashboard',    requiresAuth: true  },
  ];

  const providerNavItems = [
    { name: 'Index',             path: '/',                                          icon: 'Home',            id: 'sp-home',      requiresAuth: false },
    { name: 'Overview',          path: '/service-provider-dashboard?tab=overview',  icon: 'LayoutDashboard', id: 'sp-overview',  requiresAuth: true  },
    { name: 'My Services',       path: '/service-provider-dashboard?tab=services',  icon: 'Package',         id: 'sp-services',  requiresAuth: true  },
    { name: 'Bookings',          path: '/service-provider-dashboard?tab=bookings',  icon: 'Calendar',        id: 'sp-bookings',  requiresAuth: true  },
    { name: 'Followers',         path: '/service-provider-dashboard?tab=followers', icon: 'Users',           id: 'sp-followers', requiresAuth: true  },
    { name: 'Messages',          path: '/service-provider-dashboard?tab=messages',  icon: 'MessageCircle',   id: 'sp-messages',  requiresAuth: true  },
    { name: 'My Profile',        path: '/service-provider-dashboard?tab=profile',   icon: 'User',            id: 'sp-profile',   requiresAuth: true  },
    { name: 'Promote Services',  path: '/service-provider-dashboard?tab=promotion', icon: 'TrendingUp',      id: 'sp-promotion', requiresAuth: true  },
    { name: 'Analytics',         path: '/service-provider-dashboard?tab=analytics', icon: 'BarChart',        id: 'sp-analytics', requiresAuth: true  },
    { name: 'About BounceSteps', path: '/service-provider-dashboard?tab=about',     icon: 'Info',            id: 'sp-about',     requiresAuth: true  },
  ];

  const travelerMoreItems = [
    { name: 'About BounceSteps', path: '/about', icon: 'Info', id: 'tv-more-about' },
  ];

  const isProvider      = user?.userType === 'service_provider';
  const navigationItems = isProvider ? providerNavItems : travelerNavItems;
  const moreMenuItems   = isProvider ? [] : travelerMoreItems;
  const allMobileItems  = isProvider
    ? providerNavItems
    : [...travelerNavItems, ...travelerMoreItems];

  const isActivePath = (path) => !!path && location?.pathname === path;

  const handleNavClick = (e, item) => {
    e.preventDefault();
    if (item.requiresAuth && !user) { navigate('/login'); return; }
    navigate(item.path || item.href);
    setIsMobileMenuOpen(false);
  };

  const handleMobileNav = (item) => {
    if (item.requiresAuth && !user) { navigate('/login'); }
    else { navigate(item.path || item.href); }
    setIsMobileMenuOpen(false);
  };

  const tabCls = (active) =>
    `flex items-center justify-center gap-1 flex-1 min-w-0 px-1 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
      active
        ? 'bg-primary text-primary-foreground shadow-md'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95'
    }`;

  const HEADER_H = 56; // px — matches h-14

  return (
    <>
      {/* ══ HEADER BAR ═══════════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 shadow-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          <div className="flex items-center h-14 gap-2">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/LOGO.png"
                alt="BounceSteps"
                className="h-8 sm:h-9 w-auto"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                onError={(e) => { 
                  e.target.src = '/bouncesteps-logo.png'; // Fallback to old logo
                  if (e.target.src.includes('bouncesteps-logo.png')) {
                    e.target.style.display = 'none'; 
                    e.target.nextElementSibling.style.display = 'flex'; 
                  }
                }}
              />
              <div style={{ display: 'none' }}>
                <span className="text-xl font-bold text-primary">B</span>
                <span className="text-xl font-light text-muted-foreground">ounceSteps</span>
              </div>
            </Link>

            {/* ── DESKTOP NAV (≥768px) ───────────────────────────────── */}
            <nav className="hidden md:flex flex-1 items-center mx-2 lg:mx-4 overflow-hidden">
              <div className="flex items-center w-full gap-0.5">
                {navigationItems.map((item) => {
                  const active = isActivePath(item.path || item.href);
                  return (
                    <button key={item.id} onClick={(e) => handleNavClick(e, item)} className={tabCls(active)}>
                      {item.icon && <Icon name={item.icon} size={13} className={`flex-shrink-0 ${active ? 'text-primary-foreground' : 'text-primary/70'}`} />}
                      <span className="truncate hidden lg:inline">{item.name}</span>
                    </button>
                  );
                })}
                {!isProvider && moreMenuItems.length > 0 && (
                  <div className="relative group flex-1 min-w-0">
                    <button className={tabCls(false)}>
                      <Icon name="MoreHorizontal" size={13} className="flex-shrink-0 text-primary/70" />
                      <span className="truncate hidden lg:inline">More</span>
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {moreMenuItems.map((item) => (
                          <button key={item.id} onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActivePath(item.path) ? 'bg-primary text-primary-foreground' : 'text-popover-foreground hover:bg-muted'}`}>
                            <Icon name={item.icon} size={16} /><span>{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* ── RIGHT CONTROLS ───────────────────────────────────────── */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
              <button onClick={toggleTheme} className="p-2 rounded-full text-foreground/80 hover:bg-muted transition-all duration-200" title={isDark ? 'Light Mode' : 'Dark Mode'}>
                <Icon name={isDark ? 'Sun' : 'Moon'} size={18} />
              </button>
              {!isProvider && isAuthenticated && user?.userType === 'traveler' && (
                <>
                  <button onClick={() => navigate('/traveler-dashboard?tab=cart')} className="relative hidden md:flex p-2 rounded-full text-foreground/80 hover:bg-muted transition-all">
                    <Icon name="ShoppingCart" size={18} />
                    {getCartCount() > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">{getCartCount()}</span>}
                  </button>
                  <button onClick={() => navigate('/traveler-dashboard?tab=messages')} className="relative hidden md:flex p-2 rounded-full text-foreground/80 hover:bg-muted transition-all">
                    <Icon name="MessageCircle" size={18} />
                    {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">{unreadCount}</span>}
                  </button>
                </>
              )}
              {!isProvider && isAuthenticated && (
                <div className="relative group hidden md:block">
                  <button className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-muted transition-all">
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center"><span className="text-primary-foreground text-xs font-medium">{user?.firstName?.charAt(0) || 'U'}</span></div>
                    <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-52 bg-popover border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="py-2">
                      <div className="px-4 py-2.5 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <Link to="/traveler-dashboard?tab=preferences" className="flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"><Icon name="User" size={15} /><span>My Profile</span></Link>
                      <Link to="/traveler-dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"><Icon name="LayoutDashboard" size={15} /><span>Dashboard</span></Link>
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"><Icon name="LogOut" size={15} /><span>Sign Out</span></button>
                    </div>
                  </div>
                </div>
              )}

              {/* HAMBURGER — mobile only */}
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-foreground/80 hover:bg-muted transition-all duration-200"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══ MOBILE MENU — right-side drawer ══ */}
      {/* Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-card border-l border-border z-[60] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-medium text-lg">Menu</h2>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
          {/* User card */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex flex-shrink-0 items-center justify-center text-primary-foreground font-bold">
                {user?.firstName?.charAt(0) || 'T'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-primary flex items-center gap-1 truncate">
                  <Icon name="Plane" size={12} /> {isProvider ? 'Service Provider' : 'Traveler'}
                </p>
              </div>
            </div>
          )}

          {/* Section label */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-1">
            Navigation
          </p>

          {/* ── NAV ITEMS ── */}
          <div className="flex flex-col gap-1">
            {allMobileItems.map((item) => {
              const path = item.path || item.href;
              const active = isActivePath(path);
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNav(item)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors min-h-[48px] ${
                    active 
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    className={active ? 'text-primary-foreground' : 'text-muted-foreground'}
                  />
                  <span className="flex-1">{item.name}</span>
                  {!active && <Icon name="ChevronRight" size={16} className="opacity-40" />}
                </button>
              );
            })}
          </div>

          {/* Quick actions (traveler) */}
          {!isProvider && isAuthenticated && user?.userType === 'traveler' && (
            <>
              <div className="h-px bg-border my-2 w-full" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-1">Quick Actions</p>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Cart', icon: 'ShoppingCart', path: '/traveler-dashboard?tab=cart', badge: getCartCount() },
                  { label: 'Messages', icon: 'MessageCircle', path: '/traveler-dashboard?tab=messages', badge: unreadCount },
                ].map(({ label, icon, path, badge }) => (
                  <button key={label} onClick={() => { navigate(path); setIsMobileMenuOpen(false); }}
                    className="relative flex items-center gap-3 w-full p-3 rounded-lg text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors min-h-[48px]"
                  >
                    <Icon name={icon} size={20} className="text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{label}</span>
                    {badge > 0 && (
                      <span className="absolute min-w-[18px] h-[18px] right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold px-1 shadow-sm">{badge}</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Settings */}
          <div className="mt-auto pt-6 pb-2">
            <div className="h-px bg-border my-2 w-full" />
            
            {/* Theme */}
            <button onClick={toggleTheme}
              className="flex items-center justify-between w-full p-3 rounded-lg text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors min-h-[48px]"
            >
              <div className="flex items-center gap-3">
                <Icon name={isDark ? 'Sun' : 'Moon'} size={20} className="text-muted-foreground" />
                <span className="font-medium">
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <div className={`w-[40px] h-6 rounded-full p-[3px] transition-colors ${isDark ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-[16px]' : 'translate-x-[0px]'}`} />
              </div>
            </button>

            {/* Sign out */}
            {isAuthenticated && (
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-left text-red-500 hover:bg-red-500/10 transition-colors mt-1"
              >
                <Icon name="LogOut" size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Header;