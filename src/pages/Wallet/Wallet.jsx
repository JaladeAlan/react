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
  const [gateway, setGateway] = useState("paystack");
  const [feePreview, setFeePreview] = useState(0);
  const [totalPreview, setTotalPreview] = useState(0);
  const [activeTab, setActiveTab] = useState("deposit");

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

  const getStatusColor = (status) => {
    if (!status) return "text-gray-400";
    const s = status.toLowerCase();
    if (s.includes("complete")) return "text-emerald-600";
    if (s.includes("pend")) return "text-amber-500";
    if (s.includes("fail") || s.includes("reject")) return "text-red-600";
    return "text-gray-500";
  };

  const getStatusBg = (status) => {
    if (!status) return "bg-gray-100";
    const s = status.toLowerCase();
    if (s.includes("complete")) return "bg-emerald-50";
    if (s.includes("pend")) return "bg-amber-50";
    if (s.includes("fail") || s.includes("reject")) return "bg-red-50";
    return "bg-gray-50";
  };

  const handleDepositKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDeposit();
    }
  };

  const handleWithdrawKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleWithdraw();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">My Wallet</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-3xl p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-medium mb-2">Available Balance</p>
            <h2 className="text-5xl font-bold text-white mb-6">
              ₦{(balance / 100).toLocaleString()}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab("deposit")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2 rounded-xl text-sm font-medium transition-all"
              >
                + Add Money
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2 rounded-xl text-sm font-medium transition-all"
              >
                − Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Tabs */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === "deposit"
                  ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === "withdraw"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Withdraw
            </button>
          </div>

          <div className="p-6">
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
                        {p.toUpperCase()}
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
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">₦</span>
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
                    <p className="text-xs text-slate-500 mt-2">
                      A 2% transaction fee will be added
                    </p>
                  </div>

                  {depositAmount && Number(depositAmount) >= 1000 && (
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Deposit Amount</span>
                        <span className="font-semibold text-slate-800">₦{Number(depositAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Transaction Fee (2%)</span>
                        <span className="font-semibold text-slate-800">₦{feePreview.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
                        <span className="font-semibold text-slate-800">Total Amount</span>
                        <span className="font-bold text-emerald-600 text-lg">₦{totalPreview.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleDeposit}
                    disabled={loading === "deposit"}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold text-base shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === "deposit" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
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
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Maximum Withdrawal</p>
                    <p className="text-blue-700 mt-1">₦{(balance / 100).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Withdrawal Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">₦</span>
                      <input
                        type="number"
                        min={1000}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        onKeyDown={handleWithdrawKeyDown}
                        placeholder="1,000 minimum"
                        className="w-full border-2 border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
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
                  </div>

                  <button
                    onClick={handleWithdraw}
                    disabled={loading === "withdraw"}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-base shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === "withdraw" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
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
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-5">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t, index) => (
                <div
                 key={t.id ?? t.reference ?? `${t.type}-${t.date}-${index}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      t.type === "Deposit" ? "bg-emerald-100" : "bg-blue-100"
                    }`}>
                      {t.type === "Deposit" ? (
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{t.type}</p>
                      <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="font-bold text-slate-900 text-lg">
                      ₦{t.amount.toLocaleString()}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(t.status)} ${getStatusColor(t.status)}`}>
                      {t.status}
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