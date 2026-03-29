import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  Award,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Package,
  Wallet,
  BookOpen
} from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' }
      ]
    },
    {
      title: 'User Management',
      items: [
        { path: '/users', icon: Users, label: 'All Users' },
        { path: '/travelers', icon: Users, label: 'Travelers' },
        { path: '/providers', icon: Building2, label: 'Service Providers' }
      ]
    },
    {
      title: 'Content Management',
      items: [
        { path: '/services', icon: Package, label: 'Services' },
        { path: '/stories', icon: BookOpen, label: 'Traveler Stories' }
      ]
    },
    {
      title: 'Verification & Quality',
      items: [
        { path: '/verification', icon: ShieldCheck, label: 'Verification Requests' },
        { path: '/badges', icon: Award, label: 'Badge Management' }
      ]
    },
    {
      title: 'Financial',
      items: [
        { path: '/financial', icon: Wallet, label: 'Payment Accounts' },
        { path: '/payments', icon: CreditCard, label: 'Transactions' },
        { path: '/reports', icon: FileText, label: 'Financial Reports' }
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/settings', icon: Settings, label: 'Settings' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border text-foreground transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <img 
                src="/bouncesteps-logo.png" 
                alt="BounceSteps" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="flex items-center space-x-2" style={{display: 'none'}}>
                <div className="text-2xl font-bold text-primary">i</div>
                <div className="text-xl font-light">Safari</div>
              </div>
              <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded font-medium">
                Admin
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              {sidebarOpen && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        title={!sidebarOpen ? item.label : ''}
                      >
                        <Icon size={20} />
                        {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Theme Toggle & Admin Info */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          {/* Admin Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>                  
  );
};

export default Layout;
