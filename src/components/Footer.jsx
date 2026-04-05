import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  
  const links = [
    { name: "About", path: "/about" },
    { name: "Destinations", path: "/destination-discovery" },
    { name: "Services", path: "/destination-discovery" },
    { name: "Contact", path: "/about" },
    { name: "Privacy, Terms & Conditions", path: "/legal" }
  ];

  const handleLinkClick = (link) => {
    if (link.path) {
      navigate(link.path);
    } else {
      // Fallback to anchor navigation for sections
      const element = document.getElementById(link.name.toLowerCase());
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-card border-t border-border py-8 w-full">
      <div className="w-full px-4 content-padding">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Company Info */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="/LOGO.png"
                alt="BounceSteps"
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="font-bold text-lg text-foreground">BounceSteps</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            {links.map((link) => (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {link.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {/* Social icons as text placeholders */}
            <div className="flex gap-3">
              {["f", "𝕏", "📷"].map((icon, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 BounceSteps. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
