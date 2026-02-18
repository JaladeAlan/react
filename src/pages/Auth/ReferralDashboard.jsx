import { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function ReferralDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/referrals/dashboard");
      setDashboard(res.data.data);
    } catch (err) {
      toast.error("Failed to load referral dashboard");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(dashboard.referral_link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const koboToNaira = (kobo) => (kobo / 100).toLocaleString();

  const claimReward = async (rewardId) => {
    try {
      await api.post(`/referrals/rewards/${rewardId}/claim`);
      toast.success("Reward claimed successfully!");
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to claim reward");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Referral Dashboard</h1>

      {/* Referral Link Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={dashboard?.referral_link || ""}
            readOnly
            className="flex-1 p-3 rounded bg-white text-gray-900"
          />
          <button
            onClick={copyReferralLink}
            className="px-6 py-3 bg-white text-blue-600 rounded font-medium hover:bg-gray-100"
          >
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-sm opacity-90">Your Referral Code:</p>
          <code className="text-2xl font-bold">{dashboard?.referral_code}</code>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Referrals</div>
          <div className="text-3xl font-bold text-gray-900">
            {dashboard?.total_referrals || 0}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-600">
            {dashboard?.completed_referrals || 0}
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">
            {dashboard?.pending_referrals || 0}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Unclaimed Rewards</div>
          <div className="text-3xl font-bold text-blue-600">
            ₦{koboToNaira(dashboard?.unclaimed_rewards || 0)}
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      {dashboard?.rewards && dashboard.rewards.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold mb-4">Your Rewards</h2>
          <div className="space-y-3">
            {dashboard.rewards.map((reward) => (
              <div
                key={reward.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  reward.claimed
                    ? "bg-gray-50 border-gray-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div>
                  <div className="font-medium">
                    {reward.reward_type === "cashback" && (
                      <span>💰 Cashback Reward</span>
                    )}
                    {reward.reward_type === "discount" && (
                      <span>🎟️ Discount Reward</span>
                    )}
                    {reward.reward_type === "bonus_units" && (
                      <span>🎁 Bonus Units</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {reward.reward_type === "cashback" &&
                      `₦${koboToNaira(reward.amount_kobo)}`}
                    {reward.reward_type === "discount" &&
                      `${reward.discount_percentage}% off your next purchase`}
                    {reward.reward_type === "bonus_units" &&
                      `${reward.units} bonus units`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    From referral: {reward.referral.referred_user.name}
                  </div>
                </div>
                <div>
                  {reward.claimed ? (
                    <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm">
                      ✓ Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => claimReward(reward.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      Claim Reward
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referrals List */}
      {dashboard?.referrals && dashboard.referrals.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Your Referrals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboard.referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {referral.referred_user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {referral.referred_user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {referral.status === "completed" ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(referral.referred_user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {dashboard?.referrals?.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold mb-2">No Referrals Yet</h3>
          <p className="text-gray-600 mb-6">
            Share your referral link with friends to earn rewards!
          </p>
          <button
            onClick={copyReferralLink}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Copy Referral Link
          </button>
        </div>
      )}

      {/* How It Works */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          How Referrals Work
        </h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li>1. Share your unique referral link with friends</li>
          <li>2. They sign up using your link</li>
          <li>3. When they make their first purchase, your referral is completed</li>
          <li>4. You both receive rewards!</li>
          <li>5. Claim your rewards to add them to your account</li>
        </ol>
      </div>
    </div>
  );
}