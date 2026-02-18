import { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function AdminReferralManagement() {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await api.get("/admin/referrals/stats");
      setStats(statsRes.data.data);

      // Fetch referrals
      const referralsRes = await api.get(
        `/admin/referrals${filter !== "all" ? `?status=${filter}` : ""}`
      );
      setReferrals(referralsRes.data.data.data);
    } catch (err) {
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const koboToNaira = (kobo) => (kobo / 100).toLocaleString();

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading referral data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Referral System Management</h1>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Referrals</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total_referrals}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Completed Referrals</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.completed_referrals}
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Pending Referrals</div>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending_referrals}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Rewards Issued</div>
            <div className="text-3xl font-bold text-blue-600">
              ₦{koboToNaira(stats.total_rewards_issued)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Unclaimed: ₦{koboToNaira(stats.unclaimed_rewards)}
            </div>
          </div>
        </div>
      )}

      {/* Top Referrers */}
      {stats?.top_referrers && stats.top_referrers.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold mb-4">Top Referrers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Referral Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Referrals
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.top_referrers.map((referrer, index) => (
                  <tr key={referrer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                        {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                        {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {referrer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {referrer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {referrer.referral_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-blue-600">
                        {referrer.referrals_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referrals List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-4">All Referrals</h2>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b -mb-6 pb-4">
            {["all", "pending", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 font-medium transition-colors ${
                  filter === status
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No {filter !== "all" ? filter : ""} referrals found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Referred User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {referral.referrer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.referrer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {referral.referred_user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.referred_user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(referral.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {referral.completed_at
                        ? new Date(referral.completed_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Referral Info Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          How the Referral System Works
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Users share their unique referral code with friends</li>
          <li>• New users register with the referral code</li>
          <li>• Referral status is "pending" until the new user makes their first purchase</li>
          <li>• Once the first purchase is made, referral becomes "completed"</li>
          <li>• Both the referrer and referred user receive rewards</li>
          <li>• Rewards can be customized in the backend (ReferralController.php)</li>
        </ul>
      </div>
    </div>
  );
}