import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../utils/api";

/* ---------------- Helpers ---------------- */
const statusBadge = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("success") || s.includes("complete"))
    return "bg-green-50 text-green-700 ring-green-600/20";
  if (s.includes("pending"))
    return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
  return "bg-red-50 text-red-700 ring-red-600/20";
};

const amountMeta = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("deposit"))
    return { sign: "+", color: "text-green-600" };
  if (t.includes("withdraw"))
    return { sign: "−", color: "text-red-600" };
  if (t.includes("purchase") || t.includes("invest"))
    return { sign: "−", color: "text-red-600" };
  return { sign: "", color: "text-gray-700" };
};

const formatDate = (date) =>
  new Date(date).toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ---------------- Component ---------------- */
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, txRes] = await Promise.all([
          api.get("/user/stats"),
          api.get("/transactions/user"),
        ]);

        setStats(statsRes.data?.data);
        setTransactions(txRes.data?.data || []);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {user.name || "User"} 👋
        </h2>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Stat title="Total Balance" value={`₦${Number(stats.balance).toLocaleString()}`} />
            <Stat title="Total Invested" value={`₦${Number(stats.total_invested).toLocaleString()}`} />
            <Stat title="Lands Owned" value={stats.lands_owned} />
          </div>
        )}

        {/* Profile + Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Profile">
            <p className="text-sm text-gray-600">Name: {user.name}</p>
            <p className="text-sm text-gray-600">Email: {user.email}</p>
          </Card>

          <Card title="Lands">
            <p className="text-sm text-gray-600 mb-3">
              Browse available lands and investments.
            </p>
            <Link
              to="/lands"
              className="inline-flex items-center text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
            >
              Go to Lands →
            </Link>
          </Card>

          <Card title="Your Activity">
            <p className="text-sm text-gray-600">Units Owned: {stats.units_owned}</p>
            <p className="text-sm text-gray-600">
              Pending Withdrawals: {stats.pending_withdrawals}
            </p>
            <p className="text-sm text-gray-600">
              Total Withdrawn: ₦{Number(stats.total_withdrawn).toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Transactions
            </h2>
            {/* <Link to="/transactions" className="text-sm text-green-600 hover:underline">
              View all
            </Link> */}
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500">
              No transactions yet.
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Asset</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((tx) => {
                      const { sign, color } = amountMeta(tx.type);
                      return (
                        <tr
                          key={tx.id || `${tx.type}-${tx.date}`}
                          className="border-t hover:bg-gray-50 transition"
                        >
                          <td className="px-5 py-4 font-medium">{tx.type}</td>
                          <td className="px-5 py-4 text-gray-600">
                            {tx.land || "Wallet"}
                          </td>
                          <td className={`px-5 py-4 text-right font-semibold ${color}`}>
                            {sign}₦{Number(tx.amount).toLocaleString()}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${statusBadge(
                                tx.status
                              )}`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-500">
                            {formatDate(tx.date)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {transactions.slice(0, 5).map((tx) => {
                  const { sign, color } = amountMeta(tx.type);
                  return (
                    <div
                      key={tx.id || `${tx.type}-${tx.date}`}
                      className="border rounded-xl p-4 bg-gray-50"
                    >
                      <div className="flex justify-between mb-1">
                        <p className="font-medium">{tx.type}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ring-1 ${statusBadge(
                            tx.status
                          )}`}
                        >
                          {tx.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        Asset: {tx.land || "Wallet"}
                      </p>

                      <p className={`text-sm font-semibold ${color}`}>
                        {sign}₦{Number(tx.amount).toLocaleString()}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- Reusable UI ---------------- */
const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <h3 className="font-semibold mb-2">{title}</h3>
    {children}
  </div>
);

const Stat = ({ title, value }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);
