import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";

export default function Wallet() {
  const [balance, setBalance] = useState(0); // balance in kobo
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [gateway, setGateway] = useState("paystack");
  const [feePreview, setFeePreview] = useState(0);
  const [totalPreview, setTotalPreview] = useState(0);

  const navigate = useNavigate();

  /* ---------- Toast for PIN not set ---------- */
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

  /* ---------- Fetch wallet + transactions ---------- */
  const fetchWalletData = async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get("/me"),
        api.get("/transactions/user"),
      ]);

      setBalance(walletRes.data.user.balance_kobo || 0);

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

  /* ---------- Fee preview (naira int) ---------- */
  useEffect(() => {
    const amt = Number(depositAmount);

    if (!Number.isInteger(amt) || amt <= 0) {
      setFeePreview(0);
      setTotalPreview(0);
      return;
    }

    const fee = Math.round(amt * 0.02);
    setFeePreview(fee);
    setTotalPreview(amt + fee);
  }, [depositAmount]);

  /* ---------- Deposit ---------- */
  const handleDeposit = async (e) => {
    e.preventDefault();

    const amount = Number(depositAmount);

    if (!Number.isInteger(amount) || amount < 1000) {
      return toast.error("Minimum deposit amount is ₦1,000");
    }

    setLoading("deposit");

    try {
      const res = await api.post("/deposit", {
        amount, // naira int
        gateway,
      });

      if (res.data.payment_url) {
        toast.info(
          `Redirecting to ${gateway.toUpperCase()}...
Deposit: ₦${amount.toLocaleString()}
Fee: ₦${res.data.transaction_fee.toLocaleString()}
Total: ₦${res.data.total_amount.toLocaleString()}`
        );

        setTimeout(() => {
          window.location.assign(res.data.payment_url);
        }, 400);
      }
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setLoading(null);
    }
  };

  /* ---------- Withdraw ---------- */
  const handleWithdraw = async (e) => {
    e.preventDefault();

    const amount = Number(withdrawAmount);
    const max = balance / 100;

    if (!Number.isInteger(amount) || amount < 1000) {
      return toast.error("Minimum withdrawal amount is ₦1,000");
    }

    if (amount > max) {
      return toast.error("You cannot withdraw more than your available balance");
    }

    if (!/^\d{4}$/.test(pin)) {
      return toast.error("PIN must be exactly 4 digits");
    }

    setLoading("withdraw");

    try {
      const res = await api.post("/withdraw", {
        amount, // naira int
        transaction_pin: pin,
      });

      toast.success(res.data.message || "Withdrawal successful!");
      setWithdrawAmount("");
      setPin("");
      fetchWalletData();
    } catch (error) {
      if (
        error.response?.status === 403 &&
        error.response.data?.message
          ?.toLowerCase()
          .includes("transaction pin not set")
      ) {
        toast.error(
          <GoToSettingsToast message={error.response.data.message} />,
          { autoClose: false }
        );
      } else if (
        [400, 422].includes(error.response?.status) &&
        error.response.data?.message
          ?.toLowerCase()
          .includes("insufficient funds")
      ) {
        toast.error("Insufficient funds — please check your balance.");
      } else {
        handleApiError(error, setError);
      }
    } finally {
      setLoading(null);
    }
  };

  /* ---------- Helpers ---------- */
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusColor = (status) => {
    if (!status) return "text-gray-400";
    const s = status.toLowerCase();
    if (s.includes("complete")) return "text-green-600";
    if (s.includes("pend")) return "text-yellow-500";
    if (s.includes("fail") || s.includes("reject")) return "text-red-600";
    return "text-gray-500";
  };

  /* ---------- UI ---------- */
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
      <h1 className="text-2xl font-semibold">Wallet</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Balance */}
      <div className="bg-white shadow rounded-2xl p-6 text-center">
        <p className="text-gray-500">Available Balance</p>
        <h2 className="text-4xl font-bold text-green-600">
          ₦{(balance / 100).toLocaleString()}
        </h2>
      </div>

      {/* Deposit */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-green-600">Deposit Funds</h2>
        <p className="text-xs text-gray-400">
          A 2% transaction fee will be added.
        </p>

        <div className="flex gap-3">
          {["paystack", "monnify"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setGateway(p)}
              className={`flex-1 py-2 rounded border ${
                gateway === p
                  ? "bg-green-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleDeposit} className="space-y-4">
          <input
            type="number"
            min={1000}
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="₦1,000 minimum"
            className="w-full border rounded p-3"
          />

          {depositAmount && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>Deposit: ₦{Number(depositAmount).toLocaleString()}</p>
              <p>Fee (2%): ₦{feePreview.toLocaleString()}</p>
              <p className="font-medium">
                Total: ₦{totalPreview.toLocaleString()}
              </p>
            </div>
          )}

          <button
            disabled={loading === "deposit"}
            className="w-full bg-green-600 text-white py-3 rounded"
          >
            {loading === "deposit" ? "Processing..." : "Deposit"}
          </button>
        </form>
      </div>

      {/* Withdraw */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Withdraw Funds</h2>
        <p className="text-sm text-gray-500">
          Max withdrawable: ₦{(balance / 100).toLocaleString()}
        </p>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <input
            type="number"
            min={1000}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="₦1,000 minimum"
            className="w-full border rounded p-3"
          />

          <input
            type="password"
            value={pin}
            maxLength={4}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="4-digit PIN"
            className="w-full border rounded p-3 text-center tracking-widest"
          />

          <button
            disabled={loading === "withdraw"}
            className="w-full bg-red-600 text-white py-3 rounded"
          >
            {loading === "withdraw" ? "Processing..." : "Withdraw"}
          </button>
        </form>
      </div>

      {/* Transactions */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Deposit & Withdrawal History
        </h2>

        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No deposit or withdrawal yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id || t.reference} className="border-t">
                  <td className="py-2 font-medium">{t.type}</td>
                  <td>{formatDate(t.date)}</td>
                  <td className="text-right">
                    ₦{t.amount.toLocaleString()}
                  </td>
                  <td
                    className={`text-right font-medium ${getStatusColor(
                      t.status
                    )}`}
                  >
                    {t.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
