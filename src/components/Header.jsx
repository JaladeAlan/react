import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { name: "Marketplace", path: "/marketplace" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          GrowthApp
        </Link>

        {/* Nav Links */}
        <nav className="flex gap-6 items-center">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${
                pathname === link.path
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-500"
              } transition`}
            >
              {link.name}
            </Link>
          ))}

          {/* Auth section */}
          {user ? (
            <>
              <span className="text-gray-700 font-medium">
                Hi, {user.name || "User"}
              </span>
              <button
                onClick={logout}
                className="text-red-500 hover:text-red-600 font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium transition"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
