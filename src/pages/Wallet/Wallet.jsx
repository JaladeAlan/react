import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
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
  const [gateway, setGateway] = useState("paystack");
  const [feePreview, setFeePreview] = useState(0);
  const [totalPreview, setTotalPreview] = useState(0);
  const [activeTab, setActiveTab] = useState("deposit");
  const [isLoadingData, setIsLoadingData] = useState(true);

  const navigate = useNavigate();

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

  const fetchWalletData = async () => {
    setIsLoadingData(true);
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
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

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

  const handleDeposit = async () => {
    const amount = Number(depositAmount);

    if (!Number.isInteger(amount) || amount < 1000) {
      return toast.error("Minimum deposit amount is ₦1,000");
    }

    setLoading("deposit");

    try {
      const res = await api.post("/deposit", {
        amount,
        gateway,
      });

      if (res.data.payment_url) {
        toast.info(
          `Redirecting to ${gateway.toUpperCase()}...
Deposit: ₦${amount.toLocaleString()}
Fee: ₦${res.data.transaction_fee.toLocaleString()}
Total: ₦${res.data.total_amount.toLocaleString()}`,
          { autoClose: 3000 }
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

  const handleWithdraw = async () => {
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
        amount,
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusIcon = (status) => {
    if (!status) return <Clock size={16} />;
    const s = status.toLowerCase();
    if (s.includes("complete")) return <CheckCircle size={16} />;
    if (s.includes("pend")) return <Clock size={16} />;
    if (s.includes("fail") || s.includes("reject")) return <XCircle size={16} />;
    return <AlertCircle size={16} />;
  };

  const getStatusColor = (status) => {
    if (!status) return "text-gray-500";
    const s = status.toLowerCase();
    if (s.includes("complete")) return "text-emerald-600";
    if (s.includes("pend")) return "text-amber-600";
    if (s.includes("fail") || s.includes("reject")) return "text-red-600";
    return "text-gray-500";
  };

  const getStatusBg = (status) => {
    if (!status) return "bg-gray-50 border-gray-200";
    const s = status.toLowerCase();
    if (s.includes("complete")) return "bg-emerald-50 border-emerald-200";
    if (s.includes("pend")) return "bg-amber-50 border-amber-200";
    if (s.includes("fail") || s.includes("reject")) return "bg-red-50 border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  const handleDepositKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleDeposit();
    }
  };

  const handleWithdrawKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleWithdraw();
    }
  };

  const quickAmounts = [1000, 5000, 10000, 50000];

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Container - REQUIRED for toasts to show */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <WalletIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                My Wallet
              </h1>
              <p className="text-sm text-slate-500">
                Manage your funds securely
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={20} className="text-blue-200" />
              <p className="text-blue-100 text-sm font-medium">
                Available Balance
              </p>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              ₦{(balance / 100).toLocaleString()}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab("deposit")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              >
                <ArrowDownCircle size={16} />
                Add Money
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              >
                <ArrowUpCircle size={16} />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Tabs */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "deposit"
                  ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <TrendingUp size={18} />
              Deposit
            </button>
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "withdraw"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <TrendingDown size={18} />
              Withdraw
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "deposit" ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Select Payment Gateway
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["paystack", "monnify"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setGateway(p)}
                        className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                          gateway === p
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300"
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Amount to Deposit
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">
                        ₦
                      </span>
                      <input
                        type="number"
                        min={1000}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        onKeyDown={handleDepositKeyDown}
                        placeholder="1,000 minimum"
                        className="w-full border-2 border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                      />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setDepositAmount(amount.toString())}
                          className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 rounded-lg transition-all"
                        >
                          ₦{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      A 2% transaction fee will be added
                    </p>
                  </div>

                  {depositAmount && Number(depositAmount) >= 1000 && (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Deposit Amount</span>
                        <span className="font-semibold text-slate-800">
                          ₦{Number(depositAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          Transaction Fee (2%)
                        </span>
                        <span className="font-semibold text-slate-800">
                          ₦{feePreview.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
                        <span className="font-semibold text-slate-800">
                          Total Amount
                        </span>
                        <span className="font-bold text-emerald-600 text-lg">
                          ₦{totalPreview.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleDeposit}
                    disabled={loading === "deposit" || !depositAmount || Number(depositAmount) < 1000}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold text-base shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === "deposit" ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      "Continue to Payment"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      Maximum Withdrawal
                    </p>
                    <p className="text-blue-700 mt-1 font-semibold">
                      ₦{(balance / 100).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Withdrawal Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">
                        ₦
                      </span>
                      <input
                        type="number"
                        min={1000}
                        max={balance / 100}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        onKeyDown={handleWithdrawKeyDown}
                        placeholder="1,000 minimum"
                        className="w-full border-2 border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>

                    {/* Quick Amount Buttons for Withdrawal */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quickAmounts
                        .filter((amt) => amt <= balance / 100)
                        .map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setWithdrawAmount(amount.toString())}
                            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-lg transition-all"
                          >
                            ₦{amount.toLocaleString()}
                          </button>
                        ))}
                      {balance / 100 > 1000 && (
                        <button
                          type="button"
                          onClick={() =>
                            setWithdrawAmount((balance / 100).toString())
                          }
                          className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                        >
                          Max: ₦{(balance / 100).toLocaleString()}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Transaction PIN
                    </label>
                    <input
                      type="password"
                      value={pin}
                      maxLength={4}
                      onChange={(e) =>
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      onKeyDown={handleWithdrawKeyDown}
                      placeholder="••••"
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Enter your 4-digit transaction PIN
                    </p>
                  </div>

                  <button
                    onClick={handleWithdraw}
                    disabled={loading === "withdraw" || !withdrawAmount || !pin || pin.length !== 4}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-base shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === "withdraw" ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      "Withdraw Funds"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800">
              Transaction History
            </h2>
            {transactions.length > 0 && (
              <span className="text-sm text-slate-500">
                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">
                No transactions yet
              </p>
              <p className="text-slate-400 text-xs">
                Your wallet transactions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t, index) => (
                <div
                  key={t.id ?? t.reference ?? `${t.type}-${t.date}-${index}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        t.type === "Deposit"
                          ? "bg-emerald-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {t.type === "Deposit" ? (
                        <ArrowDownCircle
                          size={20}
                          className="text-emerald-600"
                        />
                      ) : (
                        <ArrowUpCircle size={20} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm sm:text-base">
                        {t.type}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                    <p className="font-bold text-slate-900 text-base sm:text-lg">
                      {t.type === "Deposit" ? "+" : "-"}₦
                      {t.amount.toLocaleString()}
                    </p>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBg(
                        t.status
                      )} ${getStatusColor(t.status)}`}
                    >
                      {getStatusIcon(t.status)}
                      <span className="hidden sm:inline">{t.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}