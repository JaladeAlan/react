import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import { TrendingUp, Wallet, MapPin, Activity, ArrowUpRight } from "lucide-react";

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
  if (t.includes("deposit") || t.includes("sale"))
    return { sign: "+", color: "text-green-600" };
  if (t.includes("withdraw") || t.includes("purchase") || t.includes("invest"))
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

const formatCurrency = (amount) => {
  const num = Number(amount ?? 0);
  if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `₦${(num / 1000).toFixed(1)}K`;
  return `₦${num.toLocaleString()}`;
};

/* ---------------- Dashboard Component ---------------- */
export default function Dashboard() {
  const { user, loading: loadingUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);

  const cache = useRef({ stats: null, transactions: null });
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token) return;

    // Prevent duplicate fetches
    if (hasFetchedRef.current) return;

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
        hasFetchedRef.current = true;

        setStats(statsData);
        setTransactions(txData);
      } catch (err) {
        if (err.name === "CanceledError") return;

        console.error("Dashboard fetch error:", err);

        if (err.response?.status === 401) {
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

    return () => {
      controller.abort();
      hasFetchedRef.current = false;
    };
  }, [user, navigate]);

  // Calculate profit/loss percentage
  const profitLoss = stats
    ? ((stats.balance - stats.total_invested) / stats.total_invested) * 100
    : 0;
  const isProfit = profitLoss >= 0;

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Welcome back, {user?.name || "User"} 👋
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Link
            to="/lands"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
          >
            Browse Lands
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* ---------------- Stats Cards ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loadingStats ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-6 h-32 animate-pulse"
              ></div>
            ))
          ) : (
            <>
              <StatCard
                icon={<Wallet size={24} className="text-blue-600" />}
                title="Total Balance"
                value={formatCurrency(stats?.balance)}
                fullValue={`₦${Number(stats?.balance ?? 0).toLocaleString()}`}
                trend={isProfit ? "up" : "down"}
                trendValue={`${profitLoss.toFixed(1)}%`}
              />
              <StatCard
                icon={<TrendingUp size={24} className="text-green-600" />}
                title="Current Investment"
                value={formatCurrency(stats?.total_invested)}
                fullValue={`₦${Number(stats?.total_invested ?? 0).toLocaleString()}`}
              />
              <StatCard
                icon={<MapPin size={24} className="text-purple-600" />}
                title="Lands with Units Owned"
                value={stats?.lands_owned ?? 0}
                subtitle={`${stats?.units_owned ?? 0} total units`}
              />
              <StatCard
                icon={<Activity size={24} className="text-orange-600" />}
                title="Total Withdrawn"
                value={formatCurrency(stats?.total_withdrawn)}
                fullValue={`₦${Number(stats?.total_withdrawn ?? 0).toLocaleString()}`}
                subtitle={`${stats?.pending_withdrawals ?? 0} pending`}
              />
            </>
          )}
        </div>

        {/* ---------------- Quick Actions ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <QuickActionCard
            title="Wallet"
            description="Manage your funds and transactions"
            linkTo="/wallet"
            linkText="Open Wallet"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <QuickActionCard
            title="Portfolio"
            description="Track your land investments"
            linkTo="/portfolio"
            linkText="View Portfolio"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <QuickActionCard
            title="Browse Lands"
            description="Explore available investment opportunities"
            linkTo="/lands"
            linkText="Explore Lands"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>

        {/* ---------------- Transactions ---------------- */}
        <TransactionsTable transactions={transactions} loading={loadingTx} />
      </main>
    </div>
  );
}

/* ---------------- Stat Card Component ---------------- */
const StatCard = ({ icon, title, value, fullValue, subtitle, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend === "up"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800" title={fullValue}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

/* ---------------- Quick Action Card ---------------- */
const QuickActionCard = ({
  title,
  description,
  linkTo,
  linkText,
  bgColor,
  textColor,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Link
        to={linkTo}
        className={`inline-flex items-center gap-2 text-sm font-medium ${textColor} hover:underline`}
      >
        {linkText}
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
};

/* ---------------- Transactions Table ---------------- */
const TransactionsTable = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
        <Activity size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="font-semibold text-gray-800 mb-2">No transactions yet</h3>
        <p className="text-sm text-gray-500 mb-6">
          Start investing in land to see your transaction history
        </p>
        <Link
          to="/lands"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
        >
          Browse Lands
          <ArrowUpRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Recent Transactions
        </h2>
        <Link
          to="/wallet"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          View all
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600">
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((tx) => {
              const { sign, color } = amountMeta(tx?.type);
              return (
                <tr
                  key={tx?.id ?? `${tx?.type}-${tx?.date}`}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium capitalize">
                      {tx?.type?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {tx?.land || "Wallet"}
                  </td>
                  <td className={`px-5 py-4 text-right font-semibold ${color}`}>
                    {sign}₦{Number(tx?.amount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ring-1 capitalize ${statusBadge(
                        tx?.status
                      )}`}
                    >
                      {tx?.status || "-"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {formatDate(tx?.date)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {transactions.slice(0, 5).map((tx) => {
          const { sign, color } = amountMeta(tx?.type);
          return (
            <div
              key={tx?.id ?? `${tx?.type}-${tx?.date}`}
              className="border rounded-lg p-4 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium capitalize">
                    {tx?.type?.replace("_", " ")}
                  </p>
                  <p className="text-sm text-gray-500">{tx?.land || "Wallet"}</p>
                </div>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ring-1 capitalize ${statusBadge(
                    tx?.status
                  )}`}
                >
                  {tx?.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-lg font-bold ${color}`}>
                  {sign}₦{Number(tx?.amount ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">{formatDate(tx?.date)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};