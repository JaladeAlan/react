import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import toast from "react-hot-toast";
import handleApiError from "../../utils/handleApiError";

export default function BankDetails() {
  const { user } = useAuth();
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get("/paystack/banks");
        const bankData = res.data.data || [];

        const uniqueBanks = Array.from(
          new Map(bankData.map((b) => [b.code, b])).values()
        );

        setBanks(uniqueBanks);
      } catch (err) {
        console.error("❌ Failed to load banks:", err);
        toast.error("Unable to load bank list. Please try again later.");
      }
    };

    fetchBanks();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!bankName || !accountNumber) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/user/bank-details", {
        bank_name: bankName,
        account_number: accountNumber,
      });

      // Backend returns account_name after resolving with Paystack
      setAccountName(res.data.account_name || "");
      toast.success(res.data.message || "Bank details updated successfully!");
    } catch (err) {
      console.error("❌ Bank update error:", err);
      handleApiError(err, (msg) => toast.error(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-sm border">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Bank Details
      </h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Bank Name Dropdown */}
        <div>
          <label className="block text-gray-700 mb-1">Bank Name</label>
          <select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="">Select Bank</option>
            {banks.map((bank, index) => (
              <option key={`${bank.code}-${index}`} value={bank.name}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Number Input */}
        <div>
          <label className="block text-gray-700 mb-1">Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            maxLength={12}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Enter your account number"
          />
        </div>

        {/* Account Name (readonly, appears after API verification) */}
        {accountName && (
          <div>
            <label className="block text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              value={accountName}
              readOnly
              className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Updating..." : "Update Bank Details"}
        </button>
      </form>
    </div>
  );
}
