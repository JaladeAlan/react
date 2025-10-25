import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user stats
        const statsRes = await api.get("/user/stats");
        setStats(statsRes.data.data);

        // Fetch user transactions
        const txRes = await api.get("/transactions/user");
        setTransactions(txRes.data.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
  
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {user.name || "User"} 👋
        </h2>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm text-gray-500">Total Balance</h3>
              <p className="text-2xl font-bold mt-2">
                ₦{Number(stats.balance).toLocaleString()}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm text-gray-500">Total Invested</h3>
              <p className="text-2xl font-bold mt-2">
                ₦{Number(stats.total_invested).toLocaleString()}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm text-gray-500">Lands Owned</h3>
              <p className="text-2xl font-bold mt-2">{stats.lands_owned}</p>
            </div>
          </div>
        )}

        {/* Profile + Marketplace + Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Profile Info
            </h3>
            <p className="text-gray-600 text-sm">Name: {user.name}</p>
            <p className="text-gray-600 text-sm">Email: {user.email}</p>
          </div>

          {/* Marketplace Shortcut */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Lands</h3>
            <p className="text-gray-600 text-sm mb-3">
              Browse available lands and investments.
            </p>
            <Link
              to="/lands"
              className="inline-block text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Go to Lands →
            </Link>
          </div>

          {/* Activity Summary */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Your Activity
            </h3>
            {stats ? (
              <>
                <p className="text-gray-600 text-sm mb-1">
                  Units Owned: {stats.units_owned}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  Pending Withdrawals: {stats.pending_withdrawals}
                </p>
                <p className="text-gray-600 text-sm">
                  Total Withdrawn: ₦
                  {Number(stats.total_withdrawn).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-gray-400 text-sm">Loading...</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions found.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Type</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((tx, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-2">{tx.type}</td>
                    <td className="p-2">₦{Number(tx.amount).toLocaleString()}</td>
                    <td
                      className={`p-2 ${
                        tx.status === "Completed"
                          ? "text-green-600"
                          : tx.status === "Pending"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    >
                      {tx.status}
                    </td>
                    <td className="p-2 text-gray-500">
                     {new Date(tx.date).toLocaleString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
