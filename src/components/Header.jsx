import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { name: "Home", path: "/dashboard" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="text-2xl font-bold text-blue-600"
        >
          GrowthApp
        </Link>

        {/* Nav Links */}
        {user && (
          <nav className="flex items-center gap-6">
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
    </header>
  );
}
