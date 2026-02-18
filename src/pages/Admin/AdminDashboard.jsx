import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    lands: { total: 0, active: 0, disabled: 0 },
    kyc: { total: 0, pending: 0, approved: 0, rejected: 0 },
    referrals: { total: 0, completed: 0, pending: 0, totalRewards: 0 },
    users: { total: 0, verified: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all stats in parallel
      const [landsRes, kycRes, referralsRes] = await Promise.all([
        api.get("/lands/admin/show"),
        api.get("/admin/kyc"),
        api.get("/admin/referrals/stats"),
      ]);

      // Process lands stats
      const lands = landsRes.data.data;
      const landsStats = {
        total: lands.length,
        active: lands.filter((l) => l.is_available).length,
        disabled: lands.filter((l) => !l.is_available).length,
      };

      // Process KYC stats
      const kycs = kycRes.data.data.data;
      const kycStats = {
        total: kycs.length,
        pending: kycs.filter((k) => k.status === "pending").length,
        approved: kycs.filter((k) => k.status === "approved").length,
        rejected: kycs.filter((k) => k.status === "rejected").length,
      };

      // Process referral stats
      const referralStats = {
        total: referralsRes.data.data.total_referrals,
        completed: referralsRes.data.data.completed_referrals,
        pending: referralsRes.data.data.pending_referrals,
        totalRewards: referralsRes.data.data.total_rewards_issued,
      };

      setStats({
        lands: landsStats,
        kyc: kycStats,
        referrals: referralStats,
      });
    } catch (err) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const koboToNaira = (kobo) => (kobo / 100).toLocaleString();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your platform from one central location
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Lands Card */}
        <Link
          to="/admin/lands"
          className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Total Lands</h3>
            <span className="text-3xl">🏞️</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.lands.total}
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600">
              ✓ {stats.lands.active} Active
            </span>
            <span className="text-red-600">
              ✗ {stats.lands.disabled} Disabled
            </span>
          </div>
        </Link>

        {/* KYC Card */}
        <Link
          to="/admin/kyc"
          className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">KYC Submissions</h3>
            <span className="text-3xl">🆔</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.kyc.total}
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-yellow-600">
              ⏳ {stats.kyc.pending} Pending
            </span>
            <span className="text-green-600">
              ✓ {stats.kyc.approved} Approved
            </span>
          </div>
        </Link>

        {/* Referrals Card */}
        <Link
          to="/admin/referrals"
          className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Referrals</h3>
            <span className="text-3xl">🎁</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.referrals.total}
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600">
              ✓ {stats.referrals.completed} Completed
            </span>
            <span className="text-yellow-600">
              ⏳ {stats.referrals.pending} Pending
            </span>
          </div>
        </Link>

        {/* Rewards Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Total Rewards</h3>
            <span className="text-3xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ₦{koboToNaira(stats.referrals.totalRewards)}
          </div>
          <div className="text-xs text-gray-500">Issued to users</div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Land Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Land Management</h2>
              <span className="text-2xl">🏞️</span>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <Link
              to="/admin/lands"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div>
                <div className="font-medium text-gray-900">View All Lands</div>
                <div className="text-sm text-gray-500">
                  Manage {stats.lands.total} properties
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>

            <Link
              to="/admin/lands/create"
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <div>
                <div className="font-medium text-blue-900">Add New Land</div>
                <div className="text-sm text-blue-600">
                  Create a new property listing
                </div>
              </div>
              <span className="text-blue-400">→</span>
            </Link>
          </div>
        </div>

        {/* KYC Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">KYC Verification</h2>
              <span className="text-2xl">🆔</span>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <Link
              to="/admin/kyc?status=pending"
              className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
            >
              <div>
                <div className="font-medium text-yellow-900">
                  Pending Reviews
                </div>
                <div className="text-sm text-yellow-600">
                  {stats.kyc.pending} submissions awaiting review
                </div>
              </div>
              <span className="text-yellow-400">→</span>
            </Link>

            <Link
              to="/admin/kyc"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div>
                <div className="font-medium text-gray-900">All Submissions</div>
                <div className="text-sm text-gray-500">
                  View all KYC verifications
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Referral System</h2>
            <span className="text-2xl">🎁</span>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/referrals"
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div>
              <div className="font-medium text-gray-900">View All Referrals</div>
              <div className="text-sm text-gray-500">
                {stats.referrals.total} total referrals
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </Link>

          <Link
            to="/admin/referrals?status=completed"
            className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <div>
              <div className="font-medium text-green-900">Completed</div>
              <div className="text-sm text-green-600">
                {stats.referrals.completed} successful referrals
              </div>
            </div>
            <span className="text-green-400">→</span>
          </Link>

          <Link
            to="/admin/referrals?status=pending"
            className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
          >
            <div>
              <div className="font-medium text-yellow-900">Pending</div>
              <div className="text-sm text-yellow-600">
                {stats.referrals.pending} awaiting first purchase
              </div>
            </div>
            <span className="text-yellow-400">→</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/admin/lands/create"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
          >
            <div className="text-3xl mb-2">➕</div>
            <div className="font-medium">Add Land</div>
          </Link>

          <Link
            to="/admin/kyc?status=pending"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
          >
            <div className="text-3xl mb-2">✓</div>
            <div className="font-medium">Review KYC</div>
          </Link>

          <Link
            to="/admin/referrals"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-medium">View Stats</div>
          </Link>

          <Link
            to="/admin/lands"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-medium">Manage All</div>
          </Link>
        </div>
      </div>
    </div>
  );
}