import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { name: "Home", path: "/dashboard" },
    { name: "Lands", path: "/lands" },
    { name: "Wallet", path: "/wallet" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="text-2xl font-bold text-blue-600"
        >
          GrowthApp
        </Link>

        {/* Mobile Menu Button */}
        {user && (
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        )}

        {/* Nav Links (Desktop) */}
        {user && (
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition ${
                  pathname === link.path
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <NotificationBell />

            {/* Logout */}
            <button
              onClick={logout}
              className="text-red-500 hover:text-red-600 font-medium transition"
            >
              Logout
            </button>
          </nav>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      {user && menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <nav className="flex flex-col px-4 py-3 space-y-3">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`transition ${
                  pathname === link.path
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center justify-between mt-3">
              <NotificationBell />
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="text-red-500 hover:text-red-600 font-medium transition"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
                        }
