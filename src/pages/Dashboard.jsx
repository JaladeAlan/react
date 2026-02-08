import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";

/* ---------------- Helpers ---------------- */
const statusBadge = (status = "") => {
  const s = status?.toLowerCase() || "";
  if (s.includes("success") || s.includes("complete"))
    return "bg-green-50 text-green-700 ring-green-600/20";
  if (s.includes("pending"))
    return "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
  return "bg-red-50 text-red-700 ring-red-600/20";
};

const amountMeta = (type = "") => {
  const t = type?.toLowerCase() || "";
  if (t.includes("deposit")) return { sign: "+", color: "text-green-600" };
  if (t.includes("withdraw")) return { sign: "−", color: "text-red-600" };
  if (t.includes("purchase") || t.includes("invest"))
    return { sign: "−", color: "text-red-600" };
  return { sign: "", color: "text-gray-700" };
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/* ---------------- Dashboard Component ---------------- */
export default function Dashboard() {
  const { user, loading: loadingUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);

  const cache = useRef({ stats: null, transactions: null });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token) return; 

    // Use cached data if available
    if (cache.current.stats) {
      setStats(cache.current.stats);
      setLoadingStats(false);
    }
    if (cache.current.transactions) {
      setTransactions(cache.current.transactions);
      setLoadingTx(false);
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        if (!cache.current.stats) setLoadingStats(true);
        if (!cache.current.transactions) setLoadingTx(true);

        const [statsRes, txRes] = await Promise.all([
          api.get("/user/stats", { signal: controller.signal }),
          api.get("/transactions/user", { signal: controller.signal }),
        ]);

        const statsData = statsRes.data?.data || {};
        const txData = txRes.data?.data || [];

        cache.current = { stats: statsData, transactions: txData };

        setStats(statsData);
        setTransactions(txData);
      } catch (err) {
        if (err.name === "CanceledError") return; 

        console.error("Dashboard fetch error:", err);

        if (err.response?.status === 401) {
          // Session expired
          localStorage.removeItem("token");
          toast.error("Session expired. Please log in again.");
          navigate("/login", { replace: true });
        } else {
          toast.error("Failed to load dashboard data.");
        }
      } finally {
        setLoadingStats(false);
        setLoadingTx(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [user, navigate]);

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name || "User"} 👋
        </h2>

        {/* ---------------- Stats ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingStats
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm p-6 h-24 animate-pulse"
                ></div>
              ))
            : (
              <>
                <Stat
                  title="Total Balance"
                  value={`₦${Number(stats?.balance ?? 0).toLocaleString()}`}
                />
                <Stat
                  title="Current Investment"
                  value={`₦${Number(stats?.total_invested ?? 0).toLocaleString()}`}
                />
                <Stat title="Lands with Units Owned" value={stats?.lands_owned ?? 0} />
              </>
            )
          }
        </div>

        {/* ---------------- Cards ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingStats
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm p-6 h-32 animate-pulse"
                ></div>
              ))
            : (
              <>
                <Card title="Profile">
                  <p className="text-sm text-gray-600">Name: {user?.name}</p>
                  <p className="text-sm text-gray-600">Email: {user?.email}</p>
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
                  <p className="text-sm text-gray-600">
                    Units Owned: {stats?.units_owned ?? 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pending Withdrawals: {stats?.pending_withdrawals ?? 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Withdrawn: ₦{Number(stats?.total_withdrawn ?? 0).toLocaleString()}
                  </p>
                </Card>
              </>
            )
          }
        </div>

        {/* ---------------- Transactions ---------------- */}
        <TransactionsTable transactions={transactions} loading={loadingTx} />
      </main>
    </div>
  );
}

/* ---------------- Transactions ---------------- */
const TransactionsTable = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-2 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6 text-center text-sm text-gray-500">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Transactions
      </h2>

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
              const { sign, color } = amountMeta(tx?.type);
              return (
                <tr key={tx?.id ?? `${tx?.type}-${tx?.date}`} className="border-t">
                  <td className="px-5 py-4 font-medium">{tx?.type}</td>
                  <td className="px-5 py-4 text-gray-600">{tx?.land || "Wallet"}</td>
                  <td className={`px-5 py-4 text-right font-semibold ${color}`}>
                    {sign}₦{Number(tx?.amount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${statusBadge(tx?.status)}`}
                    >
                      {tx?.status || "-"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(tx?.date)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- UI ---------------- */
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
