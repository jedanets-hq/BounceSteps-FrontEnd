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
    { name: 'Home',         href: '/',                      icon: 'Home',            id: 'tv-home',         requiresAuth: false },
    { name: 'Destinations', href: '/destination-discovery', icon: 'MapPin',          id: 'tv-destinations', requiresAuth: true  },
    { name: 'Plan Journey', href: '/journey-planner',       icon: 'Map',             id: 'tv-journey',      requiresAuth: true  },
    { name: 'Dashboard',    href: '/traveler-dashboard',    icon: 'LayoutDashboard', id: 'tv-dashboard',    requiresAuth: true  },
  ];

  const providerNavItems = [
    { name: 'Home',              path: '/',                                          icon: 'Home',            id: 'sp-home',      requiresAuth: false },
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
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/30"
        style={{ backgroundColor: isDark ? 'rgba(13,17,23,0.92)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          <div className="flex items-center h-14 gap-2">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/bouncesteps-logo.png"
                alt="BounceSteps"
                className="h-8 sm:h-9 w-auto"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
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

      {/* ══ MOBILE MENU — outside <header> to avoid stacking-context trap ══ */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            top: `${HEADER_H}px`,
            left: 0, right: 0, bottom: 0,
            zIndex: 45,
            overflowY: 'auto',
            backgroundColor: isDark ? 'rgba(10,14,20,0.98)' : 'rgba(250,251,252,0.98)',
            borderTop: '1px solid rgba(128,128,128,0.15)',
          }}
        >
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '80px' }}>

            {/* User card */}
            {isAuthenticated && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '14px', marginBottom: '8px',
                backgroundColor: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgb(34,197,94)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{user?.firstName?.charAt(0) || 'U'}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgb(34,197,94)' }}>
                    {isProvider ? '🏢 Service Provider' : '✈️ Traveler'}
                  </p>
                </div>
              </div>
            )}

            {/* Section label */}
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? '#94a3b8' : '#64748b', padding: '0 4px 4px' }}>
              Navigation
            </p>

            {/* ── NAV ITEMS — clean vertical list ── */}
            {allMobileItems.map((item) => {
              const path = item.path || item.href;
              const active = isActivePath(path);
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNav(item)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 15, fontWeight: active ? 600 : 500,
                    backgroundColor: active
                      ? 'rgb(34,197,94)'
                      : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    color: active
                      ? '#fff'
                      : isDark ? 'rgba(241,245,249,0.85)' : 'rgba(15,23,42,0.8)',
                    transition: 'all 0.15s ease',
                    WebkitTapHighlightColor: 'transparent',
                    minHeight: '52px',
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    style={{ flexShrink: 0, color: active ? '#fff' : 'rgb(34,197,94)', opacity: active ? 1 : 0.75 }}
                  />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  {!active && <Icon name="ChevronRight" size={16} style={{ flexShrink: 0, opacity: 0.35 }} />}
                </button>
              );
            })}

            {/* Quick actions (traveler) */}
            {!isProvider && isAuthenticated && user?.userType === 'traveler' && (
              <>
                <div style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', margin: '8px 0' }} />
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? '#94a3b8' : '#64748b', padding: '0 4px 4px' }}>Quick Actions</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Cart', icon: 'ShoppingCart', path: '/traveler-dashboard?tab=cart', badge: getCartCount() },
                    { label: 'Messages', icon: 'MessageCircle', path: '/traveler-dashboard?tab=messages', badge: unreadCount },
                  ].map(({ label, icon, path, badge }) => (
                    <button key={label} onClick={() => { navigate(path); setIsMobileMenuOpen(false); }}
                      style={{
                        position: 'relative', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '13px 16px', borderRadius: '12px', cursor: 'pointer',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                        fontSize: 14, fontWeight: 500,
                        color: isDark ? 'rgba(241,245,249,0.85)' : 'rgba(15,23,42,0.8)',
                        minHeight: '50px', WebkitTapHighlightColor: 'transparent',
                      }}>
                      <Icon name={icon} size={18} style={{ color: 'rgb(34,197,94)', opacity: 0.8 }} />
                      <span>{label}</span>
                      {badge > 0 && (
                        <span style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', backgroundColor: 'rgb(34,197,94)', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Settings */}
            <div style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', margin: '8px 0' }} />
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? '#94a3b8' : '#64748b', padding: '0 4px 4px' }}>Settings</p>

            {/* Theme */}
            <button onClick={toggleTheme}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '14px 16px', borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                cursor: 'pointer', minHeight: '52px', WebkitTapHighlightColor: 'transparent',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Icon name={isDark ? 'Sun' : 'Moon'} size={20} style={{ color: 'rgb(34,197,94)', opacity: 0.8 }} />
                <span style={{ fontSize: 15, fontWeight: 500, color: isDark ? 'rgba(241,245,249,0.85)' : 'rgba(15,23,42,0.8)' }}>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <div style={{ width: 42, height: 24, borderRadius: 12, padding: 3, backgroundColor: isDark ? 'rgb(34,197,94)' : 'rgba(148,163,184,0.4)', transition: 'background-color 0.3s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: `translateX(${isDark ? 18 : 0}px)`, transition: 'transform 0.3s' }} />
              </div>
            </button>

            {/* Sign out */}
            {isAuthenticated && (
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: '14px 16px', borderRadius: '12px',
                  backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                  cursor: 'pointer', minHeight: '52px', WebkitTapHighlightColor: 'transparent',
                  color: 'rgb(239,68,68)', fontSize: 15, fontWeight: 500,
                }}>
                <Icon name="LogOut" size={20} />
                <span>Sign Out</span>
              </button>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default Header;