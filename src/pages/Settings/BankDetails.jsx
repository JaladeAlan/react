import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import toast from "react-hot-toast";
import handleApiError from "../../utils/handleApiError";

export default function BankDetails() {
  const { user } = useAuth();
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [banks, setBanks] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Fetch user's existing bank details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/me");
        const data = res.data.user || res.data.data || res.data;

        const bank = data.bank_name?.trim() || "";
        const number = data.account_number?.trim() || "";
        const name = data.account_name?.trim() || "";

        setBankName(bank);
        setAccountNumber(number);
        setAccountName(name);

        if (bank && number && name) setIsLocked(true);
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
        toast.error("Unable to load your bank details.");
      }
    };
    fetchProfile();
  }, []);

  // Fetch all banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get("/paystack/banks");
        const bankList = res.data.data || [];
        setBanks(bankList);
      } catch (err) {
        console.error("❌ Failed to load banks:", err);
        toast.error("Unable to load bank list. Please try again later.");
      }
    };
    fetchBanks();
  }, []);

  // Automatically verify account number when valid
  useEffect(() => {
    const verifyAccount = async () => {
      if (!bankCode || accountNumber.length !== 10) return;

      setVerifying(true);
      try {
        const res = await api.post("/paystack/resolve-account", {
          account_number: accountNumber,
          bank_code: bankCode,
        });

        const resolvedName = res.data.data?.account_name || "";
        if (resolvedName) {
          setAccountName(resolvedName);
          toast.success("✅ Account verified successfully!");
        } else {
          setAccountName("");
          toast.error("Unable to verify account. Please check your details.");
        }
      } catch (err) {
        console.error("❌ Account verification error:", err);
        setAccountName("");
        toast.error("Account verification failed. Try again.");
      } finally {
        setVerifying(false);
      }
    };

    verifyAccount();
  }, [bankCode, accountNumber]);

  // Handle submit
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !accountName) {
      toast.error("Please fill in all fields and verify your account.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/user/bank-details", {
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
      });

      setIsLocked(true);
      toast.success(res.data.message || "Bank details saved successfully!");
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

      {isLocked ? (
        <div className="space-y-3">
          <div>
            <label className="block text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={bankName}
              readOnly
              className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              readOnly
              className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              value={accountName}
              readOnly
              className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700"
            />
          </div>

          <p className="text-sm text-gray-600 mt-2 text-center">
            🔒 Bank details are locked after being set once. Contact support to
            change them.
          </p>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Bank Name</label>
            <select
              value={bankCode}
              onChange={(e) => {
                const code = e.target.value;
                const bank = banks.find((b) => b.code === code);
                setBankCode(code);
                setBankName(bank?.name || "");
              }}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="">Select Bank</option>
              {banks.map((bank, index) => (
                <option key={`${bank.code}-${index}`} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, ""))
              }
              maxLength={10}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter your 10-digit account number"
            />
          </div>

          {verifying && (
            <p className="text-sm text-blue-500">Verifying account...</p>
          )}

          {accountName && !verifying && (
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

          <button
            type="submit"
            disabled={loading || verifying || !accountName}
            className={`w-full py-2 px-4 rounded-lg text-white transition ${
              loading || verifying || !accountName
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save Bank Details"}
          </button>
        </form>
      )}
    </div>
  );
}
