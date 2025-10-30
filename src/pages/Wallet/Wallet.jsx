import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ✅ Toast component (has access to navigate)
  const GoToSettingsToast = ({ message }) => (
    <div>
      <p>{message}</p>
      <button
        onClick={() => {
          toast.dismiss();
          navigate("/settings");
        }}
        className="mt-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
      >
        Go to Settings
      </button>
    </div>
  );

  // ✅ Fetch wallet data
  const fetchWalletData = async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get("/me"),
        api.get("/transactions/user"),
      ]);

      setBalance(walletRes.data.user.balance || 0);

      const filteredTx = (txRes.data.data || []).filter(
        (t) => t.type === "Deposit" || t.type === "Withdrawal"
      );
      setTransactions(filteredTx);
      setError(null);
    } catch (error) {
      handleApiError(error, setError);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // ✅ Deposit handler
  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = Number(depositAmount);

    if (!amount || isNaN(amount) || amount < 1000)
      return toast.error("Minimum deposit amount is ₦1,000");

    setLoading("deposit");
    try {
      const res = await api.post("/deposit", { amount });
      if (res.data.payment_url) {
        toast.info("Redirecting to Paystack...");
        window.location.href = res.data.payment_url;
      } else {
        toast.success(res.data.message || "Deposit initiated!");
        fetchWalletData();
      }
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setLoading(null);
    }
  };

  // ✅ Withdraw handler
 const handleWithdraw = async (e) => {
  e.preventDefault();
  const amount = Number(withdrawAmount);

  if (!amount || isNaN(amount) || amount < 1000)
    return toast.error("Minimum withdrawal amount is ₦1,000");
  if (!pin || pin.length !== 4)
    return toast.error("PIN must be exactly 4 digits");

  setLoading("withdraw");
  try {
    const res = await api.post("/withdraw", { amount, transaction_pin: pin });
    toast.success(res.data.message || "Withdrawal successful!");
    setWithdrawAmount("");
    setPin("");
    fetchWalletData();
  } catch (error) {
    // ✅ Check for "transaction pin not set"
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data?.message?.toLowerCase().includes("transaction pin not set")
    ) {
      toast.error(
        <GoToSettingsToast message={error.response.data.message} />,
        { autoClose: false }
      );
    }
    // ✅ Check for "insufficient funds"
    else if (
      error.response &&
      (error.response.status === 400 || error.response.status === 422) &&
      error.response.data?.message?.toLowerCase().includes("insufficient funds")
    ) {
      toast.error("Insufficient funds — please check your balance.");
    }
    // ✅ All other errors
    else {
      handleApiError(error, setError);
    }
  } finally {
    setLoading(null);
  }
};

  // ✅ Helper: Format date
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // ✅ Helper: Status color
  const getStatusColor = (status) => {
    if (!status) return "text-gray-400";
    const s = status.toLowerCase();
    if (s.includes("complete")) return "text-green-600";
    if (s.includes("pend")) return "text-yellow-500";
    if (s.includes("fail") || s.includes("reject")) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Wallet
      </h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Balance */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 text-center">
        <p className="text-gray-500">Available Balance</p>
        <h2 className="text-4xl font-bold text-green-600">
          ₦{Number(balance).toLocaleString()}
        </h2>
      </div>

      {/* Deposit Section */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-green-600 mb-4">
          Deposit Funds
        </h2>
        <form onSubmit={handleDeposit} className="space-y-4">
          <input
            type="number"
            min={1000}
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="₦1,000 minimum"
            className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading === "deposit"}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition"
          >
            {loading === "deposit" ? "Processing..." : "Deposit"}
          </button>
        </form>
      </div>

      {/* Withdraw Section */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-4">
          Withdraw Funds
        </h2>
        
         <p className="text-sm text-gray-500 mb-4">
          Max withdrawable: ₦{Number(balance).toLocaleString()}
         </p>
        
        <form onSubmit={handleWithdraw} className="space-y-4">
        <input
          type="number"
          min={1000}
          max={balance}
          value={withdrawAmount}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val > balance) {
              toast.warning("You cannot withdraw more than your available balance");
              setWithdrawAmount(balance);
            } else {
              setWithdrawAmount(e.target.value);
            }
          }}
          placeholder="₦1,000 minimum"
          className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none"
        />
          <input
            type="password"
            value={pin}
            maxLength={4}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="Enter 4-digit PIN"
            className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none tracking-widest text-center"
          />
          <button
            type="submit"
            disabled={loading === "withdraw"}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition"
          >
            {loading === "withdraw" ? "Processing..." : "Withdraw"}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Deposit & Withdrawal History
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No deposit or withdrawal yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.map((t, i) => (
              <div
                key={i}
                className="py-3 flex justify-between items-start text-sm"
              >
                <div>
                  <p
                    className={`font-medium ${
                      t.type === "Deposit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(t.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ₦{Number(t.amount).toLocaleString()}
                  </p>
                  <p className={`text-xs font-medium ${getStatusColor(t.status)}`}>
                    {t.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
