import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { pathname } = useLocation();

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
        <nav className="flex gap-6">
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

          {/* Logout */}
          <Link
            to="/login"
            className="text-red-500 hover:text-red-600 font-medium transition"
          >
            Logout
          </Link>
        </nav>
      </div>
    </header>
  );
}
