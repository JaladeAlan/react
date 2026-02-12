import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import toast from "react-hot-toast";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { name: "Home", path: "/dashboard" },
    { name: "Lands", path: "/lands" },
    { name: "Wallet", path: "/wallet" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Settings", path: "/settings" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    
    // Show logout toast
    toast.success("Logged out successfully. See you soon! 👋", {
      duration: 3000,
      position: "top-center",
    });
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-[9000]">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          aria-label="GrowthApp Home"
        >
          GrowthApp
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <>
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors ${
                    pathname === link.path
                      ? "text-blue-600 font-semibold"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  aria-current={pathname === link.path ? "page" : undefined}
                >
                  {link.name}
                </Link>
              ))}

              <NotificationBell />

              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 font-medium transition-colors"
                aria-label="Logout"
              >
                Logout
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {user && menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-[9100]"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Navigation */}
          <div
            id="mobile-menu"
            className="md:hidden bg-white border-t border-gray-200 shadow-lg relative z-[9200]"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <nav className="flex flex-col px-4 py-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`py-3 px-3 rounded-md transition-colors ${
                    pathname === link.path
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-500"
                  }`}
                  aria-current={pathname === link.path ? "page" : undefined}
                >
                  {link.name}
                </Link>
              ))}

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 font-medium transition-colors py-2 px-3 hover:bg-red-50 rounded-md"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}