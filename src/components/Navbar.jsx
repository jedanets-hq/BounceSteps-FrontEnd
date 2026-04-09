import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Dynamic links based on user type
  const getLinks = () => {
    if (isAuthenticated && user?.userType === 'service_provider') {
      return ["Home", "My Services", "Bookings", "Dashboard", "About", "Contact"];
    }
    return ["Home", "Destinations", "Plan Your Journey", "Dashboard", "About", "Contact"];
  };
  
  const links = getLinks();

  // Function to check if a link is active
  const isActiveLink = (link) => {
    const linkLower = link.toLowerCase();
    const currentPath = location.pathname;
    
    if (linkLower === 'home') {
      return currentPath === '/';
    } else if (linkLower === 'destinations' || linkLower === 'my services') {
      return currentPath === '/destination-discovery' || currentPath === '/service-provider-dashboard';
    } else if (linkLower === 'plan your journey' || linkLower === 'bookings') {
      return currentPath === '/journey-planner' || currentPath === '/bookings';
    } else if (linkLower === 'dashboard') {
      return currentPath === '/traveler-dashboard' || currentPath === '/service-provider-dashboard';
    } else if (linkLower === 'about') {
      return currentPath === '/about';
    } else if (linkLower === 'contact') {
      return currentPath === '/contact' || currentPath === '/about';
    }
    
    return false;
  };

  // Handle navigation based on user type
  const handleNavigation = (link) => {
    const linkLower = link.toLowerCase();
    
    if (linkLower === 'destinations' || linkLower === 'my services') {
      if (!isAuthenticated) {
        // If not logged in, go to destination discovery page
        navigate('/destination-discovery');
      } else if (user?.userType === 'traveler') {
        // If traveler, go to destination discovery page
        navigate('/destination-discovery');
      } else if (user?.userType === 'service_provider') {
        // If service provider, go to their services management
        navigate('/service-provider-dashboard?tab=services');
      } else {
        // Fallback to destination discovery
        navigate('/destination-discovery');
      }
    } else if (linkLower === 'plan your journey' || linkLower === 'bookings') {
      if (!isAuthenticated) {
        // If not logged in, redirect to login
        navigate('/login');
      } else if (user?.userType === 'traveler') {
        // If traveler, go to journey planner
        navigate('/journey-planner');
      } else if (user?.userType === 'service_provider') {
        // If service provider, go to bookings management
        navigate('/service-provider-dashboard?tab=bookings');
      } else {
        // Fallback to journey planner
        navigate('/journey-planner');
      }
    } else if (linkLower === 'dashboard') {
      if (!isAuthenticated) {
        // If not logged in, redirect to login
        navigate('/login');
      } else if (user?.userType === 'traveler') {
        // If traveler, go to traveler dashboard
        navigate('/traveler-dashboard');
      } else if (user?.userType === 'service_provider') {
        // If service provider, go to service provider dashboard
        navigate('/service-provider-dashboard');
      } else {
        // Fallback to login
        navigate('/login');
      }
    } else if (linkLower === 'home') {
      navigate('/');
    } else if (linkLower === 'about') {
      // Navigate to about page
      navigate('/about');
    } else if (linkLower === 'contact') {
      // Navigate to about page (which contains contact info)
      navigate('/about');
    } else {
      // For other links, use anchor navigation or go to homepage
      const element = document.getElementById(linkLower);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If section doesn't exist, go to homepage
        navigate('/');
      }
    }
    
    // Close mobile menu
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border w-full">
      <div className="w-full flex items-center justify-between py-3 px-4 content-padding">
        <div className="flex items-center gap-2 ml-0 md:ml-8 cursor-pointer" onClick={() => navigate('/')}>
          <img
            src="/LOGO.png"
            alt="BounceSteps"
            className="h-10 w-auto"
            onError={(e) => {
              // Fallback to text logo if image fails to load
              e.target.style.display = 'none';
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="w-10 h-10 rounded-full border-2 border-primary items-center justify-center hidden">
            <span className="text-primary font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-lg text-foreground">BounceSteps</span>
        </div>
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l}>
              <button
                onClick={() => handleNavigation(l)}
                className={`transition-colors font-medium text-sm cursor-pointer ${
                  isActiveLink(l) 
                    ? 'text-primary font-semibold border-b-2 border-primary pb-1' 
                    : 'text-foreground/80 hover:text-primary'
                }`}
              >
                {l}
              </button>
            </li>
          ))}
          {/* Theme Toggle Button */}
          <li>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-foreground/80 hover:text-primary"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} />
              )}
            </button>
          </li>
        </ul>
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-background border-t border-border px-4 pb-4">
          {links.map((l) => (
            <button
              key={l}
              onClick={() => handleNavigation(l)}
              className={`block py-2 font-medium w-full text-left transition-colors ${
                isActiveLink(l) 
                  ? 'text-primary font-semibold' 
                  : 'text-foreground/80 hover:text-primary'
              }`}
            >
              {l}
            </button>
          ))}
          {/* Theme Toggle for Mobile */}
          <button
            onClick={() => {
              toggleTheme();
              setOpen(false);
            }}
            className="flex items-center gap-2 py-2 font-medium w-full text-left transition-colors text-foreground/80 hover:text-primary mt-2 pt-4 border-t border-border"
          >
            {theme === 'light' ? (
              <>
                <Moon size={18} />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={18} />
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
