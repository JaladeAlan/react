import { Link } from "react-router-dom";

export default function Splash() {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to Growth App 🌱</h1>
      <p className="text-gray-600 max-w-md mb-6">
        Manage your investments, explore the marketplace, and grow your portfolio — all in one place.
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Login
        </Link>
        <Link to="/register" className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
          Register
        </Link>
      </div>
    </div>
  );
}
